// DashboardLayout.jsx
import React, { useState } from 'react';
import './DashboardLayout.css';

const DashboardLayout = ({ children, activePage = 'dashboard', onNavigate }) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Mock Data for user and notifications
    const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        profileImage: null // If null, we'll show initials
    };

    const notifications = [
        { id: 1, type: "message", text: "New message from Tech Solutions", time: "10 min ago", read: false },
        { id: 2, type: "interview", text: "Interview scheduled with DataSys Corp", time: "1 hour ago", read: false },
        { id: 3, type: "application", text: "Application viewed by GlobalTech", time: "3 hours ago", read: true }
    ];

    const toggleNotifications = () => {
        setNotificationsOpen(!notificationsOpen);
        if (userMenuOpen) setUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
        if (notificationsOpen) setNotificationsOpen(false);
    };

    const handleNavigation = (navItem) => {
        if (onNavigate) {
            onNavigate(navItem);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">💼</span>
                        <span className="logo-text">JobSuiteX</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li
                            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                            onClick={() => handleNavigation('dashboard')}
                        >
                            <span className="nav-icon">📊</span>
                            <span className="nav-text">Dashboard Summary</span>
                        </li>

                        <li
                            className={`nav-item ${activePage === 'applications' ? 'active' : ''}`}
                            onClick={() => handleNavigation('applications')}
                        >
                            <span className="nav-icon">📝</span>
                            <span className="nav-text">Application Tracker</span>
                        </li>

                        <li
                            className={`nav-item ${activePage === 'alerts' ? 'active' : ''}`}
                            onClick={() => handleNavigation('alerts')}
                        >
                            <span className="nav-icon">🔔</span>
                            <span className="nav-text">Alerts & Messages</span>
                        </li>

                        <li
                            className={`nav-item ${activePage === 'resume' ? 'active' : ''}`}
                            onClick={() => handleNavigation('resume')}
                        >
                            <span className="nav-icon">📄</span>
                            <span className="nav-text">Resume Performance</span>
                        </li>

                        <li
                            className={`nav-item ${activePage === 'hr-connect' ? 'active' : ''}`}
                            onClick={() => handleNavigation('hr-connect')}
                        >
                            <span className="nav-icon">✉️</span>
                            <span className="nav-text">HR Connect</span>
                        </li>

                        <li
                            className={`nav-item ${activePage === 'services' ? 'active' : ''}`}
                            onClick={() => handleNavigation('services')}
                        >
                            <span className="nav-icon">⚙️</span>
                            <span className="nav-text">Service Management</span>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="upgrade-banner">
                        <span className="spark-icon">⚡</span>
                        <div className="upgrade-text">
                            <p>Upgrade to Pro</p>
                            <p className="upgrade-subtext">5x more applications</p>
                        </div>
                    </div>

                    <div className="nav-item help-item">
                        <span className="nav-icon">❓</span>
                        <span className="nav-text">Help & Support</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Topbar */}
                <header className="topbar">
                    <div className="page-title">
                        <h1>{activePage === 'dashboard' ? 'Dashboard Summary' :
                            activePage === 'applications' ? 'Application Tracker' :
                                activePage === 'alerts' ? 'Alerts & Messages' :
                                    activePage === 'resume' ? 'Resume Performance' :
                                        activePage === 'hr-connect' ? 'HR Connect' :
                                            activePage === 'services' ? 'Service Management' :
                                                'Dashboard'}</h1>
                    </div>

                    <div className="topbar-actions">
                        <div className="search-bar">
                            <input type="text" placeholder="Search jobs, companies..." />
                            <button className="search-button">🔍</button>
                        </div>

                        <div className="action-icons">
                            <div className="notification-container">
                                <button
                                    className="notification-button"
                                    onClick={toggleNotifications}
                                >
                                    🔔
                                    <span className="notification-badge">2</span>
                                </button>

                                {/* Notification dropdown */}
                                {notificationsOpen && (
                                    <div className="dropdown notifications-dropdown">
                                        <div className="dropdown-header">
                                            <h3>Notifications</h3>
                                            <button className="mark-all-read">Mark all as read</button>
                                        </div>
                                        <ul className="notification-list">
                                            {notifications.map(notification => (
                                                <li
                                                    key={notification.id}
                                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                >
                                                    <div className="notification-content">
                                                        <p className="notification-text">{notification.text}</p>
                                                        <span className="notification-time">{notification.time}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="dropdown-footer">
                                            <a href="#alerts">View all notifications</a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="user-menu-container">
                                <button
                                    className="user-menu-button"
                                    onClick={toggleUserMenu}
                                >
                                    <div className="user-avatar">
                                        {userData.profileImage ? (
                                            <img src={userData.profileImage} alt="Profile" />
                                        ) : (
                                            userData.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                        )}
                                    </div>
                                </button>

                                {/* User dropdown menu */}
                                {userMenuOpen && (
                                    <div className="dropdown user-dropdown">
                                        <div className="user-info">
                                            <div className="user-avatar large">
                                                {userData.profileImage ? (
                                                    <img src={userData.profileImage} alt="Profile" />
                                                ) : (
                                                    userData.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                                )}
                                            </div>
                                            <div className="user-details">
                                                <h3>{userData.name}</h3>
                                                <p>{userData.email}</p>
                                            </div>
                                        </div>
                                        <ul className="user-menu-list">
                                            <li className="user-menu-item">
                                                <span className="user-menu-icon">👤</span>
                                                <span>My Profile</span>
                                            </li>
                                            <li className="user-menu-item">
                                                <span className="user-menu-icon">⚙️</span>
                                                <span>Account Settings</span>
                                            </li>
                                            <li className="user-menu-item">
                                                <span className="user-menu-icon">🔑</span>
                                                <span>Subscription</span>
                                            </li>
                                            <li className="user-menu-item logout">
                                                <span className="user-menu-icon">🚪</span>
                                                <span>Logout</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="content-wrapper">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;