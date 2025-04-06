// ServiceManagement.jsx
import React, { useState } from 'react';
import './ServiceManagement.css';

const ServiceManagement = () => {
    const [selectedService, setSelectedService] = useState(null);

    // Mock data for available services
    const services = [
        {
            id: 'resume-optimization',
            name: 'Resume Optimization',
            description: 'Optimize your resume to pass through ATS systems and increase interview chances',
            icon: '📄',
            status: 'active',
            configOptions: ['Keywords', 'Job title matching', 'Skills highlighting', 'Experience formatting']
        },
        {
            id: 'hr-connect',
            name: 'HR Connect',
            description: 'Automated outreach to HR managers with your applications',
            icon: '✉️',
            status: 'active',
            configOptions: ['Email templates', 'Follow-up schedule', 'Job target preferences', 'Company blacklist']
        },
        {
            id: 'auto-apply',
            name: 'Auto Job Application',
            description: 'Automatically apply to matching jobs across multiple platforms',
            icon: '🤖',
            status: 'active',
            configOptions: ['Job board preferences', 'Application frequency', 'Job title filters', 'Location preferences']
        },
        {
            id: 'interview-prep',
            name: 'Interview Preparation',
            description: 'AI-powered interview practice and feedback',
            icon: '🎯',
            status: 'inactive',
            configOptions: ['Industry-specific questions', 'Mock interview scheduling', 'Feedback preferences', 'Recording options']
        },
        {
            id: 'job-alerts',
            name: 'Smart Job Alerts',
            description: 'Get notified about relevant job postings across platforms',
            icon: '🔔',
            status: 'active',
            configOptions: ['Notification preferences', 'Job matching criteria', 'Alert frequency', 'Platform selection']
        },
        {
            id: 'salary-insights',
            name: 'Salary Insights',
            description: "Get real-time salary data for positions you're applying to",
            icon: '💰',
            status: 'inactive',
            configOptions: ['Industry benchmarks', 'Location adjustments', 'Experience level', 'Company size']
        }
    ];

    // Handle service selection
    const handleServiceSelect = (service) => {
        setSelectedService(service);
        // In a real app, we might navigate to a dedicated config page
    };

    // Handle toggling service status
    const toggleServiceStatus = (e, serviceId) => {
        e.stopPropagation(); // Prevent triggering the card click
        // In a real app, we would update the service status in the backend
        console.log(`Toggling service ${serviceId}`);
    };

    // Display the service configuration screen if a service is selected
    if (selectedService) {
        return (
            <div className="service-config">
                <button
                    className="back-button"
                    onClick={() => setSelectedService(null)}
                >
                    ← Back to Services
                </button>

                <div className="service-config-header">
                    <div className="service-icon large">{selectedService.icon}</div>
                    <div className="service-info">
                        <h2>{selectedService.name}</h2>
                        <p>{selectedService.description}</p>
                    </div>
                    <div className="service-status">
                        <span className={`status-indicator ${selectedService.status}`}></span>
                        <span className="status-text">{selectedService.status === 'active' ? 'Active' : 'Inactive'}</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={selectedService.status === 'active'}
                                onChange={(e) => toggleServiceStatus(e, selectedService.id)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="config-sections">
                    <div className="config-section">
                        <h3>Configuration Options</h3>
                        <div className="config-options">
                            {selectedService.configOptions.map((option, index) => (
                                <div key={index} className="config-option-card">
                                    <h4>{option}</h4>
                                    <p>Configure your {option.toLowerCase()} settings</p>
                                    <button className="config-button">Configure</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="config-section">
                        <h3>Service Information</h3>
                        <div className="info-card">
                            <p>
                                This is a placeholder for detailed information about the {selectedService.name} service.
                                In a real application, this would contain helpful information, usage statistics, and
                                additional settings specific to this service.
                            </p>
                            <p>
                                You can configure various aspects of this service using the options above. Each configuration
                                option provides detailed settings to customize how the service works for your job search.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main service management screen
    return (
        <div className="service-management">
            <div className="section-intro">
                <h2>Manage Your Services</h2>
                <p>
                    Configure and manage the services that help you automate your job search.
                    Toggle services on or off and customize their settings to match your preferences.
                </p>
            </div>

            <div className="services-grid">
                {services.map(service => (
                    <div
                        key={service.id}
                        className={`service-card ${service.status}`}
                        onClick={() => handleServiceSelect(service)}
                    >
                        <div className="service-header">
                            <div className="service-icon">{service.icon}</div>
                            <div className="service-status">
                                <span className={`status-indicator ${service.status}`}></span>
                                <span className="status-text">{service.status === 'active' ? 'Active' : 'Inactive'}</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={service.status === 'active'}
                                        onChange={(e) => toggleServiceStatus(e, service.id)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <h3 className="service-name">{service.name}</h3>
                        <p className="service-description">{service.description}</p>

                        <div className="service-footer">
                            <button className="configure-button">Configure</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="add-service-container">
                <div className="add-service-card">
                    <div className="add-icon">+</div>
                    <p>Request a new service</p>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagement;