import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
    BriefcaseBusiness,
    Search,
    CheckCircle,
    FileText,
    BarChart3,
    Zap,
    Users,
    Award
} from 'lucide-react';
import './JobSuiteXLanding.css';

const JobSuiteXLanding = () => {
    const navigate = useNavigate();
    const { register, login, googleAuth, isAuthenticated, loading, error } = useAuth();

    const [isSignIn, setIsSignIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const features = [
        {
            id: 0,
            icon: <Search className="feature-icon" />,
            title: "Smart Job Matching",
            description: "Our AI algorithm matches your skills and preferences with job openings across multiple platforms to find your perfect fit.",
            color: "#8b5cf6"
        },
        {
            id: 1,
            icon: <Zap className="feature-icon" />,
            title: "Automated Applications",
            description: "Apply to multiple jobs with a single click. JobSuiteX fills in applications automatically using your profile information.",
            color: "#3b82f6"
        },
        {
            id: 2,
            icon: <FileText className="feature-icon" />,
            title: "Resume Optimization",
            description: "Our AI analyzes job descriptions and optimizes your resume for each application to maximize your chances of getting noticed.",
            color: "#10b981"
        },
        {
            id: 3,
            icon: <BarChart3 className="feature-icon" />,
            title: "Application Analytics",
            description: "Track your application status, response rates, and interview invitations with detailed analytics dashboards.",
            color: "#f59e0b"
        }
    ];

    // Auto-rotation effect with useEffect
    useEffect(() => {
        const rotationInterval = setInterval(() => {
            setActiveFeature(current => (current + 1) % features.length);
        }, 5000); // Change feature every 5 seconds

        // Clear interval on component unmount
        return () => clearInterval(rotationInterval);
    }, [features.length]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const toggleSignIn = () => {
        setIsSignIn(!isSignIn);
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: '' });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!isSignIn) {
            // Register validation
            if (!formData.firstName.trim()) errors.firstName = 'First name is required';
            if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        // Common validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);

        try {
            if (isSignIn) {
                // Login
                await login(formData.email, formData.password);
            } else {
                // Register
                await register({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password
                });
            }
            // Redirect will happen automatically due to the useEffect above
        } catch (err) {
            // Display form-specific errors
            if (err.message?.includes('email')) {
                setFormErrors({ ...formErrors, email: err.message });
            } else if (err.message?.includes('password')) {
                setFormErrors({ ...formErrors, password: err.message });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleAuth(credentialResponse.credential);
            // Navigate will happen automatically due to the useEffect above
        } catch (err) {
            console.error('Google auth error:', err);
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
    };

    const pauseRotation = () => {
        clearInterval(rotationInterval);
    };

    const resumeRotation = () => {
        rotationInterval = setInterval(() => {
            setActiveFeature(current => (current + 1) % features.length);
        }, 5000);
    };

    return (
        <div className="landing-container">
            {/* Left section - Marketing */}
            <div className="marketing-section">
                <div className="logo-wrapper">
                    <BriefcaseBusiness className="briefcase-icon" />
                    <span className="logo-text">JobSuiteX</span>
                </div>

                <div className="marketing-content">
                    <h1 className="main-heading">
                        JobSuiteX helps you<br />
                        secure<br />
                        <span className="gradient-text">5x more interviews</span>
                    </h1>

                    <p className="marketing-description">
                        Upload your resume, set your job preferences, and JobSuiteX will automatically apply to matching positions across multiple platforms daily.
                    </p>

                    {/* Feature Carousel */}
                    <div
                        className="features-container"
                        onMouseEnter={pauseRotation}
                        onMouseLeave={resumeRotation}
                    >
                        <div className="features-carousel">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.id}
                                    className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                                    style={{
                                        '--feature-color': feature.color,
                                        transform: `translateX(${(index - activeFeature) * 110}%)`,
                                        opacity: Math.abs(index - activeFeature) > 1 ? 0 : 1,
                                        zIndex: 10 - Math.abs(index - activeFeature)
                                    }}
                                >
                                    <div className="feature-icon-wrapper" style={{ backgroundColor: `${feature.color}20` }}>
                                        {React.cloneElement(feature.icon, { color: feature.color })}
                                    </div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="carousel-controls">
                            {features.map((feature, index) => (
                                <button
                                    key={feature.id}
                                    className={`carousel-dot ${activeFeature === index ? 'active' : ''}`}
                                    onClick={() => setActiveFeature(index)}
                                    aria-label={`View feature: ${feature.title}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="benefits-grid">
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>Save 10+ hours per week</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>Apply to 100+ jobs daily</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>ATS-optimized applications</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>Real-time job monitoring</span>
                        </div>
                    </div>

                    <div className="trust-indicator">
                        <div className="trust-metrics">
                            <div className="metric">
                                <Users size={16} className="metric-icon" />
                                <span className="metric-text">25k+ professionals</span>
                            </div>
                            <div className="metric">
                                <Award size={16} className="metric-icon" />
                                <span className="metric-text">95% satisfaction</span>
                            </div>
                        </div>
                        <div className="avatar-group">
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right section - Form */}
            <div className="form-section">
                <div className="form-container">
                    <h2 className="form-heading">Get started today</h2>

                    <div className="account-toggle">
                        {isSignIn ? "Don't have an account?" : "Already have an account?"}
                        <button className="sign-in-link" onClick={toggleSignIn}>
                            {isSignIn ? "Sign up" : "Sign in"}
                        </button>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isSignIn && (
                            <div className="name-row">
                                <div className="form-field">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First name"
                                        className={`form-input ${formErrors.firstName ? 'input-error' : ''}`}
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.firstName && <div className="error-message">{formErrors.firstName}</div>}
                                </div>
                                <div className="form-field">
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last name"
                                        className={`form-input ${formErrors.lastName ? 'input-error' : ''}`}
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.lastName && <div className="error-message">{formErrors.lastName}</div>}
                                </div>
                            </div>
                        )}

                        <div className="form-field">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                        </div>

                        <div className="form-field">
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    className={`form-input ${formErrors.password ? 'input-error' : ''}`}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <svg viewBox="0 0 24 24" className="eye-icon">
                                        {showPassword ? (
                                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                        ) : (
                                            <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 12 12 12s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                            {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                        </div>

                        {!isSignIn && (
                            <div className="form-field">
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        className={`form-input ${formErrors.confirmPassword ? 'input-error' : ''}`}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <svg viewBox="0 0 24 24" className="eye-icon">
                                            {showConfirmPassword ? (
                                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                            ) : (
                                                <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 12 12 12s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                                {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={submitting || loading}
                        >
                            {submitting || loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                isSignIn ? 'Sign in' : 'Create account'
                            )}
                        </button>

                        {!isSignIn && (
                            <div className="terms-text">
                                By signing up, I agree to <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                            </div>
                        )}

                        <div className="divider">
                            <span className="divider-text">OR</span>
                        </div>

                        <div className="google-auth-container">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                                shape="rectangular"
                                text={isSignIn ? "signin_with" : "signup_with"}
                                theme="filled_blue"
                                width="100%"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JobSuiteXLanding;