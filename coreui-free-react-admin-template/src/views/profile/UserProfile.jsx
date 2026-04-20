import React, { useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CForm, CFormInput,
  CFormLabel, CButton, CAlert, CSpinner, CBadge,
} from '@coreui/react'
import { User, Crown, Wheat, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const roleBadgeStyle = (role) =>
  role === 'admin'
    ? { background: '#f9a825', color: '#333', padding: '4px 12px', borderRadius: 20, fontWeight: 600, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }
    : { background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: 20, fontWeight: 600, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }

const UserProfile = () => {
  const { user, fetchProfile } = useAuth()
  const [formData, setFormData] = useState({
    first_name:   user?.first_name   || '',
    last_name:    user?.last_name    || '',
    email:        user?.email        || '',
    phone_number: user?.phone_number || '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await api.patch('auth/profile/', formData)
      await fetchProfile()
      setSuccess(true)
    } catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || '?'
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
          <User size={24} /> My Profile
        </h4>
        <p className="text-muted small mb-0 ms-4 ps-2">View and update your personal information</p>
      </div>

      <CRow className="g-4">
        {/* Profile card */}
        <CCol md={4}>
          <CCard className="text-center" style={{ border: '1px solid #e8f5e9' }}>
            <CCardBody className="py-4">
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2e7d32, #43a047)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '2rem',
                margin: '0 auto 1rem',
              }}>
                {initials}
              </div>
              <h5 className="fw-bold mb-1">{displayName}</h5>
              <div className="text-muted small mb-3">@{user?.username}</div>
              <span style={roleBadgeStyle(user?.role)}>
                {user?.role === 'admin' ? <><Crown size={14} /> Admin (Coordinator)</> : <><Wheat size={14} /> Field Agent</>}
              </span>
              <div className="mt-3 text-muted" style={{ fontSize: '0.78rem' }}>
                Role cannot be changed from this page.<br />
                Contact an administrator for role changes.
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Edit form */}
        <CCol md={8}>
          <CCard style={{ border: '1px solid #e8f5e9' }}>
            <CCardBody className="p-4">
              <h6 className="fw-semibold mb-3" style={{ color: '#2e7d32' }}>Edit Information</h6>

              {success && (
                <CAlert color="success" className="small py-2 mb-3 d-flex align-items-center gap-2">
                  <CheckCircle size={16} /> Profile updated successfully!
                </CAlert>
              )}
              {error && (
                <CAlert color="danger" className="small py-2 mb-3">{error}</CAlert>
              )}

              <CForm onSubmit={handleSave}>
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormLabel className="small fw-semibold text-muted">First Name</CFormLabel>
                    <CFormInput
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      style={{ border: '1px solid #c8e6c9' }}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="small fw-semibold text-muted">Last Name</CFormLabel>
                    <CFormInput
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      style={{ border: '1px solid #c8e6c9' }}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel className="small fw-semibold text-muted">Email Address</CFormLabel>
                    <CFormInput
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      style={{ border: '1px solid #c8e6c9' }}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel className="small fw-semibold text-muted">Phone Number</CFormLabel>
                    <CFormInput
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="+254 7XX XXX XXX"
                      style={{ border: '1px solid #c8e6c9' }}
                    />
                  </CCol>
                </CRow>

                <div className="mt-4">
                  <CButton
                    type="submit"
                    disabled={saving}
                    style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}
                  >
                    {saving ? <><CSpinner size="sm" className="me-1" />Saving...</> : 'Save Changes'}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default UserProfile
