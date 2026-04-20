import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import { ShieldX } from 'lucide-react'
import './scss/style.scss'
import { AuthProvider, useAuth } from './context/AuthContext'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// ── Route guards ────────────────────────────────────────────────────────────

/**
 * ProtectedRoute — Requires the user to be authenticated.
 * Unauthenticated users are redirected to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="pt-3 text-center"><CSpinner color="success" variant="grow" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

/**
 * PublicRoute — Accessible only when NOT logged in.
 * Authenticated users are redirected to /dashboard.
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="pt-3 text-center"><CSpinner color="success" variant="grow" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

/**
 * RoleRoute — Requires the user to be authenticated AND have one of the
 * specified roles. On failure, renders a "403 Access Denied" page.
 *
 * Usage:
 *   <RoleRoute allowedRoles={['admin']}>
 *     <UserManagement />
 *   </RoleRoute>
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="pt-3 text-center"><CSpinner color="success" variant="grow" /></div>
  if (!user) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-3">
        <ShieldX size={64} style={{ color: '#c62828' }} />
        <h2 className="fw-bold mt-3" style={{ color: '#1b5e20' }}>Access Denied</h2>
        <p className="text-muted">
          You don&apos;t have permission to view this page.
          <br />
          This area is restricted to <strong>{allowedRoles.join(' / ')}</strong> users.
        </p>
        <button
          className="btn btn-success mt-2"
          onClick={() => { window.location.hash = '#/dashboard' }}
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return children
}

// ── App routes ──────────────────────────────────────────────────────────────

const AppRoutes = () => {
  const { isColorModeSet, setColorMode } = useColorModes('smartseason-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) setColorMode(theme)
    if (isColorModeSet()) return
    // Default to light theme if no stored preference
    setColorMode(storedTheme || 'light')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Suspense fallback={<div className="min-vh-100 d-flex align-items-center justify-content-center"><CSpinner color="success" variant="grow" /></div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    name="Login Page"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" name="Register Page" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/404"      name="Page 404"      element={<Page404 />} />
        <Route path="/500"      name="Page 500"      element={<Page500 />} />

        {/* Protected app shell — handles /dashboard, /fields, /profile, etc. */}
        <Route path="*" name="Home" element={<ProtectedRoute><DefaultLayout /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  )
}

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}

export default App
