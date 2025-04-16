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
          pendingTasks: 0 // Placeholder for now
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setIsLoading(false);
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
              <span>0% from last month</span>
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
    </div>
  );
};

export default DashboardSummary;