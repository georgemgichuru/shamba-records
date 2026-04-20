import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCol, CRow,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CAlert, CSpinner, CBadge,
  CNav, CNavItem, CNavLink, CTabContent, CTabPane
} from '@coreui/react'
import { 
  CheckCircle, AlertTriangle, Flag, Sprout, Leaf, Wheat, Trophy, 
  Map, Edit2, Plus, Trash2, Flower2 
} from 'lucide-react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import { HelpCircle, Info } from 'lucide-react'

const getStatusMain = (status) => {
  if (!status) return 'Unknown'
  if (status.includes('Completed')) return 'Completed'
  if (status.includes('At Risk') || status.includes('Urgent') || status.includes('Warning')) return 'At Risk'
  if (status.includes('Active') || status.includes('Action Required')) return 'Active'
  return status
}

const statusBadge = (status) => {
  if (!status) return null;
  const main = getStatusMain(status);
  
  if (main === 'Active') return <span className="ss-badge-active" title={status}><CheckCircle size={12} /> {status}</span>
  if (main === 'At Risk') return <span className="ss-badge-risk" title={status} style={{color: '#c62828', fontWeight: 'bold'}}><AlertTriangle size={12} /> {status}</span>
  if (main === 'Completed') return <span className="ss-badge-completed" title={status}><Flag size={12} /> {status}</span>
  return <CBadge title={status}>{status}</CBadge>
}

const stagePill = (stage) => {
  const cls = { Planted: 'stage-planted', Growing: 'stage-growing', Flowering: 'stage-flowering', Ready: 'stage-ready', Harvested: 'stage-harvested' }
  const icon = { 
    Planted: <Sprout size={14} />, 
    Growing: <Leaf size={14} />, 
    Flowering: <Flower2 size={14} />,
    Ready: <Wheat size={14} />, 
    Harvested: <Trophy size={14} /> 
  }
  return <span className={cls[stage] || ''}>{icon[stage]} {stage}</span>
}

const emptyForm = { 
  name: '', 
  crop_type: '', 
  planting_date: '', 
  expected_harvest_date: '',
  location: '',
  area_hectares: '',
  current_stage: 'Planted', 
  notes: '', 
  assigned_agent: '' 
}

