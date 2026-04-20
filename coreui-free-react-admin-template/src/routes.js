/**
 * Application route definitions.
 *
 * Each route carries an optional `roles` array.
 * AppContent uses this to wrap routes with RoleRoute guards.
 * Routes without a `roles` array are accessible to all authenticated users.
 */
import React from 'react'

// Dashboard — all roles
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Fields — all roles (data filtered server-side by role)
const FieldList = React.lazy(() => import('./views/fields/FieldList'))

// Users — admin only
const UserManagement = React.lazy(() => import('./views/users/UserManagement'))

// Profile — all roles
const UserProfile = React.lazy(() => import('./views/profile/UserProfile'))

export const routes = [
  { path: '/',        exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard',       element: Dashboard },
{ path: '/fields',    name: 'Fields',          element: FieldList, roles: ['admin', 'agent'] },

  { path: '/profile',   name: 'My Profile',      element: UserProfile },
  { path: '/users',     name: 'User Management', element: UserManagement, roles: ['admin'] },
]

export default routes
