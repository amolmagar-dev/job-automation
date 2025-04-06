// AutoJobApplication.jsx
import React, { useState } from 'react';
import './AutoJobApplication.css';

const AutoJobApplication = () => {
    const [activeProvider, setActiveProvider] = useState('naukri');

    // Form states for Naukri
    const [naukriEnabled, setNaukriEnabled] = useState(false);
    const [naukriEmail, setNaukriEmail] = useState('');
    const [naukriPassword, setNaukriPassword] = useState('');
    const [jobKeywords, setJobKeywords] = useState('');
    const [jobLocation, setJobLocation] = useState('');
    const [jobType, setJobType] = useState('fulltime');
    const [jobExperience, setJobExperience] = useState(2);
    const [jobSortBy, setJobSortBy] = useState('Date');

    // Application settings
    const [applyFrequency, setApplyFrequency] = useState('daily');
    const [maxApplications, setMaxApplications] = useState(10);

    // Notification settings
    const [emailNotify, setEmailNotify] = useState(true);
    const [whatsappNotify, setWhatsappNotify] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState('');

    // Password visibility
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Saving configuration...');
        alert('Configuration saved successfully!');
    };

    const handleDisableService = () => {
        if (window.confirm('Are you sure you want to disable this service? Remember to change your password after disabling for maximum security.')) {
            setNaukriEnabled(false);
            setNaukriPassword('');
            alert('Service disabled. For security, we recommend changing your password on Naukri.');
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
                    <strong>Security Notice:</strong> For your protection, please use a dedicated email account that is not linked to banking or other sensitive services. Credentials are encrypted during transmission and not stored permanently. When you disable a service, we recommend changing your password on that platform.
                </div>
            </div>

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
                            <h2>Naukri Configuration</h2>
                            <p>Set up automatic job applications on Naukri</p>
                        </div>
                        <div className="service-toggle">
                            <span>{naukriEnabled ? 'Enabled' : 'Disabled'}</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={naukriEnabled}
                                    onChange={() => setNaukriEnabled(!naukriEnabled)}
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
                                        disabled={!naukriEnabled}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="naukri-password">Naukri Password</label>
                                    <div className="password-field">
                                        <input
                                            type={passwordVisible ? "text" : "password"}
                                            id="naukri-password"
                                            placeholder="Enter your Naukri account password"
                                            value={naukriPassword}
                                            onChange={(e) => setNaukriPassword(e.target.value)}
                                            disabled={!naukriEnabled}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={togglePasswordVisibility}
                                            disabled={!naukriEnabled}
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
                                                    disabled={!naukriEnabled}
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
                                                    disabled={!naukriEnabled}
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
                                                    disabled={!naukriEnabled}
                                                    required
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
                                        disabled={!naukriEnabled}
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
                                        disabled={!naukriEnabled}
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
                                            disabled={!naukriEnabled}
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
                                            disabled={!naukriEnabled}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="job-sort">Sort Jobs By</label>
                                    <select
                                        id="job-sort"
                                        value={jobSortBy}
                                        onChange={(e) => setJobSortBy(e.target.value)}
                                        disabled={!naukriEnabled}
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
                                            disabled={!naukriEnabled}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekdays">Weekdays Only</option>
                                            <option value="weekly">Weekly</option>
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
                                            disabled={!naukriEnabled}
                                        />
                                        <div className="field-note">Maximum jobs to apply for in each cycle</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            {naukriEnabled ? (
                                <>
                                    <button type="submit" className="btn btn-primary">Save Configuration</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDisableService}>Disable Service</button>
                                </>
                            ) : (
                                <button type="submit" className="btn btn-success">Enable Service</button>
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