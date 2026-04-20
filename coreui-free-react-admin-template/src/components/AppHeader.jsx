import React, { useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle,
  CHeader, CHeaderNav, CHeaderToggler, CNavLink, CNavItem, useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast, cilMenu, cilMoon, cilSun } from '@coreui/icons'
import { Crown, Wheat, User, Users, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AppBreadcrumb } from './index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('smartseason-theme')
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current?.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  const getRoleBadgeColor = (role) => role === 'admin' ? '#f9a825' : '#a5d6a7'

  const getRoleLabel = (role) => (
    role === 'admin'
      ? <span className="d-flex align-items-center gap-1"><Crown size={11} /> Admin</span>
      : <span className="d-flex align-items-center gap-1"><Wheat size={11} /> Field Agent</span>
  )

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/dashboard" as={NavLink} style={{ fontWeight: 500 }}>Dashboard</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/fields" as={NavLink} style={{ fontWeight: 500 }}>Fields</CNavLink>
          </CNavItem>
          {user?.role === 'admin' && (
            <CNavItem>
              <CNavLink to="/users" as={NavLink} style={{ fontWeight: 500 }}>Users</CNavLink>
            </CNavItem>
          )}
        </CHeaderNav>

        <CHeaderNav className="ms-auto align-items-center">
          {/* Theme switcher */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? <CIcon icon={cilMoon} size="lg" /> :
               colorMode === 'auto' ? <CIcon icon={cilContrast} size="lg" /> :
               <CIcon icon={cilSun} size="lg" />}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem active={colorMode === 'light'} as="button" type="button" onClick={() => setColorMode('light')}>
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'dark'} as="button" type="button" onClick={() => setColorMode('dark')}>
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'auto'} as="button" type="button" onClick={() => setColorMode('auto')}>
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          <li className="nav-item py-1"><div className="vr h-100 mx-2 text-body text-opacity-75"></div></li>

          {/* User dropdown */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} className="py-0 pe-0 d-flex align-items-center gap-2">
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2e7d32, #43a047)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem'
              }}>
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="d-none d-md-block" style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
                </div>
                <div style={{
                  fontSize: '0.7rem', color: getRoleBadgeColor(user?.role), fontWeight: 500
                }}>
                  {getRoleLabel(user?.role)}
                </div>
              </div>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end" style={{ minWidth: 200 }}>
              <div className="px-3 py-2 border-bottom" style={{ background: '#f8fdf8' }}>
                <div className="fw-semibold small">{user?.username}</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{user?.email}</div>
              </div>
              <CDropdownItem onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                <User size={16} className="me-2" /> My Profile
              </CDropdownItem>
              {user?.role === 'admin' && (
                <CDropdownItem onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
                  <Users size={16} className="me-2" /> Manage Users
                </CDropdownItem>
              )}
              <hr className="dropdown-divider" />
              <CDropdownItem onClick={logout} style={{ cursor: 'pointer', color: '#c62828' }}>
                <LogOut size={16} className="me-2" /> Logout
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
      </CContainer>

      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
