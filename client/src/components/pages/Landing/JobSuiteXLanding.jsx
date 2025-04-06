import React, { useState } from 'react';
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
import { useEffect } from 'react';

const JobSuiteXLanding = () => {
    const [isSignIn, setIsSignIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [activeFeature, setActiveFeature] = useState(0);

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

    const toggleSignIn = () => {
        setIsSignIn(!isSignIn);
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
                    <div className="features-container">
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

                    {isSignIn ? (
                        // Sign In Form
                        <form className="auth-form">
                            <div className="form-field">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-field">
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="form-input"
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
                            </div>

                            <button type="submit" className="submit-button">
                                Sign in
                            </button>

                            <div className="divider">
                                <span className="divider-text">OR</span>
                            </div>

                            <button type="button" className="google-button">
                                <svg className="google-icon" viewBox="0 0 488 512">
                                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                </svg>
                                Sign in with Google
                            </button>
                        </form>
                    ) : (
                        // Sign Up Form
                        <form className="auth-form">
                            <div className="name-row">
                                <input
                                    type="text"
                                    placeholder="First name"
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Last name"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-field">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-field">
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="form-input"
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
                            </div>

                            <div className="form-field">
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        className="form-input"
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
                            </div>

                            <button type="submit" className="submit-button">
                                Create account
                            </button>

                            <div className="terms-text">
                                By signing up, I agree to <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                            </div>

                            <div className="divider">
                                <span className="divider-text">OR</span>
                            </div>

                            <button type="button" className="google-button">
                                <svg className="google-icon" viewBox="0 0 488 512">
                                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                </svg>
                                Sign up with Google
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobSuiteXLanding;