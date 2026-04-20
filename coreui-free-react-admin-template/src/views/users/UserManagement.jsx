/**
 * UserManagement — Admin-only view for creating, editing, and deleting users.
 */
import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CTable, CTableBody, CTableDataCell,
  CTableHead, CTableHeaderCell, CTableRow, CBadge, CButton, CModal,
  CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm,
  CFormInput, CFormLabel, CFormSelect, CAlert, CSpinner,
} from '@coreui/react'
import { Crown, Wheat, Users, UserPlus, Lock, Edit2, Trash2, Plus, ShieldX } from 'lucide-react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const roleBadge = (role) =>
  role === 'admin'
    ? <CBadge style={{ background: '#f9a825', color: '#333' }} className="d-flex align-items-center gap-1 w-fit"><Crown size={12} /> Admin</CBadge>
    : <CBadge style={{ background: '#e8f5e9', color: '#2e7d32' }} className="d-flex align-items-center gap-1 w-fit"><Wheat size={12} /> Field Agent</CBadge>

const UserManagement = () => {
  const { user: currentUser, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Create / edit modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    role: 'agent', phone_number: '', password: '',
  })
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, username }
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('auth/users/')
      setUsers(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ username: '', email: '', first_name: '', last_name: '', role: 'agent', phone_number: '', password: '' })
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditingId(u.id)
    setFormData({
      username: u.username, email: u.email,
      first_name: u.first_name, last_name: u.last_name,
      role: u.role, phone_number: u.phone_number || '', password: '',
    })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError(null)
    setSaving(true)
    try {
      const payload = { ...formData }
      if (!payload.password) delete payload.password
      if (editingId) {
        await api.patch(`auth/users/${editingId}/`, payload)
      } else {
        await api.post('auth/register/', payload)
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      const d = err.response?.data
      setFormError(d ? Object.values(d).flat().join(' ') : 'Failed to save user.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (u) => {
    setDeleteTarget(u)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.delete(`auth/users/${deleteTarget.id}/delete/`)
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      const d = err.response?.data
      setDeleteError(d?.detail || 'Failed to delete user.')
    } finally {
      setDeleting(false)
    }
  }

  const inputStyle = { border: '1px solid #c8e6c9' }

  // Guard — only admins can access this component
  if (!isAdmin) {
    return (
      <div className="text-center py-5">
        <div className="mb-3"><Lock size={48} color="#c62828" /></div>
        <h5 className="mt-2">Access Restricted</h5>
        <p className="text-muted small">Only administrators can manage users.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
            <Users size={24} /> User Management
          </h4>
          <p className="text-muted small mb-0 ms-4 ps-2">{users.length} user{users.length !== 1 ? 's' : ''} in the system</p>
        </div>
        <CButton onClick={openCreate}
          style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}
          className="d-flex align-items-center gap-2"
        >
          <UserPlus size={16} /> Add User
        </CButton>
      </div>

      {/* Stats */}
      <CRow className="mb-4 g-3">
        <CCol md={4}>
          <div className="ss-stat-card" style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)' }}>
            <div>
              <div className="ss-stat-value">{users.length}</div>
              <div className="ss-stat-label">Total Users</div>
            </div>
            <div className="ss-stat-icon"><Users size={40} /></div>
          </div>
        </CCol>
        <CCol md={4}>
          <div className="ss-stat-card" style={{ background: 'linear-gradient(135deg,#e65100,#ff8c00)' }}>
            <div>
              <div className="ss-stat-value">{users.filter((u) => u.role === 'admin').length}</div>
              <div className="ss-stat-label">Admins</div>
            </div>
            <div className="ss-stat-icon"><Crown size={40} /></div>
          </div>
        </CCol>
        <CCol md={4}>
          <div className="ss-stat-card" style={{ background: 'linear-gradient(135deg,#388e3c,#66bb6a)' }}>
            <div>
              <div className="ss-stat-value">{users.filter((u) => u.role === 'agent').length}</div>
              <div className="ss-stat-label">Field Agents</div>
            </div>
            <div className="ss-stat-icon"><Wheat size={40} /></div>
          </div>
        </CCol>
      </CRow>

      {/* User table */}
      <CCard>
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5"><CSpinner color="success" /></div>
          ) : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Phone</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.map((u) => (
                  <CTableRow key={u.id}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#2e7d32,#43a047)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0,
                        }}>
                          {u.first_name?.[0] || u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold small">
                            {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>@{u.username}</div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell><span className="small text-muted">{u.email || '—'}</span></CTableDataCell>
                    <CTableDataCell><span className="small text-muted">{u.phone_number || '—'}</span></CTableDataCell>
                    <CTableDataCell>{roleBadge(u.role)}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton size="sm" variant="outline"
                          style={{ borderColor: '#2e7d32', color: '#2e7d32', borderRadius: 6 }}
                          onClick={() => openEdit(u)}
                          className="d-flex align-items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </CButton>
                        {/* Hide delete button for own account */}
                        {u.id !== currentUser?.id && (
                          <CButton size="sm" variant="outline"
                            style={{ borderColor: '#c62828', color: '#c62828', borderRadius: 6 }}
                            onClick={() => confirmDelete(u)}
                            className="d-flex align-items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </CButton>
                        )}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* ── Create / Edit modal ── */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} alignment="center">
        <CModalHeader style={{ background: '#f8fdf8', borderBottom: '1px solid #e8f5e9' }}>
          <CModalTitle style={{ color: '#1b5e20', fontWeight: 700 }} className="d-flex align-items-center gap-2">
            {editingId ? <><Edit2 size={20} /> Edit User</> : <><UserPlus size={20} /> Add User</>}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formError && <CAlert color="danger" className="small py-2">{formError}</CAlert>}
          <CForm>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">First Name</CFormLabel>
                <CFormInput value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="First name" style={inputStyle} />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">Last Name</CFormLabel>
                <CFormInput value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Last name" style={inputStyle} />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-semibold text-muted">Username *</CFormLabel>
                <CFormInput value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username" style={inputStyle} required />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-semibold text-muted">Email</CFormLabel>
                <CFormInput type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address" style={inputStyle} />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-semibold text-muted">Phone Number</CFormLabel>
                <CFormInput value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+254 7XX XXX XXX" style={inputStyle} />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-semibold text-muted">Role</CFormLabel>
                <CFormSelect value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={inputStyle}>
                  <option value="agent">Field Agent</option>
                  <option value="admin">Admin (Coordinator)</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-semibold text-muted">
                  Password {editingId ? '(leave blank to keep current)' : '*'}
                </CFormLabel>
                <CFormInput type="password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? 'New password (optional)' : 'Set password (min 8 chars)'}
                  style={inputStyle} />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #e8f5e9' }}>
          <CButton variant="outline" onClick={() => setShowModal(false)} style={{ borderRadius: 8 }}>Cancel</CButton>
          <CButton onClick={handleSave} disabled={saving}
            style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}>
            {saving ? <><CSpinner size="sm" className="me-1" />Saving...</> : (editingId ? 'Update User' : 'Create User')}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── Delete confirmation modal ── */}
      <CModal visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} alignment="center" size="sm">
        <CModalHeader style={{ background: '#fff5f5', borderBottom: '1px solid #fde8e8' }}>
          <CModalTitle style={{ color: '#c62828', fontWeight: 700 }} className="d-flex align-items-center gap-2">
            <Trash2 size={20} /> Delete User
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {deleteError && <CAlert color="danger" className="small py-2 mb-3">{deleteError}</CAlert>}
          <p className="mb-1">Are you sure you want to delete:</p>
          <p className="fw-bold mb-0">
            {deleteTarget?.first_name
              ? `${deleteTarget.first_name} (${deleteTarget.username})`
              : `@${deleteTarget?.username}`}
          </p>
          <p className="text-muted small mt-2">This action cannot be undone.</p>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #fde8e8' }}>
          <CButton variant="outline" onClick={() => setDeleteTarget(null)} style={{ borderRadius: 8 }}>Cancel</CButton>
          <CButton onClick={handleDelete} disabled={deleting}
            style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: 8 }}>
            {deleting ? <><CSpinner size="sm" className="me-1" />Deleting...</> : 'Yes, Delete'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default UserManagement
