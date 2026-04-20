import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'

import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CFormLabel, CFormSelect, CFormTextarea,
  CButton, CSpinner, CBadge, CFormInput, CForm, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CFormDate, CAlert
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, Save, Stage, Note, MapPin, Calendar, Crop, Ruler, User, Award, AlertTriangle, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import stagePill, { statusBadge } from './FieldList' // Reuse from FieldList

const emptyForm = { 
  name: '', crop_type: '', planting_date: '', expected_harvest_date: '',
  location: '', area_hectares: '', current_stage: 'Planted', notes: '', assigned_agent: '' 
}

const FieldForm = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isAgent = user?.role === 'agent' && !isAdmin

  // ── Shared state ──
  const [fieldData, setFieldData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // ── Agent inline edits ──
  const [editMode, setEditMode] = useState(false)
  const [agentPayload, setAgentPayload] = useState({ current_stage: '', notes: '' })

  // ── Admin full modal ──
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminFormData, setAdminFormData] = useState(emptyForm)

  useEffect(() => {
    if (id) {
      fetchField()
    } else if (!isAdmin) {
      // Agents can't create
      navigate('/fields')
    } else {
      setLoading(false)
    }
  }, [id, isAdmin])

  const fetchField = async () => {
    try {
      const res = await api.get(`fields/${id}/`)
      setFieldData(res.data)
      if (isAgent) {
        setAgentPayload({ 
          current_stage: res.data.current_stage, 
          notes: res.data.notes || '' 
        })
      } else {
        setAdminFormData({
          name: res.data.name,
          crop_type: res.data.crop_type,
          planting_date: res.data.planting_date,
          expected_harvest_date: res.data.expected_harvest_date || '',
          location: res.data.location || '',
          area_hectares: res.data.area_hectares || '',
          current_stage: res.data.current_stage,
          notes: res.data.notes || '',
          assigned_agent: res.data.assigned_agent || ''
        })
      }
    } catch (err) {
      setError('Failed to load field data.')
    } finally {
      setLoading(false)
    }
  }

  // ── Agent updates ──
  const handleAgentUpdate = async () => {
    setSaving(true)
    try {
      await api.patch(`fields/${id}/`, agentPayload)
      await fetchField() // Refresh
      setEditMode(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  // ── Admin full update ──
  const handleAdminSave = async () => {
    setSaving(true)
    try {
      const payload = { ...adminFormData }
      if (!payload.assigned_agent) delete payload.assigned_agent
      if (!payload.expected_harvest_date) payload.expected_harvest_date = null
      if (!payload.area_hectares) payload.area_hectares = null
      if (id) {
        await api.patch(`fields/${id}/`, payload)
      } else {
        await api.post('fields/', payload)
      }
      navigate('/fields')
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-5"><CSpinner color="success" /></div>
  }

  if (!fieldData && !isAdmin) {
    return (
      <div className="text-center py-5">
        <AlertTriangle size={48} className="text-warning mb-3" />
        <h5>Access Denied</h5>
        <p className="text-muted">Field not found or not assigned to you.</p>
        <CButton onClick={() => navigate('/fields')} color="success">Back to My Fields</CButton>
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible onClose={() => setError(null)}>{error}</CAlert>}
        {fieldData ? (
          <>
            {/* ── Field Details Header ── */}
            <CCard className="mb-4">
              <CCardHeader className="d-flex justify-content-between align-items-center" style={{ background: '#f1f8f1' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="fw-bold fs-4" style={{ color: '#1b5e20' }}>{fieldData.name}</div>
                  <div style={{ fontSize: '0.85rem' }} className="text-muted">{fieldData.crop_type}</div>
                  {statusBadge(fieldData.status)}
                </div>
                <div className="d-flex gap-2">
                  {isAgent && (
                    <CButton 
                      size="sm" 
                      variant={editMode ? 'success' : 'outline-success'}
                      onClick={() => setEditMode(!editMode)}
                      title={editMode ? 'Cancel Edit' : 'Edit Stage & Notes'}
                    >
                      {editMode ? <Save size={14} /> : <Edit2 size={14} />}
                    </CButton>
                  )}
                  {isAdmin && (
                    <CButton size="sm" color="success" onClick={() => setShowAdminModal(true)}>
                      Edit Full Details
                    </CButton>
                  )}
                </div>
              </CCardHeader>

              {/* ── Agent Edit Mode ── */}
              {isAgent && editMode && (
                <CCardBody className="border-top">
                  <CRow className="g-3">
                    <CCol md={6}>
                      <CFormLabel className="small fw-semibold">Current Stage</CFormLabel>
                      <CFormSelect value={agentPayload.current_stage} onChange={(e) => setAgentPayload({...agentPayload, current_stage: e.target.value})}>
                        <option value="Planted">Planted</option>
                        <option value="Growing">Growing</option>
                        <option value="Flowering">Flowering</option>
                        <option value="Ready">Ready for Harvest</option>
                        <option value="Harvested">Harvested</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CButton 
                        color="success" 
                        disabled={saving}
                        onClick={handleAgentUpdate}
                        className="d-flex align-items-center gap-1 mt-4"
                      >
                        {saving ? <CSpinner size="sm" /> : <Save size={16} />} Update
                      </CButton>
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel className="small fw-semibold">Notes / Observations</CFormLabel>
                      <CFormTextarea 
                        rows={4}
                        value={agentPayload.notes} 
                        onChange={(e) => setAgentPayload({...agentPayload, notes: e.target.value})}
                        placeholder="Update field observations..."
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              )}

              {/* ── Read-only Details ── */}
              {(!isAgent || !editMode) && (
                <CCardBody>
                  <CRow className="g-3">
                    <CCol md={3}>
                      <CFormLabel className="small fw-semibold text-muted">Location</CFormLabel>
                      <div>{fieldData.location || '—'}</div>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel className="small fw-semibold text-muted">Area</CFormLabel>
                      <div>{fieldData.area_hectares ? `${fieldData.area_hectares} ha` : '—'}</div>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel className="small fw-semibold text-muted">Planted</CFormLabel>
                      <div>{fieldData.planting_date}</div>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel className="small fw-semibold text-muted">Agent</CFormLabel>
                      <div>{fieldData.assigned_agent_details?.first_name || 'Unassigned'}</div>
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel className="small fw-semibold text-muted">Notes</CFormLabel>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{fieldData.notes || 'No notes yet.'}</div>
                    </CCol>
                  </CRow>
                </CCardBody>
              )}
            </CCard>
          </>
        ) : isAdmin && !id ? (
          /* ── Admin Create Form ── */
          <CCard>
            <CCardHeader><strong>Create New Field</strong></CCardHeader>
            <CCardBody>
              <CForm onSubmit={(e) => { e.preventDefault(); handleAdminSave(); }}>
                {/* Full admin form fields here - similar to FieldList modal */}
                <CRow className="g-3">
                  <CCol md={6}><CFormLabel>Field Name *</CFormLabel><CFormInput value={adminFormData.name} onChange={e => setAdminFormData({...adminFormData, name: e.target.value})} required /></CCol>
                  <CCol md={6}><CFormLabel>Crop Type *</CFormLabel><CFormInput value={adminFormData.crop_type} onChange={e => setAdminFormData({...adminFormData, crop_type: e.target.value})} required /></CCol>
                  {/* Add all fields like modal */}
                </CRow>
                <CButton type="submit" color="success" disabled={saving}>Create Field</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        ) : null}
      </CCol>
    </CRow>
  )
}

export default FieldForm
