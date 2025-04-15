// components/pages/Dashboard/JobSuiteXDashboard.jsx
import React, { useState } from 'react';
import Layout from '../../layout/Layout.jsx';
import DashboardSummary from './DashboardSummary.jsx';
import ServiceManagement from '../service_management/ServiceManagement.jsx';
import AutoJobApplication from '../service_management/AutoJobApplication.jsx';
// import ApplicationTracker from './components/ApplicationTracker';
// Import other components as needed

const JobSuiteXDashboard = () => {
    const [activePage, setActivePage] = useState('dashboard');

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <DashboardSummary />;
            case 'applications':
                return <div className="placeholder-section">Alerts & Messages Component Coming Soon</div>;
            case 'alerts':
                return <div className="placeholder-section">Alerts & Messages Component Coming Soon</div>;
            case 'resume':
                return <div className="placeholder-section">Resume Performance Component Coming Soon</div>;
            case 'hr-connect':
                return <div className="placeholder-section">HR Connect Component Coming Soon</div>;
            case 'services':
                return <ServiceManagement onNavigateToService={(service) => setActivePage(service)} />;
            case 'auto-apply':
                return <AutoJobApplication />;
            default:
                return <DashboardSummary />;
        }
    };

    return (
        <Layout activePage={activePage} onNavigate={setActivePage}>
            {renderContent()}
        </Layout>
    );
};

export default JobSuiteXDashboard;