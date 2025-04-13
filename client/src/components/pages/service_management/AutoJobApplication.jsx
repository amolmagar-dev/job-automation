// AutoJobApplication.jsx
import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
    Briefcase,
    Settings,
    FileText,
    Calendar,
    Bell,
    CheckCircle,
    AlertCircle,
    PlayCircle,
    PlusCircle,
    Save,
    Eye,
    EyeOff,
    User,
    Lock,
    RotateCw
} from 'lucide-react';
import './AutoJobApplication.css';

const API_URL =  'http://localhost:3000';

const AutoJobApplication = () => {
    const [activeTab, setActiveTab] = useState('portals');
    const [configName, setConfigName] = useState('My Naukri Config');
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [currentConfigId, setCurrentConfigId] = useState(null);

    // Credentials state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [credentialsSaved, setCredentialsSaved] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Search criteria state
    const [jobKeywords, setJobKeywords] = useState('');
    const [jobLocation, setJobLocation] = useState('');
    const [jobExperience, setJobExperience] = useState(2);
    const [jobType, setJobType] = useState('fulltime');
    const [minRating, setMinRating] = useState(3.5);
    const [maxApplications, setMaxApplications] = useState(10);

    // Schedule state
    const [applyFrequency, setApplyFrequency] = useState('daily');
    const [applyDays, setApplyDays] = useState([1, 2, 3, 4, 5]); // Monday to Friday
    const [applyTime, setApplyTime] = useState('09:00');

    // Resume update state
    const [autoUpdateResume, setAutoUpdateResume] = useState(false);
    const [optimizeKeywords, setOptimizeKeywords] = useState(true);

    // Portal data
    const portalData = [
        { id: 'N', name: 'Naukri', available: true, status: 'Available' },
        { id: 'L', name: 'Linkedin', available: false, status: 'Coming Soon' },
        { id: 'I', name: 'Indeed', available: false, status: 'Coming Soon' },
        { id: 'M', name: 'Monster', available: false, status: 'Coming Soon' }
    ];

    // Fetch all job configs when component mounts
    useEffect(() => {
        fetchConfigs();
    }, []);

    // Fetch all job configurations
    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('You must be logged in to view configurations');
                return;
            }

            const response = await axios.get(`${API_URL}/job-config`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setConfigs(response.data.configs);

                // If we have configs, set the first one as active
                if (response.data.configs.length > 0) {
                    const firstConfig = response.data.configs[0];
                    setCurrentConfigId(firstConfig.id);
                    loadConfigToForm(firstConfig);
                }
            }
        } catch (error) {
            console.error('Failed to fetch configurations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load config data to form
    const loadConfigToForm = (config) => {
        setConfigName(config.name);
        setIsActive(config.isActive);

        // Search config
        if (config.searchConfig) {
            setJobKeywords(config.searchConfig.keywords || '');
            setJobLocation(config.searchConfig.location || '');
            setJobExperience(config.searchConfig.experience || 2);
        }

        // Schedule settings
        if (config.schedule) {
            setApplyFrequency(config.schedule.frequency || 'daily');
            setApplyDays(config.schedule.days || [1, 2, 3, 4, 5]);
            setApplyTime(config.schedule.time || '09:00');
        }

        // Fetch credentials for this config
        fetchCredentials('naukri');
    };

    // Fetch credentials for a portal
    const fetchCredentials = async (portal) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) return;

            const response = await axios.get(`${API_URL}/portal-credentials/${portal}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success && response.data.credential) {
                setUsername(response.data.credential.username || '');
                setCredentialsSaved(true);
                // Password won't be returned for security
                setPassword('');
            }
        } catch (error) {
            // If no credentials found, that's okay
            if (error.response && error.response.status === 404) {
                setCredentialsSaved(false);
            }
        }
    };

    // Save credentials
    const saveCredentials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('You must be logged in to save credentials');
                return;
            }

            if (!username) {
                toast.error('Username is required');
                return;
            }

            // Only require password for new credentials
            if (!credentialsSaved && !password) {
                toast.error('Password is required');
                return;
            }

            const credentialData = {
                portal: 'naukri',
                username: username,
                password: password || undefined // Only send if provided
            };

            const response = await axios.post(`${API_URL}/portal-credentials`, credentialData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setCredentialsSaved(true);
                setPassword(''); // Clear password for security
                toast.success('Credentials saved successfully');
            }
        } catch (error) {
            toast.error('Failed to save credentials: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Verify credentials
    const verifyConnection = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('You must be logged in to verify credentials');
                return;
            }

            // Check if we have credentials to verify
            if (!username) {
                toast.error('Username is required');
                return;
            }

            // For verification, we need the password
            if (!password && !credentialsSaved) {
                toast.error('Password is required for verification');
                return;
            }

            // Create the request body with credentials
            const verifyData = {
                username: username,
                password: password
            };

            const response = await axios.post(
                `${API_URL}/portal-credentials/naukri/verify`,
                verifyData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response) {
                toast('Here is your toast.')
            }
        } catch (error) {
            toast.error('Failed to verify connection: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Save configuration
    const saveConfig = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('You must be logged in to save configurations');
                return;
            }

            // Validate required fields
            if (!configName || !jobKeywords || !jobLocation) {
                toast.error('Name, job keywords, and location are required');
                return;
            }

            // Prepare the config data
            const configData = {
                name: configName,
                isActive: isActive,
                portal: 'naukri',
                keywords: jobKeywords,
                experience: jobExperience.toString(),
                location: jobLocation,
                minRating: minRating,
                requiredSkills: jobKeywords.split(',').map(skill => skill.trim()),
                frequency: applyFrequency,
                days: applyDays,
                time: applyTime
            };

            let response;

            // Update or create configuration
            if (currentConfigId) {
                response = await axios.put(`${API_URL}/job-config/${currentConfigId}`, configData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    toast.success('Configuration updated successfully');
                }
            } else {
                response = await axios.post(`${API_URL}/job-config`, configData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setCurrentConfigId(response.data.config.id);
                    toast.success('Configuration created successfully');
                }
            }

            // Refresh configurations
            fetchConfigs();

        } catch (error) {
            toast.error('Failed to save configuration: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Run job now
    const runNow = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token || !currentConfigId) {
                toast.error('You must have a saved configuration to run it');
                return;
            }

            const response = await axios.post(`${API_URL}/job-config/${currentConfigId}/run`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Job execution triggered successfully');
            }
        } catch (error) {
            toast.error('Failed to run job: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="job-automation-container">
            <div className="job-automation-header">
                <h1>Job Automation</h1>
                <div className="config-header">
                    <input
                        type="text"
                        className="config-name-input"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        placeholder="Configuration Name"
                    />
                    <div className="config-actions">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="status-label">{isActive ? 'Active' : 'Inactive'}</span>
                        <button className="btn-outline" onClick={runNow}>
                            <PlayCircle size={18} />
                            Run Now
                        </button>
                        <button className="btn-primary" onClick={saveConfig}>
                            <Save size={18} />
                            Save
                        </button>
                    </div>
                </div>
            </div>

            <div className="tab-navigation">
                <button
                    className={`tab-item ${activeTab === 'portals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('portals')}
                >
                    <Briefcase size={18} />
                    Job Portals
                </button>
                <button
                    className={`tab-item ${activeTab === 'criteria' ? 'active' : ''}`}
                    onClick={() => setActiveTab('criteria')}
                >
                    <Settings size={18} />
                    Search Criteria
                </button>
                <button
                    className={`tab-item ${activeTab === 'resume' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resume')}
                >
                    <FileText size={18} />
                    Resume Update
                </button>
                <button
                    className={`tab-item ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    <Calendar size={18} />
                    Schedule
                </button>
                <button
                    className={`tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell size={18} />
                    Notifications
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'portals' && (
                    <div className="content-panel">
                        <h2>Job Portal Credentials</h2>
                        <p>Configure your job portal accounts to enable automated job applications</p>

                        <div className="portal-selector">
                            {portalData.map(portal => (
                                <div
                                    key={portal.id}
                                    className={`portal-option ${portal.id === 'N' ? 'active' : ''} ${!portal.available ? 'disabled' : ''}`}
                                >
                                    <div className="portal-letter">{portal.id}</div>
                                    <div className="portal-info">
                                        <div className="portal-name">{portal.name}</div>
                                        <div className={`portal-status ${portal.available ? 'available' : 'soon'}`}>
                                            {portal.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="credential-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <User size={18} />
                                        Username / Email
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your Naukri email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Lock size={18} />
                                        Password
                                    </label>
                                    <div className="password-field">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={credentialsSaved ? "Enter new password only if you want to change it" : "Enter your Naukri password"}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="field-hint">Enter new password only if you want to change it</div>
                                </div>
                            </div>

                            <div className="button-group">
                                <button className="btn-primary" onClick={saveCredentials}>
                                    <Save size={18} />
                                    Save Credentials
                                </button>
                                <button className="btn-outline" onClick={verifyConnection}>
                                    <RotateCw size={18} />
                                    Verify Connection
                                </button>
                            </div>

                            {credentialsSaved && (
                                <div className="success-message">
                                    <CheckCircle size={18} />
                                    Naukri credentials saved
                                </div>
                            )}

                            <div className="security-message">
                                <AlertCircle size={18} />
                                <p>For security reasons, use a dedicated email that isn't linked to sensitive accounts. Passwords are encrypted during transmission and storage.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'criteria' && (
                    <div className="content-panel">
                        <h2>Search Criteria</h2>
                        <p>Define what jobs you're looking for and your preferences</p>

                        <div className="search-criteria-form">
                            <div className="form-group">
                                <label>Job Keywords</label>
                                <input
                                    type="text"
                                    value={jobKeywords}
                                    onChange={(e) => setJobKeywords(e.target.value)}
                                    placeholder="e.g. javascript,react,node"
                                />
                                <div className="field-hint">Separate multiple keywords with commas</div>
                            </div>

                            <div className="form-group">
                                <label>Job Location</label>
                                <input
                                    type="text"
                                    value={jobLocation}
                                    onChange={(e) => setJobLocation(e.target.value)}
                                    placeholder="e.g. Bangalore, Remote"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Experience (years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={jobExperience}
                                        onChange={(e) => setJobExperience(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Job Type</label>
                                    <select
                                        value={jobType}
                                        onChange={(e) => setJobType(e.target.value)}
                                    >
                                        <option value="fulltime">Full Time</option>
                                        <option value="parttime">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="remote">Remote</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Minimum Company Rating: {minRating}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={minRating}
                                    onChange={(e) => setMinRating(e.target.value)}
                                />
                                <div className="field-hint">Only apply to companies with ratings at or above this value</div>
                            </div>

                            <div className="form-group">
                                <label>Maximum Applications Per Run: {maxApplications}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={maxApplications}
                                    onChange={(e) => setMaxApplications(e.target.value)}
                                />
                                <div className="field-hint">Limit how many applications to submit each time</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'resume' && (
                    <div className="content-panel">
                        <h2>Resume Optimization</h2>
                        <p>Configure how your resume should be optimized for each job application</p>

                        <div className="resume-settings">
                            <div className="toggle-setting">
                                <div>
                                    <h3>Auto-Update Resume</h3>
                                    <p>Automatically optimize your resume for each job application</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={autoUpdateResume}
                                        onChange={() => setAutoUpdateResume(!autoUpdateResume)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            {autoUpdateResume && (
                                <div className="resume-options">
                                    <div className="option-card">
                                        <div className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                id="optimize-keywords"
                                                checked={optimizeKeywords}
                                                onChange={() => setOptimizeKeywords(!optimizeKeywords)}
                                            />
                                            <label htmlFor="optimize-keywords">
                                                <div className="checkbox-title">Optimize for Keywords</div>
                                                <div className="checkbox-description">Analyze job descriptions and highlight matching skills and experiences</div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="resume-uploader">
                                        <h3>Upload Base Resume</h3>
                                        <p>Upload your current resume to use as the foundation for optimizations</p>
                                        <button className="btn-outline">
                                            <FileText size={18} />
                                            Upload Resume
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="content-panel">
                        <h2>Application Schedule</h2>
                        <p>Configure when the automated job applications should run</p>

                        <div className="schedule-settings">
                            <div className="form-group">
                                <label>Application Frequency</label>
                                <div className="radio-group">
                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="frequency"
                                            value="daily"
                                            checked={applyFrequency === 'daily'}
                                            onChange={() => setApplyFrequency('daily')}
                                        />
                                        <span>Daily</span>
                                    </label>

                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="frequency"
                                            value="weekly"
                                            checked={applyFrequency === 'weekly'}
                                            onChange={() => setApplyFrequency('weekly')}
                                        />
                                        <span>Weekly</span>
                                    </label>

                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="frequency"
                                            value="custom"
                                            checked={applyFrequency === 'custom'}
                                            onChange={() => setApplyFrequency('custom')}
                                        />
                                        <span>Custom</span>
                                    </label>
                                </div>
                            </div>

                            {(applyFrequency === 'weekly' || applyFrequency === 'custom') && (
                                <div className="form-group">
                                    <label>Run on these days</label>
                                    <div className="day-selector">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                            <div
                                                key={index}
                                                className={`day-item ${applyDays.includes(index) ? 'selected' : ''}`}
                                                onClick={() => {
                                                    if (applyDays.includes(index)) {
                                                        setApplyDays(applyDays.filter(d => d !== index));
                                                    } else {
                                                        setApplyDays([...applyDays, index].sort());
                                                    }
                                                }}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Run Time</label>
                                <input
                                    type="time"
                                    value={applyTime}
                                    onChange={(e) => setApplyTime(e.target.value)}
                                />
                                <div className="field-hint">When to run the automation each day (24-hour format)</div>
                            </div>

                            <div className="next-run-card">
                                <div>
                                    <h3>Next Scheduled Run</h3>
                                    <p className="next-run-time">
                                        {(() => {
                                            // Calculate next run based on current settings
                                            const now = new Date();
                                            const [hours, minutes] = applyTime.split(':').map(Number);

                                            let nextRun = new Date();
                                            nextRun.setHours(hours, minutes, 0, 0);

                                            if (nextRun <= now) {
                                                nextRun.setDate(nextRun.getDate() + 1);
                                            }

                                            if (applyFrequency === 'weekly' || applyFrequency === 'custom') {
                                                if (applyDays.length > 0) {
                                                    const currentDay = now.getDay();
                                                    let daysUntilNext = 7;

                                                    for (const day of applyDays) {
                                                        const daysUntil = (day - currentDay + 7) % 7;
                                                        if (daysUntil < daysUntilNext && (daysUntil > 0 || (daysUntil === 0 && nextRun > now))) {
                                                            daysUntilNext = daysUntil;
                                                        }
                                                    }

                                                    nextRun = new Date(now);
                                                    nextRun.setDate(now.getDate() + daysUntilNext);
                                                    nextRun.setHours(hours, minutes, 0, 0);
                                                } else {
                                                    return "No days selected";
                                                }
                                            }

                                            return nextRun.toLocaleString();
                                        })()}
                                    </p>
                                </div>
                                <button className="btn-primary" onClick={runNow}>
                                    <PlayCircle size={18} />
                                    Run Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="content-panel">
                        <h2>Notification Settings</h2>
                        <p>Configure how you want to be notified about job applications</p>

                        <div className="notification-settings">
                            <div className="toggle-setting">
                                <div>
                                    <h3>Email Notifications</h3>
                                    <p>Receive email notifications for application status updates</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="toggle-setting">
                                <div>
                                    <h3>WhatsApp Notifications</h3>
                                    <p>Receive WhatsApp notifications for application status updates</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={false}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="notification-types">
                                <h3>Notify me about:</h3>

                                <div className="checkbox-group">
                                    <div className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="notify-applied"
                                            checked={true}
                                        />
                                        <label htmlFor="notify-applied">
                                            <div className="checkbox-title">Successful Applications</div>
                                            <div className="checkbox-description">When your profile is successfully submitted to a job</div>
                                        </label>
                                    </div>

                                    <div className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="notify-interview"
                                            checked={true}
                                        />
                                        <label htmlFor="notify-interview">
                                            <div className="checkbox-title">Interview Invitations</div>
                                            <div className="checkbox-description">When you receive an interview request</div>
                                        </label>
                                    </div>

                                    <div className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="notify-errors"
                                            checked={true}
                                        />
                                        <label htmlFor="notify-errors">
                                            <div className="checkbox-title">Errors & Issues</div>
                                            <div className="checkbox-description">When there are problems with the automation</div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="configs-panel">
                <div className="configs-header">
                    <h3>My Configurations</h3>
                    <button className="btn-icon">
                        <PlusCircle size={18} />
                    </button>
                </div>

                <div className="configs-list">
                    <div className="config-item active">
                        <span className="config-name">My Naukri Config</span>
                        <span className="config-status inactive">Inactive</span>
                    </div>
                    <div className="config-item">
                        <span className="config-name">New Configuration</span>
                        <span className="config-status inactive">Inactive</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoJobApplication;