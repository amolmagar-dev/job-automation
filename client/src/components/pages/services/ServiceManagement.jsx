// ServiceManagement.jsx
import React from 'react';

const ServiceManagement = ({ onNavigateToService }) => {
  const handleConfigureClick = () => {
    onNavigateToService('auto-apply');
  };

  return (
    <div className="service-management">
      <h2>Service Management</h2>
      
      <div className="service-list">
        <div className="service-item">
          <div className="service-details">
            <div className="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
              </svg>
            </div>
            <div className="service-info">
              <h3>Auto Job Application</h3>
              <p>Automatically apply to matching jobs across multiple platforms</p>
            </div>
          </div>
          <div className="service-actions">
            <div className="service-status active">Active</div>
            <button onClick={handleConfigureClick} className="configure-button">Configure</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;