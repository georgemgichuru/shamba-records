/**
 * AppContent Component
 *
 * Main content area that renders routes defined in routes.js.
 * Handles lazy loading with Suspense and applies RoleRoute guards
 * to routes that require specific user roles.
 */
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import { useAuth } from '../context/AuthContext'
import { routes } from '../routes'

/**
 * Inline RoleRoute for sub-routes inside the DefaultLayout shell.
 * Renders a styled 403 message instead of an external redirect.
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <div style={{ fontSize: '3.5rem' }}>🔒</div>
        <h4 className="fw-bold mt-3" style={{ color: '#1b5e20' }}>Access Restricted</h4>
        <p className="text-muted small">
          This page is only accessible to <strong>{allowedRoles.join(' or ')}</strong> users.
        </p>
      </div>
    )
  }
  return children
}

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<div className="text-center py-5"><CSpinner style={{ color: '#2e7d32' }} /></div>}>
        <Routes>
          {routes.map((route, idx) => {
            if (!route.element) return null
            const Element = route.element
            const routeElement = route.roles
              ? <RoleRoute allowedRoles={route.roles}><Element /></RoleRoute>
              : <Element />

            return (
              <Route
                key={idx}
                path={route.path}
                exact={route.exact}
                name={route.name}
                element={routeElement}
              />
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