const FieldList = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState(isAdmin ? 'all' : 'my')
  const [fields, setFields] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showHelpModal, setShowHelpModal] = useState(false)

  useEffect(() => {
    fetchFields()
    if (isAdmin) fetchAgents()
  }, [isAdmin])

  const fetchFields = async () => {
    try {
      const res = await api.get('fields/')
      setFields(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchAgents = async () => {
    try {
      const res = await api.get('fields/agents/')
      setAgents(res.data)
    } catch (e) {
      console.error('Failed to fetch agents', e)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (field) => {
    setEditingId(field.id)
    setFormData({
      name: field.name,
      crop_type: field.crop_type,
      planting_date: field.planting_date,
      expected_harvest_date: field.expected_harvest_date || '',
      location: field.location || '',
      area_hectares: field.area_hectares || '',
      current_stage: field.current_stage,
      notes: field.notes || '',
      assigned_agent: field.assigned_agent || '',
    })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError(null)
    setSaving(true)
    try {
      let payload = { ...formData }
      if (!isAdmin) {
        payload = {
          current_stage: formData.current_stage,
          notes: formData.notes
        }
      } else {
        if (!payload.assigned_agent) delete payload.assigned_agent
        if (!payload.expected_harvest_date) payload.expected_harvest_date = null
        if (!payload.area_hectares) payload.area_hectares = null
      }

      if (editingId) {
        await api.patch(`fields/${editingId}/`, payload)
      } else {
        await api.post('fields/', payload)
      }
      setShowModal(false)
      fetchFields()
    } catch (err) {
      const d = err.response?.data
      setFormError(d ? Object.values(d).flat().join(' ') : 'Failed to save field.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`fields/${id}/`)
      setDeleteConfirm(null)
      fetchFields()
    } catch (e) { console.error(e) }
  }

  const handleAssignAgent = async (fieldId, agentId) => {
    try {
      await api.patch(`fields/${fieldId}/assign/`, { assigned_agent: agentId || null })
      fetchFields()
    } catch (e) {
      console.error('Failed to assign agent', e)
      alert('Failed to assign agent. Please confirm they have the agent role.')
    }
  }

  const inputStyle = { border: '1px solid #c8e6c9' }

  // Stats
  const activeCount = fields.filter(f => getStatusMain(f.status) === 'Active').length
  const riskCount = fields.filter(f => getStatusMain(f.status) === 'At Risk').length
  const completedCount = fields.filter(f => getStatusMain(f.status) === 'Completed').length

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
            {isAdmin ? <Map size={24} /> : <Wheat size={24} />}
            {isAdmin ? 'Field Management' : 'My Assigned Fields'}
            <CButton color="link" className="p-0 ms-2 text-muted" onClick={() => setShowHelpModal(true)} title="How is status determined?">
              <HelpCircle size={20} />
            </CButton>
          </h4>
          <div className="text-muted small mb-0 d-flex align-items-center gap-3 mt-2 ms-1">
            <span>Total: <strong>{fields.length}</strong></span>
            <span className="d-flex align-items-center gap-1"><CheckCircle size={14} className="text-success" /> Active: {activeCount}</span>
            <span className="d-flex align-items-center gap-1"><AlertTriangle size={14} className="text-danger" /> At Risk: {riskCount}</span>
            <span className="d-flex align-items-center gap-1"><Flag size={14} className="text-primary" /> Completed: {completedCount}</span>
          </div>
        </div>
        {isAdmin && (
          <CButton
            onClick={openCreate}
            style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}
            className="d-flex align-items-center gap-2"
          >
            <Plus size={16} /> Add Field
          </CButton>
        )}
      </div>

      <CNav variant="tabs" className="mb-4">
        {isAdmin && (
          <>
            <CNavItem>
              <CNavLink active={activeTab === 'all'} onClick={() => setActiveTab('all')} style={{ cursor: 'pointer', color: activeTab === 'all' ? '#1b5e20' : '#666', fontWeight: activeTab === 'all' ? 'bold' : 'normal' }}>
                All Fields
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 'assign'} onClick={() => setActiveTab('assign')} style={{ cursor: 'pointer', color: activeTab === 'assign' ? '#1b5e20' : '#666', fontWeight: activeTab === 'assign' ? 'bold' : 'normal' }}>
                Assign Agents
              </CNavLink>
            </CNavItem>
          </>
        )}
        {!isAdmin && (
          <CNavItem>
            <CNavLink active={true} style={{ fontWeight: 'bold', color: '#1b5e20' }}>
              My Fields
            </CNavLink>
          </CNavItem>
        )}
      </CNav>

      <CCard style={{ border: '1px solid #e8f5e9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="success" />
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3"><Sprout size={48} color="#a5d6a7" /></div>
              <h5 className="mt-2" style={{ color: '#2e7d32' }}>No fields yet</h5>
              <p className="text-muted small">
                {isAdmin ? 'Create your first field to get started.' : 'No fields assigned to you yet.'}
              </p>
              {isAdmin && (
                <CButton onClick={openCreate}
                  style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}
                  className="d-flex align-items-center gap-2 mx-auto"
                >
                  <Plus size={16} /> Add First Field
                </CButton>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <CTabContent>
                <CTabPane visible={activeTab === 'all' || activeTab === 'my'}>
                  <CTable hover className="mb-0">
                    <CTableHead style={{ background: '#f1f8e9' }}>
                      <CTableRow>
                        <CTableHeaderCell>Field Info</CTableHeaderCell>
                        <CTableHeaderCell>Dates & Area</CTableHeaderCell>
                        <CTableHeaderCell>Stage</CTableHeaderCell>
                        <CTableHeaderCell>Agent</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {fields.map((field) => (
                        <CTableRow key={field.id}>
                          <CTableDataCell>
                            <div className="fw-bold" style={{ color: '#2e7d32' }}>{field.name}</div>
                            <div className="small text-muted d-flex align-items-center gap-1"><Leaf size={12} /> {field.crop_type}</div>
                            {field.location && <div className="small text-muted d-flex align-items-center gap-1"><Map size={12} /> {field.location}</div>}
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="small"><strong>Planted:</strong> {field.planting_date}</div>
                            <div className="small text-muted">
                              {field.expected_harvest_date ? `Harvest: ${field.expected_harvest_date}` : 'Harvest: TBD'}
                            </div>
                            <div className="small text-muted">
                              {field.area_hectares ? `Area: ${field.area_hectares} ha` : ''}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{stagePill(field.current_stage)}</CTableDataCell>
                          <CTableDataCell>
                            <span className="small">
                              {field.assigned_agent_details ? 
                                `${field.assigned_agent_details.first_name || field.assigned_agent_details.username}` : 
                                <span className="text-muted fst-italic">Unassigned</span>
                              }
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>{statusBadge(field.status)}</CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex gap-2 align-items-center">
                              <CButton
                                size="sm" variant="outline"
                                style={{ borderColor: '#2e7d32', color: '#2e7d32', borderRadius: 6 }}
                                onClick={() => openEdit(field)}
                              >
                                {isAdmin ? 'Edit' : 'Update'}
                              </CButton>
                              {isAdmin && (
                                <CButton
                                  size="sm" variant="ghost"
                                  style={{ color: '#c62828' }}
                                  onClick={() => setDeleteConfirm(field)}
                                >
                                  Delete
                                </CButton>
                              )}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CTabPane>

                {isAdmin && (
                  <CTabPane visible={activeTab === 'assign'}>
                    <CTable hover className="mb-0">
                      <CTableHead style={{ background: '#f1f8e9' }}>
                        <CTableRow>
                          <CTableHeaderCell>Field</CTableHeaderCell>
                          <CTableHeaderCell>Details</CTableHeaderCell>
                          <CTableHeaderCell>Current Agent</CTableHeaderCell>
                          <CTableHeaderCell>Assign To</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {fields.map((field) => (
                          <CTableRow key={field.id}>
                            <CTableDataCell>
                              <div className="fw-bold">{field.name}</div>
                              {statusBadge(field.status)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="small"><strong>Crop:</strong> {field.crop_type}</div>
                              <div className="small"><strong>Stage:</strong> {field.current_stage}</div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="small fw-semibold">
                                {field.assigned_agent_details ? 
                                  `${field.assigned_agent_details.username} (${field.assigned_agent_details.email})` : 
                                  <span className="text-muted">Unassigned</span>
                                }
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormSelect 
                                value={field.assigned_agent || ''}
                                onChange={(e) => handleAssignAgent(field.id, e.target.value)}
                                style={inputStyle}
                              >
                                <option value="">-- Unassigned --</option>
                                {agents.map(a => (
                                  <option key={a.id} value={a.id}>
                                    {a.first_name ? `${a.first_name} ${a.last_name} (${a.username})` : a.username}
                                  </option>
                                ))}
                              </CFormSelect>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CTabPane>
                )}
              </CTabContent>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Create/Edit Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg" alignment="center">
        <CModalHeader style={{ background: '#f8fdf8', borderBottom: '1px solid #e8f5e9' }}>
          <CModalTitle style={{ color: '#1b5e20', fontWeight: 700 }} className="d-flex align-items-center gap-2">
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />} 
            {editingId ? 'Edit Field' : 'Add New Field'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formError && <CAlert color="danger" className="small py-2">{formError}</CAlert>}
          <CForm>
            <h6 className="mt-2 mb-3 fw-bold" style={{color: '#388e3c'}}>General Details</h6>
            <CRow className="g-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">Field Name *</CFormLabel>
                <CFormInput value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. North Paddock A" style={inputStyle} required 
                  disabled={!isAdmin} />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">Crop Type *</CFormLabel>
                <CFormInput value={formData.crop_type} onChange={e => setFormData({ ...formData, crop_type: e.target.value })}
                  placeholder="e.g. Maize, Wheat, Rice" style={inputStyle} required 
                  disabled={!isAdmin} />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">Location</CFormLabel>
                <CFormInput value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Plot 14, Nakuru" style={inputStyle} 
                  disabled={!isAdmin} />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">Area (Hectares)</CFormLabel>
                <CFormInput type="number" step="0.01" value={formData.area_hectares} onChange={e => setFormData({ ...formData, area_hectares: e.target.value })}
                  placeholder="e.g. 5.5" style={inputStyle} 
                  disabled={!isAdmin} />
              </CCol>
            </CRow>

            <h6 className="mb-3 fw-bold" style={{color: '#388e3c'}}>Lifecycle & Progress</h6>
            <CRow className="g-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">Planting Date *</CFormLabel>
                <CFormInput type="date" value={formData.planting_date}
                  onChange={e => setFormData({ ...formData, planting_date: e.target.value })}
                  style={inputStyle} required disabled={!isAdmin} />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-muted">Expected Harvest Date</CFormLabel>
                <CFormInput type="date" value={formData.expected_harvest_date}
                  onChange={e => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                  style={inputStyle} disabled={!isAdmin} />
              </CCol>
              <CCol md={isAdmin && agents.length > 0 ? 6 : 12}>
                <CFormLabel className="small fw-semibold text-muted">Current Stage *</CFormLabel>
                <CFormSelect value={formData.current_stage}
                  onChange={e => setFormData({ ...formData, current_stage: e.target.value })}
                  style={inputStyle}>
                  <option value="Planted">Planted</option>
                  <option value="Growing">Growing</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Ready">Ready for Harvest</option>
                  <option value="Harvested">Harvested</option>
                </CFormSelect>
              </CCol>
              {isAdmin && agents.length > 0 && (
                <CCol md={6}>
                  <CFormLabel className="small fw-semibold text-muted">Assign Agent</CFormLabel>
                  <CFormSelect value={formData.assigned_agent}
                    onChange={e => setFormData({ ...formData, assigned_agent: e.target.value })}
                    style={inputStyle}>
                    <option value="">-- Unassigned --</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.first_name ? `${a.first_name} ${a.last_name} (${a.username})` : a.username}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              )}
            </CRow>

            <CRow className="g-3">
              <CCol md={12}>
                <CFormLabel className="small fw-semibold text-muted">Notes / Observations</CFormLabel>
                <CFormTextarea rows={3} value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any observations about this field..."
                  style={inputStyle} />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #e8f5e9' }}>
          <CButton variant="outline" onClick={() => setShowModal(false)} style={{ borderRadius: 8, color: '#666', borderColor: '#ccc' }}>
            Cancel
          </CButton>
          <CButton onClick={handleSave} disabled={saving}
            style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}>
            {saving ? <><CSpinner size="sm" className="me-1" />Saving...</> : (editingId ? 'Save Changes' : 'Add Field')}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete confirmation modal */}
      <CModal visible={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} alignment="center">
        <CModalHeader style={{ background: '#fff5f5', borderBottom: '1px solid #ffcdd2' }}>
          <CModalTitle style={{ color: '#c62828', fontWeight: 700 }} className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} /> Delete Field
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?</p>
          <p className="text-muted small mb-0">This action cannot be undone.</p>
        </CModalBody>
        <CModalFooter>
          <CButton variant="outline" onClick={() => setDeleteConfirm(null)} style={{ borderRadius: 8 }}>Cancel</CButton>
          <CButton onClick={() => handleDelete(deleteConfirm?.id)}
            style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: 8 }}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Status Help Modal */}
      <CModal visible={showHelpModal} onClose={() => setShowHelpModal(false)} alignment="center" size="lg">
        <CModalHeader style={{ background: '#f8fdf8', borderBottom: '1px solid #e8f5e9' }}>
          <CModalTitle style={{ color: '#1b5e20', fontWeight: 700 }} className="d-flex align-items-center gap-2">
            <Info size={20} /> How is Field Status Determined?
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>The system automatically determines the status of a field based on its <strong>current lifecycle stage</strong>, <strong>date planted</strong>, and <strong>expected harvest date</strong>. Here is the logic breakdown:</p>
          
          <div className="mb-3">
            <h6 className="fw-bold" style={{color: '#1b5e20'}}><Flag size={14} className="me-1"/> Completed</h6>
            <ul className="small text-muted">
              <li>Assigned when the current stage is marked as <strong>Harvested</strong>.</li>
            </ul>
          </div>

          <div className="mb-3">
            <h6 className="fw-bold" style={{color: '#c62828'}}><AlertTriangle size={14} className="me-1"/> At Risk / Warning</h6>
            <ul className="small text-muted">
              <li><strong>Delayed Growth:</strong> The field is still in the 'Planted' stage after 30 days.</li>
              <li><strong>Prolonged Growth:</strong> The field is still in the 'Growing' stage after 90 days.</li>
              <li><strong>Delayed Maturity:</strong> The current date is past the <em>Expected Harvest Date</em>, but the stage is not yet 'Ready for Harvest'.</li>
              <li><strong>Harvest Overdue:</strong> Past the Expected Harvest Date AND the stage is 'Ready'.</li>
              <li><strong>Approaching Harvest (Warning):</strong> Less than 7 days to the Expected Harvest Date, but not yet 'Ready'.</li>
              <li><strong>Past Typical Lifecycle:</strong> Over 120 days since planting, and the field is not 'Ready' or 'Harvested'.</li>
            </ul>
          </div>

          <div className="mb-3">
            <h6 className="fw-bold" style={{color: '#2e7d32'}}><CheckCircle size={14} className="me-1"/> Active / Action Required</h6>
            <ul className="small text-muted">
              <li><strong>Action Required:</strong> The stage is 'Ready for Harvest' (and not yet overdue).</li>
              <li><strong>Active / On Track:</strong> The default state for fields that are progressing normally without hitting any risk thresholds.</li>
            </ul>
          </div>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #e8f5e9' }}>
          <CButton onClick={() => setShowHelpModal(false)} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}>
            Got It
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default FieldList
