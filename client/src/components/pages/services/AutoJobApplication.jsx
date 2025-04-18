import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Briefcase,
    Settings,
    Calendar,
    Bell,
    CheckCircle,
    AlertCircle,
    PlayCircle,
    Save,
    Eye,
    EyeOff,
    User,
    Lock,
    RotateCw,
    Brain,
    Download,
    ChevronRight,
    ChevronLeft,
    Check
} from 'lucide-react';
import { jobConfigService } from '../../../services/jobConfigService';
import { portalCredentialService } from '../../../services/portalCredentialService';

const AutoJobApplication = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [configName, setConfigName] = useState('my auto job config');
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [currentConfigId, setCurrentConfigId] = useState(null);

    // Credentials state
    const [selectedPortal, setSelectedPortal] = useState('naukri');
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

    // AI Training state
    const [selfDescription, setSelfDescription] = useState('');
    const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

    // Schedule state
    const [applyFrequency, setApplyFrequency] = useState('daily');
    const [applyDays, setApplyDays] = useState([1, 2, 3, 4, 5]); // Monday to Friday
    const [applyTime, setApplyTime] = useState('09:00');
    const [applyHourlyInterval, setApplyHourlyInterval] = useState(1);

    // Portal data
    const portalData = [
        { id: 'N', name: 'Naukri', available: true, status: 'Available' },
        { id: 'L', name: 'Linkedin', available: false, status: 'Coming Soon' },
        { id: 'I', name: 'Indeed', available: false, status: 'Coming Soon' },
        { id: 'M', name: 'Monster', available: false, status: 'Coming Soon' }
    ];

    // Steps configuration
    const steps = [
        { id: 1, title: 'Portal Credentials', icon: <Briefcase size={20} /> },
        { id: 2, title: 'Search Criteria', icon: <Settings size={20} /> },
        { id: 3, title: 'AI Training', icon: <Brain size={20} /> },
        { id: 4, title: 'Schedule', icon: <Calendar size={20} /> },
        { id: 5, title: 'Notifications', icon: <Bell size={20} /> },
        { id: 6, title: 'Review & Save', icon: <CheckCircle size={20} /> }
    ];

    // Fetch all job configs when component mounts
    useEffect(() => {
        fetchConfigs();
    }, []);

    // Move to next step
    const nextStep = () => {
        if (currentStep === 1 && !credentialsSaved) {
            toast.error('Please save your credentials before proceeding');
            return;
        }
        
        if (currentStep === 2 && (!jobKeywords || !jobLocation)) {
            toast.error('Job keywords and location are required');
            return;
        }
        
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    // Move to previous step
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    // Go to specific step
    const goToStep = (step) => {
        if (step <= currentStep) {
            setCurrentStep(step);
            window.scrollTo(0, 0);
        }
    };

    // Fetch all job configurations
    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('You must be logged in to view configurations');
                return;
            }

            const response = await jobConfigService.getConfigs();

            if (response.success) {
                setConfigs(response.configs);

                // If we have configs, set the first one as active
                if (response.configs.length > 0) {
                    const firstConfig = response.configs[0];
                    setCurrentConfigId(firstConfig.id);
                    loadConfigToForm(firstConfig);
                }
            }
        } catch (error) {
            console.error('Failed to fetch configurations:', error);
            toast.error('Failed to load configurations');
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
            setApplyHourlyInterval(config.schedule.hourlyInterval || 1);
        }

        // AI Training settings
        if (config.aiTraining && config.aiTraining.selfDescription) {
            setSelfDescription(config.aiTraining.selfDescription);
        } else {
            setSelfDescription('');
        }

        // Fetch credentials for this config
        fetchCredentials('naukri');
    };

    // Fetch credentials for a portal
    const fetchCredentials = async (portal) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await portalCredentialService.getCredentials(portal);

            if (response.success && response.credential) {
                setUsername(response.credential.username || '');
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
                portal: selectedPortal,
                username: username,
                password: password || undefined // Only send if provided
            };

            const response = await portalCredentialService.saveCredentials(credentialData);

            if (response.success) {
                setCredentialsSaved(true);
                setPassword('');
                toast.success('Credentials saved successfully');
            }
        } catch (error) {
            toast.error('Failed to save credentials: ' + (error.response?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Verify credentials
    const verifyConnection = async () => {
        try {
            setLoading(true);
            
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

            const response = await portalCredentialService.verifyCredentials(selectedPortal, verifyData);
            
            if (response.success) {
                toast.success('Credentials verified successfully');
            }
        } catch (error) {
            toast.error('Failed to verify connection: ' + (error.response?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Analyze user profile
    const analyzeProfile = async () => {
        try {
            setIsGeneratingProfile(true);

            if (!currentConfigId) {
                toast.error('Please save your configuration first');
                return;
            }
            
            // Call the API endpoint to analyze profile
            const response = await jobConfigService.analyzeProfile(currentConfigId, selectedPortal);

            if (response.success) {
                // Update the UI with the generated description
                setSelfDescription(response.aiTraining.selfDescription);
                toast.success('Profile analyzed and description generated successfully');
            }
        } catch (error) {
            toast.error('Failed to analyze profile: ' + (error.response?.message || error.message));
        } finally {
            setIsGeneratingProfile(false);
        }
    };

    // Save configuration
    const saveConfig = async () => {
        try {
            setLoading(true);
            
            // Validate required fields
            if (!configName || !jobKeywords || !jobLocation) {
                toast.error('Name, job keywords, and location are required');
                return;
            }

            // Prepare the config data
            const configData = {
                name: configName,
                isActive: isActive,
                portal: selectedPortal,
                keywords: jobKeywords,
                experience: jobExperience.toString(),
                location: jobLocation,
                minRating: minRating,
                requiredSkills: jobKeywords.split(',').map(skill => skill.trim()),
                frequency: applyFrequency,
                days: applyDays,
                time: applyTime,
                hourlyInterval: applyHourlyInterval,
                aiTraining: {
                    selfDescription: selfDescription
                }
            };

            let response;

            // Update or create configuration
            if (currentConfigId) {
                response = await jobConfigService.updateConfig(currentConfigId, configData);

                if (response.success) {
                    toast.success('Configuration updated successfully');
                }
            } else {
                response = await jobConfigService.createConfig(configData);
                if (response.success) {
                    setCurrentConfigId(response.config.id);
                    toast.success('Configuration created successfully');
                }
            }

            // Refresh configurations
            fetchConfigs();

        } catch (error) {
            toast.error('Failed to save configuration: ' + (error.response?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Run job now
    const runNow = async () => {
        try {
            setLoading(true);
            if (!currentConfigId) {
                toast.error('You must have a saved configuration to run it');
                return;
            }
            const response = await jobConfigService.runConfig(currentConfigId);
            if (response.success) {
                toast.success('Job execution triggered successfully');
            }
        } catch (error) {
            toast.error('Failed to run job: ' + (error.response?.message || error.message));
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to get next run time
    const getNextRunTime = () => {
        // Calculate next run based on current settings
        const now = new Date();
        
        if (applyFrequency === 'hourly') {
            const nextRun = new Date(now);
            nextRun.setHours(now.getHours() + parseInt(applyHourlyInterval));
            return nextRun.toLocaleString();
        }
        
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
    };

    // Render the portal credentials step
    const renderPortalStep = () => {
        return (
            <div className="step-content">
                <h2 className="step-title">Job Portal Credentials</h2>
                <p className="step-description">Set up your job portal account credentials to enable automated applications</p>
                
                <div className="portal-selector">
                    {portalData.map(portal => (
                        <div
                            key={portal.id}
                            className={`portal-option ${portal.id === 'N' ? 'active' : ''} ${!portal.available ? 'disabled' : ''}`}
                            onClick={() => portal.available && setSelectedPortal(portal.name.toLowerCase())}
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
                
                <div className="credentials-form">
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
                        {credentialsSaved && (
                            <div className="info-message success">
                                <CheckCircle size={16} />
                                <span>Credentials saved</span>
                            </div>
                        )}
                    </div>

                    <div className="button-row">
                        <button className="btn-primary" onClick={saveCredentials} disabled={loading}>
                            <Save size={18} />
                            Save Credentials
                        </button>
                        <button className="btn-outline" onClick={verifyConnection} disabled={loading}>
                            <RotateCw size={18} />
                            Verify Connection
                        </button>
                    </div>
                    
                    <div className="info-message warning">
                        <AlertCircle size={18} />
                        <p>For security reasons, use a dedicated email that isn't linked to sensitive accounts. Passwords are encrypted during transmission and storage.</p>
                    </div>
                </div>
            </div>
        );
    };

    // Render the search criteria step
    const renderSearchCriteriaStep = () => {
        return (
            <div className="step-content">
                <h2 className="step-title">Job Search Criteria</h2>
                <p className="step-description">Define what jobs you're looking for and your preferences</p>
                
                <div className="criteria-form">
                    <div className="form-group">
                        <label>Job Keywords</label>
                        <input
                            type="text"
                            value={jobKeywords}
                            onChange={(e) => setJobKeywords(e.target.value)}
                            placeholder="e.g. javascript, react, node.js"
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
                        <div className="range-labels">
                            <span>1</span>
                            <span>5</span>
                        </div>
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
                        <div className="range-labels">
                            <span>1</span>
                            <span>50</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render the AI training step
    const renderAITrainingStep = () => {
        return (
            <div className="step-content">
                <h2 className="step-title">Train Your AI</h2>
                <p className="step-description">Tell the AI about yourself so it can answer questions during job applications</p>
                
                <div className="ai-training-form">
                    <div className="form-group">
                        <label>About Yourself</label>
                        <textarea
                            rows="8"
                            value={selfDescription}
                            onChange={(e) => setSelfDescription(e.target.value)}
                            placeholder="Describe your skills, experience, education, and career goals. The more details you provide, the better the AI can represent you."
                            className="text-area"
                        ></textarea>
                        <div className="field-hint">Write in first person as if you're introducing yourself in an interview</div>
                    </div>

                    <div className="button-row">
                        <button 
                            className="btn-primary"
                            onClick={() => {
                                if (selfDescription.trim().length === 0) {
                                    toast.error('Please provide a description about yourself');
                                    return;
                                }
                                toast.success('AI training data saved');
                            }}
                            disabled={loading}
                        >
                            <Save size={18} />
                            Save Description
                        </button>

                        <button
                            className="btn-outline"
                            onClick={analyzeProfile}
                            disabled={isGeneratingProfile || !credentialsSaved || loading}
                        >
                            {isGeneratingProfile ? (
                                <>
                                    <RotateCw size={18} className="spinning-icon" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Generate from Your Profile
                                </>
                            )}
                        </button>
                    </div>

                    {!credentialsSaved && (
                        <div className="info-message warning">
                            <AlertCircle size={18} />
                            <p>Please save your credentials in the Job Portals step before analyzing your profile.</p>
                        </div>
                    )}

                    <div className="ai-capabilities">
                        <div className="capabilities-header">
                            <Brain size={18} />
                            <h3>What the AI Can Do</h3>
                        </div>
                        <div className="capabilities-grid">
                            <div className="capability-item">
                                <CheckCircle size={16} />
                                <span>Answer common screening questions</span>
                            </div>
                            <div className="capability-item">
                                <CheckCircle size={16} />
                                <span>Highlight relevant skills for each job</span>
                            </div>
                            <div className="capability-item">
                                <CheckCircle size={16} />
                                <span>Maintain professional tone</span>
                            </div>
                            <div className="capability-item">
                                <CheckCircle size={16} />
                                <span>Represent your qualifications accurately</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render the schedule step
    const renderScheduleStep = () => {
        return (
            <div className="step-content">
                <h2 className="step-title">Application Schedule</h2>
                <p className="step-description">Configure when the automated job applications should run</p>
                
                <div className="schedule-form">
                    <div className="form-group">
                        <label>Application Frequency</label>
                        <div className="radio-group">
                            <label className="radio-item">
                                <input
                                    type="radio"
                                    name="frequency"
                                    value="hourly"
                                    checked={applyFrequency === 'hourly'}
                                    onChange={() => setApplyFrequency('hourly')}
                                />
                                <span>Hourly</span>
                            </label>

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
                    
                    {applyFrequency === 'hourly' && (
                        <div className="form-group">
                            <label>Run every</label>
                            <div className="interval-input">
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={applyHourlyInterval}
                                    onChange={(e) => setApplyHourlyInterval(e.target.value)}
                                />
                                <span className="interval-label">hour(s)</span>
                            </div>
                        </div>
                    )}

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

                    {applyFrequency !== 'hourly' && (
                        <div className="form-group">
                            <label>Run Time</label>
                            <input
                                type="time"
                                value={applyTime}
                                onChange={(e) => setApplyTime(e.target.value)}
                            />
                            <div className="field-hint">When to run the automation each day (24-hour format)</div>
                        </div>
                    )}

                    <div className="next-run-card">
                        <div>
                            <h3>Next Scheduled Run</h3>
                            <p className="next-run-time">{getNextRunTime()}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render the notifications step
    const renderNotificationsStep = () => {
        return (
            <div className="step-content">
                <h2 className="step-title">Notification Settings</h2>
                <p className="step-description">Configure how you want to be notified about job applications</p>
                
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
                                readOnly
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
                                readOnly
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
                                    readOnly
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
                                    readOnly
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
                                    readOnly
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
        );
    };

    // Render the final review step
    const renderReviewStep = () => {
        return (
            <div className="step-content">
                <h2 className="step-title">Review & Save</h2>
                <p className="step-description">Review your configuration and save it to activate automated job applications</p>
                
                <div className="review-summary">
                    <div className="config-name-row">
                        <label>Configuration Name</label>
                        <input
                            type="text"
                            value={configName}
                            onChange={(e) => setConfigName(e.target.value)}
                            placeholder="Enter a name for this configuration"
                        />
                    </div>
                    
                    <div className="toggle-row">
                        <div>
                            <h3>Activate Configuration</h3>
                            <p>When active, the system will automatically apply to jobs based on your schedule</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    
                    <div className="summary-sections">
                        <div className="summary-section">
                            <div className="section-header">
                                <Briefcase size={18} />
                                <h3>Portal & Credentials</h3>
                            </div>
                            <div className="section-content">
                                <div className="summary-item">
                                    <span className="item-label">Job Portal:</span>
                                    <span className="item-value">Naukri</span>
                                </div>
                                <div className="summary-item">
                                    <span className="item-label">Username:</span>
                                    <span className="item-value">{username}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="item-label">Status:</span>
                                    <span className={`status-badge ${credentialsSaved ? 'success' : 'warning'}`}>
                                        {credentialsSaved ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                            </div>
                            <button className="edit-button" onClick={() => goToStep(1)}>
                                Edit
                            </button>
                        </div>
                        
                        <div className="summary-section">
                            <div className="section-header">
                                <Settings size={18} />
                                <h3>Search Criteria</h3>
                            </div>
                            <div className="section-content">
                                <div className="summary-item">
                                    <span className="item-label">Keywords:</span>
                                    <span className="item-value">{jobKeywords}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="item-label">Location:</span>
                                    <span className="item-value">{jobLocation}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="item-label">Experience:</span>
                                    <span className="item-value">{jobExperience} years</span>
                                </div>
                                <div className="summary-item">
                                    <span className="item-label">Job Type:</span>
                                    <span className="item-value">{jobType}</span>
                                </div>
                            </div>
                            <button className="edit-button" onClick={() => goToStep(2)}>
                                Edit
                            </button>
                        </div>
                        
                        <div className="summary-section">
                            <div className="section-header">
                                <Calendar size={18} />
                                <h3>Schedule</h3>
                            </div>
                            <div className="section-content">
                                <div className="summary-item">
                                    <span className="item-label">Frequency:</span>
                                    <span className="item-value">{applyFrequency}</span>
                                </div>
                                {applyFrequency === 'hourly' && (
                                    <div className="summary-item">
                                        <span className="item-label">Every:</span>
                                        <span className="item-value">{applyHourlyInterval} hour(s)</span>
                                    </div>
                                )}
                                {applyFrequency !== 'hourly' && (
                                    <div className="summary-item">
                                        <span className="item-label">Time:</span>
                                        <span className="item-value">{applyTime}</span>
                                    </div>
                                )}
                                {(applyFrequency === 'weekly' || applyFrequency === 'custom') && (
                                    <div className="summary-item">
                                        <span className="item-label">Days:</span>
                                        <span className="item-value">
                                            {applyDays.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ')}
                                        </span>
                                    </div>
                                )}
                                <div className="summary-item">
                                    <span className="item-label">Next Run:</span>
                                    <span className="item-value next-run">{getNextRunTime()}</span>
                                </div>
                            </div>
                            <button className="edit-button" onClick={() => goToStep(4)}>
                                Edit
                            </button>
                        </div>
                    </div>
                    
                    <div className="final-actions">
                        <button className="btn-outline" onClick={runNow} disabled={loading || !currentConfigId}>
                            <PlayCircle size={18} />
                            Run Now
                        </button>
                        <button className="btn-primary" onClick={saveConfig} disabled={loading}>
                            <Save size={18} />
                            {currentConfigId ? 'Update Configuration' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render the appropriate step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderPortalStep();
            case 2:
                return renderSearchCriteriaStep();
            case 3:
                return renderAITrainingStep();
            case 4:
                return renderScheduleStep();
            case 5:
                return renderNotificationsStep();
            case 6:
                return renderReviewStep();
            default:
                return null;
        }
    };

    return (
        <div className="auto-job-wrapper">
            <Toaster position="top-right" />
            <div className="steps-container">
                <div className="steps-indicator">
                    {steps.map(step => (
                        <div 
                            key={step.id} 
                            className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                            onClick={() => goToStep(step.id)}
                        >
                            <div className="step-icon">
                                {currentStep > step.id ? <Check size={16} /> : step.icon}
                            </div>
                            <div className="step-info">
                                <div className="step-number">Step {step.id}</div>
                                <div className="step-name">{step.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="step-content-container">
                    {renderStepContent()}
                    
                    <div className="step-actions">
                        {currentStep > 1 && (
                            <button className="btn-outline" onClick={prevStep}>
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                        )}
                        
                        {currentStep < steps.length && (
                            <button className="btn-primary" onClick={nextStep}>
                                {currentStep === steps.length - 1 ? 'Review' : 'Continue'}
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default AutoJobApplication;