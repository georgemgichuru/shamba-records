/**
 * Axios instance pre-configured for the SmartSeason API.
 *
 * Features:
 * - Automatically attaches the JWT Bearer token to every request.
 * - On 401 responses, attempts a silent token refresh before giving up.
 *   If the refresh succeeds, the original request is retried once.
 *   If the refresh fails, the user is logged out and sent to /login.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
})

// ── Request interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor — silent refresh on 401 ──────────────────────────
let isRefreshing = false          // Prevents concurrent refresh calls
let failedQueue = []              // Holds requests that arrived while refreshing

/**
 * Drains the queue of requests that waited for the refresh to complete.
 * If the refresh succeeded, replay them with the new token.
 * If it failed, reject them all.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

const clearAuthAndRedirect = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  window.location.hash = '#/login'
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt a silent refresh on 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retried) {
      const refreshToken = localStorage.getItem('refresh_token')

      // No refresh token — logout immediately
      if (!refreshToken) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return api(originalRequest)
        })
      }

      originalRequest._retried = true
      isRefreshing = true

      try {
        const { data } = await api.post(
          'auth/refresh/',
          { refresh: refreshToken },
        )

        const newAccessToken = data.access
        localStorage.setItem('access_token', newAccessToken)

        // simplejwt ROTATE_REFRESH_TOKENS=True sends a new refresh too
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh)
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        // Replay the original request with the fresh token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
