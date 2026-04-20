/**
 * Public registration page.
 *
 * RBAC changes vs original:
 * - The role dropdown is REMOVED. All public self-registrations are forced
 *   to `agent` by the backend. Only admins can create admin accounts via
 *   the User Management panel.
 * - Password confirmation field added for UX safety.
 */
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
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeOpen, cilPhone } from '@coreui/icons'
import { Sprout, Wheat, TrendingUp, Handshake, Bell, Key, CheckCircle } from 'lucide-react'
import api from '../../../utils/api'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'agent',
    phone_number: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { password_confirm, ...payload } = formData
      await api.post('auth/register/', payload)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Registration failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { border: '1px solid #c8e6c9' }
  const iconStyle = { background: '#f8fdf8', border: '1px solid #c8e6c9' }

  const features = [
    { icon: <Wheat size={18} className="me-2" />, text: 'Monitor your assigned fields' },
    { icon: <TrendingUp size={18} className="me-2" />, text: 'Track crop progress' },
    { icon: <Handshake size={18} className="me-2" />, text: 'Collaborate with coordinators' },
    { icon: <Bell size={18} className="me-2" />, text: 'Stay updated on risks' }
  ]

  return (
    <div className="ss-auth-page d-flex align-items-center min-vh-100">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg={9} xl={8}>
            <CCard className="ss-auth-card overflow-hidden">
              <CRow className="g-0">
                {/* Left — Info panel */}
                <CCol md={5} className="ss-auth-right d-none d-md-flex">
                  <div>
                    <div className="mb-3"><Sprout size={64} color="#a5d6a7" /></div>
                    <h3 className="fw-bold mb-3">Join SmartSeason</h3>
                    <p className="opacity-75 small mb-4">
                      Create your field agent account to start monitoring fields,
                      tracking crop stages, and collaborating with your team.
                    </p>
                    <div className="d-flex flex-column gap-2 text-start mx-auto" style={{ width: 'fit-content' }}>
                      {features.map((item, i) => (
                        <div key={i} className="small d-flex align-items-center" style={{ opacity: 0.9 }}>
                          {item.icon} {item.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded d-flex align-items-start gap-2 text-start" style={{ background: 'rgba(0,0,0,0.15)', fontSize: '0.75rem' }}>
                      <Key size={16} className="flex-shrink-0 mt-1 text-warning" />
                      <span><strong>Admin accounts</strong> are created by system administrators only.</span>
                    </div>
                  </div>
                </CCol>

                {/* Right — Form */}
                <CCol md={7}>
                  <CCardBody className="p-4 p-lg-5">
                    <div className="mb-4">
                      <div className="ss-auth-brand mb-1 d-flex align-items-center gap-2">
                        <Sprout size={28} color="#2e7d32" /> Smart<span>Season</span>
                      </div>
                    </div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1b5e20' }}>Create Agent Account</h4>
                    <p className="text-muted small mb-4">Fill in your details to get started as a Field Agent</p>

                    {success && (
                      <CAlert color="success" className="small py-2 d-flex align-items-center">
                        <CheckCircle size={16} className="me-2" /> Account created! Redirecting to login…
                      </CAlert>
                    )}
                    {error && <CAlert color="danger" className="small py-2">{error}</CAlert>}

                    <CForm onSubmit={handleRegister}>
                      <CRow className="mb-3">
                        <CCol>
                          <label className="form-label small fw-semibold text-muted">First Name</label>
                          <CFormInput name="first_name" placeholder="First name" style={inputStyle}
                            value={formData.first_name} onChange={handleChange} />
                        </CCol>
                        <CCol>
                          <label className="form-label small fw-semibold text-muted">Last Name</label>
                          <CFormInput name="last_name" placeholder="Last name" style={inputStyle}
                            value={formData.last_name} onChange={handleChange} />
                        </CCol>
                      </CRow>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">Username *</label>
                        <CInputGroup>
                          <CInputGroupText style={iconStyle}><CIcon icon={cilUser} style={{ color: '#2e7d32' }} /></CInputGroupText>
                          <CFormInput name="username" placeholder="Choose a username" style={inputStyle}
                            value={formData.username} onChange={handleChange} required />
                        </CInputGroup>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">Email *</label>
                        <CInputGroup>
                          <CInputGroupText style={iconStyle}><CIcon icon={cilEnvelopeOpen} style={{ color: '#2e7d32' }} /></CInputGroupText>
                          <CFormInput name="email" type="email" placeholder="Email address" style={inputStyle}
                            value={formData.email} onChange={handleChange} required />
                        </CInputGroup>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">Phone Number</label>
                        <CInputGroup>
                          <CInputGroupText style={iconStyle}><CIcon icon={cilPhone} style={{ color: '#2e7d32' }} /></CInputGroupText>
                          <CFormInput name="phone_number" placeholder="+254 7XX XXX XXX" style={inputStyle}
                            value={formData.phone_number} onChange={handleChange} />
                        </CInputGroup>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">Role *</label>
                        <CInputGroup>
                          <CInputGroupText style={iconStyle}><CIcon icon={cilUser} style={{ color: '#2e7d32' }} /></CInputGroupText>
                          <CFormSelect 
                            name="role" 
                            style={inputStyle} 
                            value={formData.role} 
                            onChange={handleChange}
                            required
                          >
                            <option value="agent">Field Agent</option>
                            <option value="admin">Admin (Requires Approval)</option>
                          </CFormSelect>
                        </CInputGroup>
                        <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                          Note: Admin accounts require activation by a system administrator.
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">Password * (min 8 characters)</label>
                        <CInputGroup>
                          <CInputGroupText style={iconStyle}><CIcon icon={cilLockLocked} style={{ color: '#2e7d32' }} /></CInputGroupText>
                          <CFormInput name="password" type="password" placeholder="Create a password" style={inputStyle}
                            value={formData.password} onChange={handleChange} required minLength={8} />
                        </CInputGroup>
                      </div>

                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-muted">Confirm Password *</label>
                        <CInputGroup>
                          <CInputGroupText style={iconStyle}><CIcon icon={cilLockLocked} style={{ color: '#2e7d32' }} /></CInputGroupText>
                          <CFormInput name="password_confirm" type="password" placeholder="Repeat your password" style={inputStyle}
                            value={formData.password_confirm} onChange={handleChange} required />
                        </CInputGroup>
                      </div>

                      <CButton type="submit" color="success" className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
                        disabled={loading}
                        style={{ background: '#2e7d32', border: 'none', borderRadius: '8px' }}>
                        {loading && <CSpinner size="sm" className="me-2" />}
                        {loading ? 'Creating Account…' : 'Create Field Agent Account'}
                      </CButton>
                    </CForm>

                    <div className="text-center mt-3">
                      <span className="text-muted small">Already have an account? </span>
                      <Link to="/login" className="small fw-semibold" style={{ color: '#2e7d32' }}>Sign in</Link>
                    </div>
                  </CCardBody>
                </CCol>
              </CRow>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
