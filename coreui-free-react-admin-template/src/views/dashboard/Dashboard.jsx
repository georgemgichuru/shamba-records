import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CBadge, CTable, CTableBody,
  CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CButton, CProgress,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, AlertTriangle, Flag, Sprout, Leaf, Wheat, Trophy, 
  Map, LayoutDashboard, Lightbulb, BarChart3, List, Zap, Plus
} from 'lucide-react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

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
  return <span>{status}</span>
}

const stagePill = (stage) => {
  const cls = { Planted: 'stage-planted', Growing: 'stage-growing', Ready: 'stage-ready', Harvested: 'stage-harvested' }
  const icon = { 
    Planted: <Sprout size={14} />, 
    Growing: <Leaf size={14} />, 
    Ready: <Wheat size={14} />, 
    Harvested: <Trophy size={14} /> 
  }
  return <span className={cls[stage]}>{icon[stage]} {stage}</span>
}

const StatCard = ({ icon, label, value, color, subtitle }) => (
  <div className="ss-stat-card" style={{ background: color }}>
    <div>
      <div className="ss-stat-value">{value}</div>
      <div className="ss-stat-label">{label}</div>
      {subtitle && <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 4 }}>{subtitle}</div>}
    </div>
    <div className="ss-stat-icon">{icon}</div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ total_fields: 0, status_breakdown: {}, stage_breakdown: {} })
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchSummary(), fetchFields()]).finally(() => setLoading(false))
  }, [])

  const fetchSummary = async () => {
    try {
      const res = await api.get('dashboard/summary/')
      setSummary(res.data)
    } catch (e) { console.error(e) }
  }

  const fetchFields = async () => {
    try {
      const res = await api.get('fields/')
      setFields(res.data.slice(0, 5))
    } catch (e) { console.error(e) }
  }

  const isAdmin = user?.role === 'admin'
  const total = summary.total_fields || 0
  const active = summary.status_breakdown?.['Active'] || 0
  const atRisk = summary.status_breakdown?.['At Risk'] || 0
  const completed = summary.status_breakdown?.['Completed'] || 0

  const stages = summary.stage_breakdown || {}
  const stageEntries = [
    { label: 'Planted', icon: <Sprout size={14} />, value: stages['Planted'] || 0, color: '#ff8c00' },
    { label: 'Growing', icon: <Leaf size={14} />, value: stages['Growing'] || 0, color: '#2e7d32' },
    { label: 'Ready', icon: <Wheat size={14} />, value: stages['Ready'] || 0, color: '#0277bd' },
    { label: 'Harvested', icon: <Trophy size={14} />, value: stages['Harvested'] || 0, color: '#6a1b9a' },
  ]

  return (
    <div>
      {/* Header greeting */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
          <LayoutDashboard size={24} />
          {isAdmin ? 'Admin Dashboard' : 'My Fields Dashboard'}
        </h4>
        <p className="text-muted small mb-0 ms-4 ps-1">
          Welcome back, <strong>{user?.first_name || user?.username}</strong>!
          {isAdmin ? ' Here\'s an overview of all fields.' : ' Here are your assigned fields.'}
        </p>
      </div>

      {/* Stat Cards */}
      <CRow className="mb-4 g-3">
        <CCol xs={6} md={3}>
          <StatCard icon={<Map size={40} strokeWidth={1.5} />} label="Total Fields" value={total} color="linear-gradient(135deg,#1b5e20,#2e7d32)" />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard icon={<CheckCircle size={40} strokeWidth={1.5} />} label="Active" value={active} color="linear-gradient(135deg,#388e3c,#66bb6a)"
            subtitle={total ? `${Math.round(active/total*100)}% of total` : ''} />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard icon={<AlertTriangle size={40} strokeWidth={1.5} />} label="At Risk" value={atRisk} color="linear-gradient(135deg,#c62828,#ef5350)"
            subtitle={atRisk > 0 ? 'Needs attention' : 'All clear'} />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard icon={<Flag size={40} strokeWidth={1.5} />} label="Completed" value={completed} color="linear-gradient(135deg,#0277bd,#29b6f6)" />
        </CCol>
      </CRow>

      {/* Insights Section */}
      <CRow className="mb-4">
        <CCol>
          <CCard style={{ backgroundColor: '#f1f8f1', border: '1px solid #c8e6c9', borderRadius: 12 }}>
            <CCardBody>
              <div className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
                <Lightbulb size={18} /> Useful Insights
              </div>
              <ul className="mb-0 text-muted small" style={{ lineHeight: '1.6' }}>
                 {(summary.at_risk_count > 0 || atRisk > 0) && <li><strong>Attention required:</strong> You have {summary.at_risk_count || atRisk} field{(summary.at_risk_count || atRisk) !== 1 ? 's' : ''} currently "At Risk". Consider reviewing their notes.</li>}
                 {summary.recently_harvested > 0 && <li><strong>Great progress:</strong> {summary.recently_harvested} field{summary.recently_harvested !== 1 ? 's have' : ' has'} been recently harvested. Keep up the good work!</li>}
                 {active > 0 && total > 0 && <li><strong>Healthy ratio:</strong> {Math.round(active/total*100)}% of your fields are active and actively being monitored.</li>}
                 {total === 0 && <li>Welcome! Get started by adding a new field or waiting for one to be assigned.</li>}
                 {total > 0 && atRisk === 0 && <li><strong>All clear!</strong> You currently have no fields at risk.</li>}
              </ul>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>


      <CRow className="mb-4 g-3">
        {/* Stage Breakdown */}
        <CCol md={5}>
          <CCard className="h-100">
            <CCardBody>
              <div className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
                <BarChart3 size={18} /> Stage Breakdown
              </div>
              <div className="d-flex flex-column gap-3">
                {stageEntries.map(({ label, icon, value, color }) => (
                  <div key={label}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-medium d-flex align-items-center gap-1">{icon} {label}</span>
                      <span className="small fw-bold">{value} field{value !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="progress" style={{ height: 8, borderRadius: 10, backgroundColor: '#f1f8f1' }}>
                      <div className="progress-bar" role="progressbar" style={{
                        width: `${total ? (value / total) * 100 : 0}%`,
                        backgroundColor: color, borderRadius: 10,
                        transition: 'width 0.5s ease'
                      }} aria-valuenow={total ? (value / total) * 100 : 0} aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Status overview ring-like */}
        <CCol md={7}>
          <CCard className="h-100">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-semibold d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
                  <List size={18} /> Recent Fields
                </div>
                <Link to="/fields">
                  <CButton size="sm" style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }}>
                    View All
                  </CButton>
                </Link>
              </div>
              {fields.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <div className="mb-2"><Sprout size={40} color="#a5d6a7" /></div>
                  <div className="small mt-2">No fields yet. <Link to="/fields/new" style={{ color: '#2e7d32' }}>Add your first field</Link></div>
                </div>
              ) : (
                <CTable hover responsive borderless className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Field</CTableHeaderCell>
                      <CTableHeaderCell>Stage</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {fields.map((f) => (
                      <CTableRow key={f.id}>
                        <CTableDataCell>
                          <div className="fw-semibold small">{f.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{f.crop_type}</div>
                        </CTableDataCell>
                        <CTableDataCell>{stagePill(f.current_stage)}</CTableDataCell>
                        <CTableDataCell>{statusBadge(f.status)}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Quick actions */}
      <CRow>
        <CCol>
          <CCard>
            <CCardBody>
              <div className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#1b5e20' }}>
                <Zap size={18} /> Quick Actions
              </div>
              <div className="d-flex flex-wrap gap-2">
                <CButton onClick={() => window.location.hash = '#/fields'} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8 }} size="sm" className="d-flex align-items-center gap-1">
                  <Plus size={14} /> Add New Field
                </CButton>
                <Link to="/fields">
                  <CButton variant="outline" style={{ borderColor: '#2e7d32', color: '#2e7d32', borderRadius: 8 }} size="sm">
                    View All Fields
                  </CButton>
                </Link>
                {isAdmin && (
                  <Link to="/users">
                    <CButton variant="outline" style={{ borderColor: '#0277bd', color: '#0277bd', borderRadius: 8 }} size="sm">
                      Manage Users
                    </CButton>
                  </Link>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard
