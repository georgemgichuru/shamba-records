import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { Sprout, Wheat, BarChart3, CalendarDays, Users, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: <BarChart3 size={18} className="me-2" />, text: 'Dashboard Insights' },
    { icon: <CalendarDays size={18} className="me-2" />, text: 'Stage Tracking' },
    { icon: <Users size={18} className="me-2" />, text: 'Multi-role Access' },
    { icon: <AlertTriangle size={18} className="me-2" />, text: 'Risk Monitoring' }
  ]

  return (
    <div className="ss-auth-page d-flex align-items-center min-vh-100">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg={9} xl={8}>
            <CCard className="ss-auth-card overflow-hidden" style={{ border: 'none' }}>
              <CRow className="g-0">
                {/* Left - Form */}
                <CCol md={6}>
                  <CCardBody className="p-4 p-lg-5">
                    <div className="mb-4">
                      <div className="ss-auth-brand mb-1 d-flex align-items-center gap-2">
                        <Sprout size={28} color="#2e7d32" /> Smart<span>Season</span>
                      </div>
                      <p className="text-muted small mb-0 ms-5 ps-1">Field Monitoring System</p>
                    </div>

                    <h4 className="fw-bold mb-1" style={{ color: '#1b5e20' }}>Welcome back</h4>
                    <p className="text-muted small mb-4">Sign in to manage your fields</p>

                    {error && (
                      <CAlert color="danger" className="small py-2">
                        {error}
                      </CAlert>
                    )}

                    <CForm onSubmit={handleLogin}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">Username</label>
                        <CInputGroup>
                          <CInputGroupText style={{ background: '#f8fdf8', border: '1px solid #c8e6c9' }}>
                            <CIcon icon={cilUser} style={{ color: '#2e7d32' }} />
                          </CInputGroupText>
                          <CFormInput
                            placeholder="Enter your username"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ border: '1px solid #c8e6c9' }}
                            required
                          />
                        </CInputGroup>
                      </div>

                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-muted">Password</label>
                        <CInputGroup>
                          <CInputGroupText style={{ background: '#f8fdf8', border: '1px solid #c8e6c9' }}>
                            <CIcon icon={cilLockLocked} style={{ color: '#2e7d32' }} />
                          </CInputGroupText>
                          <CFormInput
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ border: '1px solid #c8e6c9' }}
                            required
                          />
                        </CInputGroup>
                      </div>

                      <CButton
                        type="submit"
                        color="success"
                        className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
                        disabled={loading}
                        style={{ background: '#2e7d32', border: 'none', borderRadius: '8px' }}
                      >
                        {loading && <CSpinner size="sm" className="me-2" />}
                        {loading ? 'Signing in...' : 'Sign In'}
                      </CButton>
                    </CForm>

                    <div className="text-center mt-3">
                      <span className="text-muted small">Don&apos;t have an account? </span>
                      <Link to="/register" className="small fw-semibold" style={{ color: '#2e7d32' }}>
                        Register
                      </Link>
                    </div>
                  </CCardBody>
                </CCol>

                {/* Right - Info Panel */}
                <CCol md={6} className="ss-auth-right d-none d-md-flex">
                  <div>
                    <div className="mb-3"><Wheat size={64} color="#a5d6a7" /></div>
                    <h3 className="fw-bold mb-3">Manage Your Fields</h3>
                    <p className="opacity-75 small mb-4">
                      Track crop progress, monitor field stages, and get real-time insights
                      across your entire growing season.
                    </p>
                    <div className="d-flex flex-column gap-2 text-start mx-auto" style={{ width: 'fit-content' }}>
                      {features.map((item, i) => (
                        <div key={i} className="d-flex align-items-center p-1" style={{ opacity: 0.9 }}>
                          {item.icon} <span className="small">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CCol>
              </CRow>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
