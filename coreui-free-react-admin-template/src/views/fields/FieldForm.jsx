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

const FieldForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    crop_type: '',
    planting_date: '',
    current_stage: 'Planted',
    notes: '',
  })
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    if (id) fetchField()
  }, [id])

  const fetchField = async () => {
    try {
      const response = await api.get(`fields/${id}/`)
      setFormData({
        name: response.data.name,
        crop_type: response.data.crop_type,
        planting_date: response.data.planting_date,
        current_stage: response.data.current_stage,
        notes: response.data.notes || '',
      })
    } catch (error) {
      console.error('Failed to fetch field:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (id) {
        await api.patch(`fields/${id}/`, formData)
      } else {
        await api.post('fields/', formData)
      }
      navigate('/fields')
    } catch (error) {
      console.error('Failed to save field', error)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{id ? 'Edit Field' : 'Create Field'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel>Name</CFormLabel>
                <CFormInput type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <CFormLabel>Crop Type</CFormLabel>
                <CFormInput type="text" name="crop_type" value={formData.crop_type} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <CFormLabel>Planting Date</CFormLabel>
                <CFormInput type="date" name="planting_date" value={formData.planting_date} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <CFormLabel>Current Stage</CFormLabel>
                <CFormSelect name="current_stage" value={formData.current_stage} onChange={handleChange}>
                  <option value="Planted">Planted</option>
                  <option value="Growing">Growing</option>
                  <option value="Ready">Ready</option>
                  <option value="Harvested">Harvested</option>
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>Notes / Observations</CFormLabel>
                <CFormTextarea name="notes" rows={3} value={formData.notes} onChange={handleChange}></CFormTextarea>
              </div>
              <CButton type="submit" color="primary">
                Save Field
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FieldForm
