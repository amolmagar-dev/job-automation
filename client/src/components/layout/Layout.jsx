import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
    // Icons for sidebar and topbar
    BriefcaseBusiness,
    LayoutDashboard,
    FileSpreadsheet,
    Bell,
    FileText,
    Mail,
    Settings,
    Zap,
    HelpCircle,
    User,
    LogOut,
    Key,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon,
    Menu
} from 'lucide-react';
import authService from '../../services/auth/JobSuiteXAuth';

// No need to import CSS file as we're using SCSS

const Layout = ({ children, activePage = 'dashboard', onNavigate }) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);

    const sidebarRef = useRef(null);
    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);

    const { theme, toggleTheme } = useTheme();

    // Load user data
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                console.log(userData);
                setUser(userData);
            } catch (err) {
                setUser(null);
            } 
        };

        loadUser();
    }, []);

    // User data format from backend:
    // {
    //   "id": "67f7b361248128510a1bdc70",
    //   "firstName": "Amol",
    //   "lastName": "Magar",
    //   "email": "a.magar@smartshiphub.com",
    //   "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocKIuemNJxf9HR0tOzDqvF-jd9nUNPN1-vxUGlp37T46meih0w=s96-c",
    //   "authProvider": "google",
    //   "createdAt": "2025-04-10T12:02:41.270Z",
    //   "role": "user"
    // }

    const notifications = [
        { id: 1, type: "message", text: "New message from Tech Solutions", time: "10 min ago", read: false },
        { id: 2, type: "interview", text: "Interview scheduled with DataSys Corp", time: "1 hour ago", read: false },
        { id: 3, type: "application", text: "Application viewed by GlobalTech", time: "3 hours ago", read: true }
    ];

    // Get user's full name from firstName and lastName
    const getUserFullName = () => {
        if (!user) return '';
        return `${user.firstName} ${user.lastName}`;
    };

    // Get user's initials for avatar fallback
    const getUserInitials = () => {
        if (!user) return '';
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    };

    // Detect scrolling to add shadow to topbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }

            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleNotifications = () => {
        setNotificationsOpen(!notificationsOpen);
        if (userMenuOpen) setUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
        if (notificationsOpen) setNotificationsOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const toggleMobileNav = () => {
        setMobileNavOpen(!mobileNavOpen);
    };

    const handleNavigation = (navItem) => {
        if (onNavigate) {
            onNavigate(navItem);
        }
        // Close mobile nav if open
        if (mobileNavOpen) {
            setMobileNavOpen(false);
        }
    };

    // Prevents body scrolling when mobile sidebar is open
    useEffect(() => {
        if (mobileNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileNavOpen]);

    return (
        <div className="layout-container">
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${mobileNavOpen ? 'active' : ''}`}
                onClick={() => setMobileNavOpen(false)}
            />

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`sidebar ${sidebarExpanded || mobileNavOpen ? 'expanded' : ''}`}
            >
                <div className="sidebar-header">
                    <div className="logo">
                        <BriefcaseBusiness className="logo-icon" size={24} />
                        <span className="logo-text">JobSuiteX</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div
                        className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavigation('dashboard')}
                    >
                        <LayoutDashboard className="nav-icon" size={20} />
                        <span className="nav-text">Dashboard Summary</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'applications' ? 'active' : ''}`}
                        onClick={() => handleNavigation('applications')}
                    >
                        <FileSpreadsheet className="nav-icon" size={20} />
                        <span className="nav-text">Application Tracker</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'alerts' ? 'active' : ''}`}
                        onClick={() => handleNavigation('alerts')}
                    >
                        <Bell className="nav-icon" size={20} />
                        <span className="nav-text">Alerts & Messages</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'resume' ? 'active' : ''}`}
                        onClick={() => handleNavigation('resume')}
                    >
                        <FileText className="nav-icon" size={20} />
                        <span className="nav-text">Resume Performance</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'hr-connect' ? 'active' : ''}`}
                        onClick={() => handleNavigation('hr-connect')}
                    >
                        <Mail className="nav-icon" size={20} />
                        <span className="nav-text">HR Connect</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'services' ? 'active' : ''}`}
                        onClick={() => handleNavigation('services')}
                    >
                        <Settings className="nav-icon" size={20} />
                        <span className="nav-text">Service Management</span>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="upgrade-banner">
                        <Zap className="spark-icon" size={20} />
                        <div className="upgrade-text">
                            <p>Upgrade to Pro</p>
                            <p className="upgrade-subtext">5x more applications</p>
                        </div>
                    </div>

                    <div className="help-item">
                        <HelpCircle className="help-icon" size={20} />
                        <span className="help-text">Help & Support</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Topbar */}
                <header className={`topbar ${isScrolled ? 'scrolled' : ''}`}>
                    <div className="page-title">
                        {/* Mobile menu toggle */}
                        <button className="menu-toggle" onClick={toggleMobileNav}>
                            <Menu size={24} />
                        </button>

                        {/* Desktop sidebar toggle */}
                        <button
                            className="sidebar-toggle"
                            onClick={toggleSidebar}
                            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                        >
                            {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>

                        <h1>{activePage === 'dashboard' ? 'Dashboard Summary' :
                            activePage === 'applications' ? 'Application Tracker' :
                                activePage === 'alerts' ? 'Alerts & Messages' :
                                    activePage === 'resume' ? 'Resume Performance' :
                                        activePage === 'hr-connect' ? 'HR Connect' :
                                            activePage === 'services' ? 'Service Management' :
                                                'Dashboard'}</h1>
                    </div>

                    <div className="topbar-actions">
                        <div className="action-icons">
                            {/* Theme toggle button */}
                            <button
                                className="action-btn"
                                onClick={toggleTheme}
                                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Notifications */}
                            <div ref={notificationsRef}>
                                <button
                                    className="action-btn"
                                    onClick={toggleNotifications}
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} />
                                    <span className="badge">2</span>
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

                            {/* User menu */}
                            <div ref={userMenuRef}>
                                <button
                                    className="user-avatar"
                                    onClick={toggleUserMenu}
                                    aria-label="User menu"
                                >
                                    {user && user.profilePicture ? (
                                        <img 
                                            src={user.profilePicture} 
                                            alt="Profile"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = getUserInitials();
                                            }}
                                        />
                                    ) : (
                                        <span>{user && getUserInitials()}</span>
                                    )}
                                </button>

                                {/* User dropdown menu */}
                                {userMenuOpen && user && (
                                    <div className="dropdown user-dropdown">
                                        <div className="user-info">
                                            <div className="user-avatar large">
                                                {user.profilePicture ? (
                                                    <img 
                                                        src={user.profilePicture} 
                                                        alt="Profile" 
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            e.target.parentNode.innerHTML = getUserInitials();
                                                        }}
                                                    />
                                                ) : (
                                                    <span>{getUserInitials()}</span>
                                                )}
                                            </div>
                                            <div className="user-details">
                                                <h3>{getUserFullName()}</h3>
                                                <p>{user.email}</p>
                                            </div>
                                        </div>
                                        <ul className="user-menu-list">
                                            <li className="user-menu-item">
                                                <User className="user-menu-icon" size={16} />
                                                <span>My Profile</span>
                                            </li>
                                            <li className="user-menu-item">
                                                <Settings className="user-menu-icon" size={16} />
                                                <span>Account Settings</span>
                                            </li>
                                            <li className="user-menu-item">
                                                <Key className="user-menu-icon" size={16} />
                                                <span>Subscription</span>
                                            </li>
                                            <li 
                                                className="user-menu-item logout"
                                                onClick={() => {
                                                    // Clear auth token
                                                    localStorage.removeItem('token');
                                                    // Redirect to root path
                                                    window.location.href = '/';
                                                }}
                                            >
                                                <LogOut className="user-menu-icon" size={16} />
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

export default Layout;