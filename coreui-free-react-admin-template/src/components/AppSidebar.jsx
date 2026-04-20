import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CCloseButton, CSidebar, CSidebarBrand, CSidebarFooter, CSidebarHeader, CSidebarToggler } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import { getNavItems } from '../_nav'
import { useAuth } from '../context/AuthContext'
import { Sprout } from 'lucide-react'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { user } = useAuth()
  const navigation = getNavItems(user)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
    >
      <CSidebarHeader className="border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
        <CSidebarBrand to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Sprout size={24} color="#a5d6a7" />
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>
              Smart<span style={{ color: '#f9a825' }}>Season</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Field Monitor
            </div>
          </div>
        </CSidebarBrand>
        <CCloseButton className="d-lg-none" dark onClick={() => dispatch({ type: 'set', sidebarShow: false })} />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
        <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })} />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
