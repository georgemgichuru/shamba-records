import React from 'react'
import { CFooter } from '@coreui/react'
import { Sprout, Heart, Mail, Phone, User } from 'lucide-react'

const AppFooter = () => {
  return (
    <CFooter className="px-4 py-3 d-flex flex-column" style={{ borderTop: '1px solid #e8f5e9', background: '#f8fdf8' }}>
      <div className="w-100 d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <Sprout size={18} color="#2e7d32" />
          <span style={{ fontWeight: 600, color: '#2e7d32' }}>SmartSeason</span>
          <span className="text-muted small">Field Monitoring System &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="text-muted small d-flex align-items-center gap-1">
          Built with <Heart size={14} fill="#c62828" color="#c62828" /> for smarter farming
        </div>
      </div>
      
      <div className="w-100 text-center border-top pt-2" style={{ borderColor: '#e8f5e9 !important' }}>
        <div className="small fw-semibold mb-1" style={{ color: '#2e7d32' }}>
          Created for Shamba Records Software Internship Application
        </div>
        <div className="text-muted small d-flex justify-content-center align-items-center gap-4">
          <span className="d-flex align-items-center gap-1 text-decoration-none">
            <User size={14} /> George Mwangi Gichuru
          </span>
          <a href="mailto:georgem.gichuru@gmail.com" className="text-muted text-decoration-none d-flex align-items-center gap-1">
            <Mail size={14} /> georgem.gichuru@gmail.com
          </a>
          <a href="tel:+254722714334" className="text-muted text-decoration-none d-flex align-items-center gap-1">
            <Phone size={14} /> +254 722 714 334
          </a>
        </div>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
