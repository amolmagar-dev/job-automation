// DashboardSummary.jsx
import React from 'react';

const DashboardSummary = () => {
  // Mock data for dashboard stats and recent applications
  const dashboardStats = {
    applications: 24,
    responses: 8,
    interviews: 3,
    pendingTasks: 2
  };

  const recentApplications = [
    { id: 1, company: "Tech Solutions", position: "Frontend Developer", status: "Applied", date: "2025-04-05", platform: "LinkedIn" },
    { id: 2, company: "Global Innovations", position: "UI/UX Designer", status: "Interview", date: "2025-04-03", platform: "Email Outreach" },
    { id: 3, company: "Webstar Systems", position: "React Developer", status: "Viewed", date: "2025-04-02", platform: "Naukri" },
    { id: 4, company: "Future Technologies", position: "Full Stack Developer", status: "Applied", date: "2025-04-01", platform: "Indeed" }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied': return '#6366f1'; // Primary color
      case 'interview': return '#10b981'; // Success/green
      case 'viewed': return '#f59e0b'; // Warning/yellow
      case 'rejected': return '#ef4444'; // Danger/red
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <div className="dashboard-summary">
      {/* Metrics Cards */}
      <div className="metrics-container">
        <div className="metric-card">
          <h3>Applications</h3>
          <p className="metric-value">{dashboardStats.applications}</p>
          <p className="metric-label">Total Submitted</p>
        </div>

        <div className="metric-card">
          <h3>Responses</h3>
          <p className="metric-value">{dashboardStats.responses}</p>
          <p className="metric-label">Received</p>
        </div>

        <div className="metric-card">
          <h3>Interviews</h3>
          <p className="metric-value">{dashboardStats.interviews}</p>
          <p className="metric-label">Scheduled</p>
        </div>

        <div className="metric-card">
          <h3>Pending</h3>
          <p className="metric-value">{dashboardStats.pendingTasks}</p>
          <p className="metric-label">Tasks</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-button primary">Apply to New Job</button>
        <button className="action-button secondary">Upload Resume</button>
        <button className="action-button secondary">Set Job Preferences</button>
      </div>

      {/* Recent Applications */}
      <div className="recent-applications">
        <div className="section-header">
          <h2>Recent Applications</h2>
          <a href="#applications" className="view-all">View All</a>
        </div>

        <div className="applications-table">
          <div className="table-header">
            <div className="table-cell company-cell">Company</div>
            <div className="table-cell position-cell">Position</div>
            <div className="table-cell platform-cell">Platform</div>
            <div className="table-cell date-cell">Date</div>
            <div className="table-cell status-cell">Status</div>
          </div>

          {recentApplications.map(app => (
            <div key={app.id} className="table-row">
              <div className="table-cell company-cell">{app.company}</div>
              <div className="table-cell position-cell">{app.position}</div>
              <div className="table-cell platform-cell">{app.platform}</div>
              <div className="table-cell date-cell">{new Date(app.date).toLocaleDateString()}</div>
              <div className="table-cell status-cell">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: `${getStatusColor(app.status)}20`,
                    color: getStatusColor(app.status)
                  }}
                >
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Actions */}
      <div className="services-actions">
        <div className="service-card">
          <div className="service-icon resume-icon">📄</div>
          <h3>Optimize Resume</h3>
          <p>Improve your resume to get more responses</p>
          <button className="service-button">Check Score</button>
        </div>

        <div className="service-card">
          <div className="service-icon email-icon">✉️</div>
          <h3>HR Connect</h3>
          <p>Reach out directly to hiring managers</p>
          <button className="service-button">Start Campaign</button>
        </div>

        <div className="service-card">
          <div className="service-icon notifications-icon">🔔</div>
          <h3>Setup Alerts</h3>
          <p>Get notified about new matching jobs</p>
          <button className="service-button">Configure</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;