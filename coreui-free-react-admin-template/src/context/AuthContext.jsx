/**
 * AuthContext — Global authentication & role state.
 *
 * What's new vs the original:
 * - login() now reads the role, username, and full_name that the backend
 *   embeds directly in the login response body (from CustomTokenObtainPairSerializer).
 *   This means the UI knows the user's role immediately after login without
 *   waiting for a separate /profile/ fetch.
 * - Exposes isAdmin and isAgent boolean helpers for clean conditional rendering.
 * - logout() calls the backend blacklist endpoint to invalidate the refresh token.
 * - Stores the user object in both state and localStorage so a page refresh
 *   doesn't briefly show a loading spinner before the profile fetch resolves.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

/** Safely decode a JWT payload without an external library. */
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Restore the cached user from localStorage on first render
    // so we don't flash an empty layout before the profile fetch completes.
    try {
      const cached = localStorage.getItem('user_profile')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // --------------------------------------------------------------------------
  // Fetch the full profile from the backend and update state
  // --------------------------------------------------------------------------
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('auth/profile/')
      const profile = res.data
      setUser(profile)
      localStorage.setItem('user_profile', JSON.stringify(profile))
    } catch {
      // Token invalid or expired — clear everything
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_profile')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // On mount: if we have a token, verify it's still valid by fetching the profile
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [fetchProfile])

  // --------------------------------------------------------------------------
  // Login
  // --------------------------------------------------------------------------
  const login = async (username, password) => {
    const res = await api.post('auth/login/', { username, password })
    const { access, refresh, role, full_name, email } = res.data

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)

    // Build a minimal user object from the login response so the UI
    // can render immediately — profile fetch will fill in any extras.
    const immediateUser = {
      username: res.data.username || username,
      role,
      full_name,
      email,
    }
    setUser(immediateUser)
    localStorage.setItem('user_profile', JSON.stringify(immediateUser))

    // Then fetch the full profile to populate all fields (id, first_name, etc.)
    await fetchProfile()
  }

  // --------------------------------------------------------------------------
  // Logout — blacklist the refresh token on the backend
  // --------------------------------------------------------------------------
  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        await api.post('auth/logout/', { refresh: refreshToken })
      } catch {
        // Ignore — we'll clear locally regardless
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_profile')
    setUser(null)
    window.location.hash = '#/login'
  }

  // --------------------------------------------------------------------------
  // Role helpers
  // --------------------------------------------------------------------------
  const isAdmin = Boolean(user?.role === 'admin')
  const isAgent = Boolean(user?.role === 'agent')

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchProfile, isAdmin, isAgent }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
