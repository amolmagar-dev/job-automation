// AutoJobApplication.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './AutoJobApplication.css';

const API_URL = 'http://localhost:3000';

const AutoJobApplication = () => {
    const [activeProvider, setActiveProvider] = useState('naukri');
    const [loading, setLoading] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [currentConfigId, setCurrentConfigId] = useState(null);

    // Form states for Naukri
    const [naukriEnabled, setNaukriEnabled] = useState(false);
    const [configName, setConfigName] = useState('My Naukri Config');
    const [naukriEmail, setNaukriEmail] = useState('');
    const [naukriPassword, setNaukriPassword] = useState('');
    const [jobKeywords, setJobKeywords] = useState('');
    const [jobLocation, setJobLocation] = useState('');
    const [jobType, setJobType] = useState('fulltime');
    const [jobExperience, setJobExperience] = useState(2);
    const [jobSortBy, setJobSortBy] = useState('Date');

    // Application settings
    const [applyFrequency, setApplyFrequency] = useState('daily');
    const [applyDays, setApplyDays] = useState([1, 2, 3, 4, 5]); // Monday to Friday
    const [maxApplications, setMaxApplications] = useState(10);
    const [minRating, setMinRating] = useState(3.5);
    const [requiredSkills, setRequiredSkills] = useState([]);

    // Notification settings
    const [emailNotify, setEmailNotify] = useState(true);
    const [whatsappNotify, setWhatsappNotify] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState('');

    // Password visibility
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Fetch all job configs when component mounts
    useEffect(() => {
        fetchConfigs();
    }, []);

    // Fetch all job configs
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
            toast.error('Failed to fetch configurations: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Load config data to form
    const loadConfigToForm = (config) => {
        // Set form fields based on config data
        setNaukriEnabled(config.isActive);
        setConfigName(config.name);
        setActiveProvider(config.portal || 'naukri');

        // Search config
        if (config.searchConfig) {
            setJobKeywords(config.searchConfig.keywords || '');
            setJobLocation(config.searchConfig.location || '');
            setJobExperience(config.searchConfig.experience || 2);
        }

        // Filter config
        if (config.filterConfig) {
            setMinRating(config.filterConfig.minRating || 3.5);
            setRequiredSkills(config.filterConfig.requiredSkills || []);
        }

        // Schedule config
        if (config.schedule) {
            setApplyFrequency(config.schedule.frequency || 'daily');
            setApplyDays(config.schedule.days || [1, 2, 3, 4, 5]);
        }

        // For now, we have to get credentials separately as they're stored in a different collection
        fetchCredentials(config.portal || 'naukri');
    };

    // Fetch credentials
    const fetchCredentials = async (portal) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            // This endpoint would need to be implemented on the backend
            const response = await axios.get(`${API_URL}/portal-credentials/${portal}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success && response.data.credential) {
                setNaukriEmail(response.data.credential.username || '');
                // Password won't be returned for security reasons
                setNaukriPassword('');
            }
        } catch (error) {
            // If credentials don't exist yet, that's okay - just leave the fields empty
            if (error.response && error.response.status !== 404) {
                toast.error('Failed to fetch credentials: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    // Save configuration and credentials
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('You must be logged in to save configurations');
                return;
            }

            // Prepare the config data
            const configData = {
                name: configName,
                isActive: naukriEnabled,
                portal: activeProvider,
                keywords: jobKeywords,
                experience: jobExperience.toString(),
                location: jobLocation,
                minRating: minRating,
                requiredSkills: jobKeywords.split(',').map(skill => skill.trim()),
                frequency: applyFrequency,
                days: applyDays,
                time: '09:00' // Default to 9 AM
            };

            let response;

            // If we have a current config ID, update it; otherwise, create a new one
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

            // If we have email and password, save credentials
            if (naukriEmail && naukriPassword) {
                const credentialData = {
                    portal: activeProvider,
                    username: naukriEmail,
                    password: naukriPassword
                };

                const credResponse = await axios.post(`${API_URL}/portal-credentials`, credentialData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (credResponse.data.success) {
                    toast.success('Credentials saved successfully');
                    // Clear password from the form for security
                    setNaukriPassword('');
                }
            }

            // Refresh the list of configs
            fetchConfigs();

        } catch (error) {
            toast.error('Failed to save configuration: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Handle disabling the service
    const handleDisableService = async () => {
        if (window.confirm('Are you sure you want to disable this service? Remember to change your password after disabling for maximum security.')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token || !currentConfigId) {
                    toast.error('You must be logged in and have an active configuration to disable the service');
                    return;
                }

                const response = await axios.patch(`${API_URL}/job-config/${currentConfigId}/toggle`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setNaukriEnabled(false);
                    toast.success('Service disabled successfully. For security, we recommend changing your password on Naukri.');

                    // Refresh the list of configs
                    fetchConfigs();
                }

            } catch (error) {
                toast.error('Failed to disable service: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle creating a new configuration
    const handleNewConfig = () => {
        // Reset the form
        setCurrentConfigId(null);
        setConfigName('New Configuration');
        setNaukriEnabled(false);
        setNaukriEmail('');
        setNaukriPassword('');
        setJobKeywords('');
        setJobLocation('');
        setJobExperience(2);
        setJobSortBy('Date');
        setApplyFrequency('daily');
        setApplyDays([1, 2, 3, 4, 5]);
        setMaxApplications(10);
        setMinRating(3.5);
        setRequiredSkills([]);
    };

    // Handle selecting a configuration
    const handleSelectConfig = (configId) => {
        const selectedConfig = configs.find(config => config.id === configId);
        if (selectedConfig) {
            setCurrentConfigId(configId);
            loadConfigToForm(selectedConfig);
        }
    };

    // Handle running a job config manually
    const handleRunConfig = async () => {
        if (!currentConfigId) {
            toast.error('You must have an active configuration to run it');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('You must be logged in to run configurations');
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
        <div className="auto-job-application">
            <div className="page-header">
                <h1>Auto Job Application</h1>
                <p>Configure automatic job application services across multiple platforms</p>
            </div>

            <div className="alert alert-warning">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                    <strong>Security Notice:</strong> For your protection, please use a dedicated email account that is not linked to banking or other sensitive services. Credentials are encrypted during transmission and not stored in plain text. When you disable a service, we recommend changing your password on that platform.
                </div>
            </div>

            {configs.length > 0 && (
                <div className="config-selector">
                    <div className="config-selector-header">
                        <h3>Your Configurations</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={handleNewConfig}
                            disabled={loading}
                        >
                            + New Config
                        </button>
                    </div>
                    <div className="config-list">
                        {configs.map(config => (
                            <div
                                key={config.id}
                                className={`config-item ${currentConfigId === config.id ? 'active' : ''}`}
                                onClick={() => handleSelectConfig(config.id)}
                            >
                                <div className="config-item-name">{config.name}</div>
                                <div className={`config-item-status ${config.isActive ? 'active' : 'inactive'}`}>
                                    {config.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="job-platforms">
                <div className={`platform-card ${activeProvider === 'naukri' ? 'active' : ''}`} onClick={() => setActiveProvider('naukri')}>
                    <div className="platform-icon">🇮🇳</div>
                    <div className="platform-info">
                        <h3>Naukri</h3>
                        <div className="platform-status">Available</div>
                    </div>
                </div>

                <div className="platform-card disabled" onClick={() => alert('Coming soon!')}>
                    <div className="platform-icon">🔗</div>
                    <div className="platform-info">
                        <h3>LinkedIn</h3>
                        <div className="platform-status coming-soon">Coming Soon</div>
                    </div>
                </div>

                <div className="platform-card disabled" onClick={() => alert('Coming soon!')}>
                    <div className="platform-icon">🌐</div>
                    <div className="platform-info">
                        <h3>Indeed</h3>
                        <div className="platform-status coming-soon">Coming Soon</div>
                    </div>
                </div>

                <div className="platform-card disabled" onClick={() => alert('Coming soon!')}>
                    <div className="platform-icon">👾</div>
                    <div className="platform-info">
                        <h3>Monster</h3>
                        <div className="platform-status coming-soon">Coming Soon</div>
                    </div>
                </div>
            </div>

            {activeProvider === 'naukri' ? (
                <div className="config-container">
                    <div className="config-header">
                        <div className="config-title">
                            <input
                                type="text"
                                className="config-name-input"
                                value={configName}
                                onChange={(e) => setConfigName(e.target.value)}
                                placeholder="Configuration Name"
                                disabled={loading}
                            />
                            <p>Set up automatic job applications on Naukri</p>
                        </div>
                        <div className="service-toggle">
                            <span>{naukriEnabled ? 'Enabled' : 'Disabled'}</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={naukriEnabled}
                                    onChange={() => setNaukriEnabled(!naukriEnabled)}
                                    disabled={loading}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="config-sections">
                            <div className="config-section">
                                <h3>Account Settings</h3>
                                <div className="form-group">
                                    <label htmlFor="naukri-email">Naukri Email</label>
                                    <input
                                        type="email"
                                        id="naukri-email"
                                        placeholder="Enter your Naukri account email"
                                        value={naukriEmail}
                                        onChange={(e) => setNaukriEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="naukri-password">Naukri Password</label>
                                    <div className="password-field">
                                        <input
                                            type={passwordVisible ? "text" : "password"}
                                            id="naukri-password"
                                            placeholder={currentConfigId ? "Enter to update password" : "Enter your Naukri account password"}
                                            value={naukriPassword}
                                            onChange={(e) => setNaukriPassword(e.target.value)}
                                            disabled={loading}
                                            required={!currentConfigId} // Only required for new configs
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={togglePasswordVisibility}
                                            disabled={loading}
                                        >
                                            {passwordVisible ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    <div className="field-note">Password is encrypted during transmission</div>
                                </div>

                                <div className="form-group">
                                    <div className="notification-options">
                                        <h4>Notification Preferences</h4>
                                        <div className="checkbox-group">
                                            <label className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    checked={emailNotify}
                                                    onChange={() => setEmailNotify(!emailNotify)}
                                                    disabled={loading}
                                                />
                                                <span className="checkmark"></span>
                                                <span>Email Notifications</span>
                                            </label>
                                        </div>

                                        <div className="checkbox-group">
                                            <label className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    checked={whatsappNotify}
                                                    onChange={() => setWhatsappNotify(!whatsappNotify)}
                                                    disabled={loading}
                                                />
                                                <span className="checkmark"></span>
                                                <span>WhatsApp Notifications</span>
                                            </label>
                                        </div>

                                        {whatsappNotify && (
                                            <div className="form-group whatsapp-number">
                                                <label htmlFor="whatsapp-number">WhatsApp Number</label>
                                                <input
                                                    type="tel"
                                                    id="whatsapp-number"
                                                    placeholder="e.g. 919730989996"
                                                    value={whatsappNumber}
                                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                                    disabled={loading}
                                                    required={whatsappNotify}
                                                />
                                                <div className="field-note">Include country code (e.g. 91 for India)</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="config-section">
                                <h3>Job Search Criteria</h3>
                                <div className="form-group">
                                    <label htmlFor="job-keywords">Job Keywords</label>
                                    <input
                                        type="text"
                                        id="job-keywords"
                                        placeholder="e.g. node,react,javascript"
                                        value={jobKeywords}
                                        onChange={(e) => setJobKeywords(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                    <div className="field-note">Separate multiple keywords with commas</div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="job-location">Preferred Location</label>
                                    <input
                                        type="text"
                                        id="job-location"
                                        placeholder="e.g. Pune, Mumbai"
                                        value={jobLocation}
                                        onChange={(e) => setJobLocation(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="job-type">Job Type</label>
                                        <select
                                            id="job-type"
                                            value={jobType}
                                            onChange={(e) => setJobType(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="fulltime">Full Time</option>
                                            <option value="parttime">Part Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="remote">Remote</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="job-experience">Experience (years)</label>
                                        <input
                                            type="number"
                                            id="job-experience"
                                            min="0"
                                            max="30"
                                            value={jobExperience}
                                            onChange={(e) => setJobExperience(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="min-rating">Minimum Company Rating</label>
                                    <input
                                        type="number"
                                        id="min-rating"
                                        min="1"
                                        max="5"
                                        step="0.1"
                                        value={minRating}
                                        onChange={(e) => setMinRating(e.target.value)}
                                        disabled={loading}
                                    />
                                    <div className="field-note">Only apply to companies with rating ≥ this value</div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="job-sort">Sort Jobs By</label>
                                    <select
                                        id="job-sort"
                                        value={jobSortBy}
                                        onChange={(e) => setJobSortBy(e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="Date">Date</option>
                                        <option value="Relevance">Relevance</option>
                                        <option value="Recommended">Recommended</option>
                                    </select>
                                </div>

                                <h3 className="section-divider">Application Settings</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="apply-frequency">Application Frequency</label>
                                        <select
                                            id="apply-frequency"
                                            value={applyFrequency}
                                            onChange={(e) => setApplyFrequency(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="max-applications">Maximum Applications</label>
                                        <input
                                            type="number"
                                            id="max-applications"
                                            min="1"
                                            max="50"
                                            value={maxApplications}
                                            onChange={(e) => setMaxApplications(e.target.value)}
                                            disabled={loading}
                                        />
                                        <div className="field-note">Maximum jobs to apply for in each cycle</div>
                                    </div>
                                </div>

                                {(applyFrequency === 'weekly' || applyFrequency === 'custom') && (
                                    <div className="form-group">
                                        <label>Apply on Days</label>
                                        <div className="day-selector">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                                <div key={index} className="day-option">
                                                    <input
                                                        type="checkbox"
                                                        id={`day-${index}`}
                                                        checked={applyDays.includes(index)}
                                                        onChange={() => {
                                                            if (applyDays.includes(index)) {
                                                                setApplyDays(applyDays.filter(d => d !== index));
                                                            } else {
                                                                setApplyDays([...applyDays, index].sort());
                                                            }
                                                        }}
                                                        disabled={loading}
                                                    />
                                                    <label htmlFor={`day-${index}`}>{day}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            {loading ? (
                                <div className="loading-spinner">Loading...</div>
                            ) : (
                                <>
                                    <button type="submit" className="btn btn-primary">
                                        {currentConfigId ? 'Update Configuration' : 'Save Configuration'}
                                    </button>

                                    {currentConfigId && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={handleRunConfig}
                                            >
                                                Run Now
                                            </button>

                                            {naukriEnabled && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={handleDisableService}
                                                >
                                                    Disable Service
                                                </button>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </form>
                </div>
            ) : (
                <div className="coming-soon-container">
                    <div className="coming-soon-icon">🔜</div>
                    <h2>Coming Soon!</h2>
                    <p>We're working on integrating with {activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)}. Check back later for updates.</p>
                    <button className="btn btn-outline">Get Notified When Available</button>
                </div>
            )}
        </div>
    );
};

export default AutoJobApplication;