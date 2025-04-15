import React, { useState, useEffect } from 'react';
import apiUtils from '../../../services/jobApplications';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Briefcase,
  MessageSquare,
  Calendar,
  CheckCircle,
  PlusCircle,
  FileUp,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Mail,
  Bell,
  Loader,
  SearchCode,
  TrendingUp
} from 'lucide-react';

// No need to import CSS as we're using SCSS now

const DashboardSummary = () => {
  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    applications: 0,
    responses: 0,
    interviews: 0,
    pendingTasks: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [portalStats, setPortalStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch job applications statistics
        const statsResponse = await apiUtils.jobApplications.getStatistics();

        // Fetch recent applications
        const applicationsResponse = await apiUtils.jobApplications.getAll({
          page: 1,
          limit: 4,
          sortBy: 'appliedOn',
          sortOrder: 'desc'
        });

        // Process statistics data
        const stats = statsResponse.data.statistics;

        // Transform status stats for chart
        const statusData = stats.byStatus.map(item => ({
          name: item.status,
          value: item.count
        }));

        // Transform portal stats for chart
        const portalData = stats.byPortal.map(item => ({
          name: item.portal,
          value: item.count
        }));

        // Process monthly data for chart
        const monthlyData = stats.byMonth.map(item => ({
          name: `${item.month}/${item.year}`,
          applications: item.count
        }));

        // Update state
        setStatusStats(statusData);
        setPortalStats(portalData);
        setMonthlyStats(monthlyData);
        setRecentApplications(applicationsResponse.data.applications);

        // Calculate dashboard stats
        const applied = statusData.find(s => s.name === 'Applied')?.value || 0;
        const responded = statusData.find(s => s.name === 'Interviewing')?.value || 0;
        const interviews = statusData.find(s => s.name === 'Interviewing')?.value || 0;

        setDashboardStats({
          applications: stats.total || 0,
          responses: responded || 0,
          interviews: interviews || 0,
          pendingTasks: 2 // Placeholder for now
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setIsLoading(false);

        // Fallback to mock data for development
        setDashboardStats({
          applications: 24,
          responses: 8,
          interviews: 3,
          pendingTasks: 2
        });

        setRecentApplications([
          { id: 1, title: "Frontend Developer", company: "Tech Solutions", status: "Applied", appliedOn: "2025-04-05", portal: "LinkedIn" },
          { id: 2, title: "UI/UX Designer", company: "Global Innovations", status: "Interviewing", appliedOn: "2025-04-03", portal: "Email Outreach" },
          { id: 3, title: "React Developer", company: "Webstar Systems", status: "Viewed", appliedOn: "2025-04-02", portal: "Naukri" },
          { id: 4, title: "Full Stack Developer", company: "Future Technologies", status: "Applied", appliedOn: "2025-04-01", portal: "Indeed" }
        ]);

        setStatusStats([
          { name: 'Applied', value: 18 },
          { name: 'Interviewing', value: 3 },
          { name: 'Rejected', value: 2 },
          { name: 'Offered', value: 1 }
        ]);

        setPortalStats([
          { name: 'LinkedIn', value: 12 },
          { name: 'Indeed', value: 6 },
          { name: 'Naukri', value: 4 },
          { name: 'Email', value: 2 }
        ]);

        setMonthlyStats([
          { name: '01/2025', applications: 5 },
          { name: '02/2025', applications: 8 },
          { name: '03/2025', applications: 12 },
          { name: '04/2025', applications: 24 }
        ]);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'var(--primary-color)';
      case 'interviewing': return 'var(--success-color)';
      case 'viewed': return 'var(--warning-color)';
      case 'rejected': return 'var(--error-color)';
      case 'offered': return '#9333ea'; // Purple
      case 'accepted': return '#0891b2'; // Cyan
      default: return 'var(--text-tertiary)';
    }
  };

  // Colors for pie chart
  const COLORS = ['var(--primary-color)', 'var(--success-color)', 'var(--error-color)', '#9333ea', '#0891b2', 'var(--warning-color)'];

  // Render loading skeleton if data is loading
  if (isLoading) {
    return (
      <div className="dashboard-summary">
        <div className="metrics-container">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card">
              <div className="loading-skeleton title"></div>
              <div className="loading-skeleton metric"></div>
              <div className="loading-skeleton text"></div>
            </div>
          ))}
        </div>

        <div className="section-card">
          <div className="loading-skeleton title"></div>
          <div className="loading-skeleton text"></div>
          <div className="loading-skeleton text"></div>
          <div className="loading-skeleton text"></div>
        </div>
      </div>
    );
  }

  // Render error message if there's an error
  if (error) {
    return (
      <div className="dashboard-summary">
        <div className="section-card" style={{ textAlign: 'center' }}>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button className="action-button primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-summary">
      {/* Metrics Cards */}
      <div className="metrics-container">
        <div className="metric-card with-icon">
          <div className="metric-icon">
            <Briefcase size={20} />
          </div>
          <div className="metric-content">
            <h3>Applications</h3>
            <p className="metric-value">{dashboardStats.applications}</p>
            <p className="metric-label">Total Submitted</p>
            <div className="metric-trend positive">
              <TrendingUp size={14} className="trend-icon" />
              <span>12% from last month</span>
            </div>
          </div>
        </div>

        <div className="metric-card with-icon">
          <div className="metric-icon">
            <MessageSquare size={20} />
          </div>
          <div className="metric-content">
            <h3>Responses</h3>
            <p className="metric-value">{dashboardStats.responses}</p>
            <p className="metric-label">Received</p>
            <div className="metric-trend positive">
              <TrendingUp size={14} className="trend-icon" />
              <span>5% from last month</span>
            </div>
          </div>
        </div>

        <div className="metric-card with-icon">
          <div className="metric-icon">
            <Calendar size={20} />
          </div>
          <div className="metric-content">
            <h3>Interviews</h3>
            <p className="metric-value">{dashboardStats.interviews}</p>
            <p className="metric-label">Scheduled</p>
            <div className="metric-trend negative">
              <ArrowDownRight size={14} className="trend-icon" />
              <span>3% from last month</span>
            </div>
          </div>
        </div>

        <div className="metric-card with-icon">
          <div className="metric-icon">
            <CheckCircle size={20} />
          </div>
          <div className="metric-content">
            <h3>Pending</h3>
            <p className="metric-value">{dashboardStats.pendingTasks}</p>
            <p className="metric-label">Tasks</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-button primary">
          <PlusCircle size={18} className="button-icon" />
          Apply to New Job
        </button>
        <button className="action-button secondary">
          <FileUp size={18} className="button-icon" />
          Upload Resume
        </button>
        <button className="action-button secondary">
          <Settings size={18} className="button-icon" />
          Set Job Preferences
        </button>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Application Status</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Monthly Applications</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyStats}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="var(--primary-color)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Applications</h2>
          <a href="#applications" className="view-all">
            View All
            <ChevronRight size={16} className="icon" />
          </a>
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
              <div className="table-cell position-cell">{app.title}</div>
              <div className="table-cell platform-cell">{app.portal}</div>
              <div className="table-cell date-cell">
                {new Date(app.appliedOn).toLocaleDateString()}
              </div>
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
          <div className="service-icon">
            <FileText size={24} />
          </div>
          <h3>Optimize Resume</h3>
          <p>Improve your resume to get more responses</p>
          <button className="service-button">Check Score</button>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <Mail size={24} />
          </div>
          <h3>HR Connect</h3>
          <p>Reach out directly to hiring managers</p>
          <button className="service-button">Start Campaign</button>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <Bell size={24} />
          </div>
          <h3>Setup Alerts</h3>
          <p>Get notified about new matching jobs</p>
          <button className="service-button">Configure</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;