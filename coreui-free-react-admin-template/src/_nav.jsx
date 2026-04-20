/**
 * Navigation configuration for the SmartSeason sidebar.
 *
 * Changed from a static array to a function that accepts the current user
 * and returns only the nav items that user is allowed to see.
 *
 * Usage in AppSidebar:
 *   import { getNavItems } from './_nav'
 *   const navItems = getNavItems(user)
 */
import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilNotes, cilPeople, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

/**
 * Returns an array of CoreUI nav items filtered by the user's role.
 * @param {Object|null} user  — The user object from AuthContext (can be null)
 */
export const getNavItems = (user) => {
  const isAdmin = user?.role === 'admin'

  const items = [
    // ── Main section (visible to all roles) ──────────────────────────────
    {
      component: CNavTitle,
      name: 'Main',
    },
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Fields',
      to: '/fields',
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    },

    // ── Account section (visible to all roles) ────────────────────────────
    {
      component: CNavTitle,
      name: 'Account',
    },
    {
      component: CNavItem,
      name: 'My Profile',
      to: '/profile',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
  ]

  // ── Administration section (admin only) ──────────────────────────────────
  if (isAdmin) {
    items.push(
      {
        component: CNavTitle,
        name: 'Administration',
      },
      {
        component: CNavItem,
        name: 'User Management',
        to: '/users',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
      },
    )
  }

  return items
}

// Keep a default export for any existing code that imports the static array.
// It returns the admin-inclusive full nav; role filtering happens at render time.
const _nav = getNavItems({ role: 'admin' })
export default _nav
