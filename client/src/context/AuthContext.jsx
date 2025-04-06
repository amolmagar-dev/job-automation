// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authService from '../services/auth/JobSuiteXAuth';

// Create the authentication context
const AuthContext = createContext();

/**
 * AuthProvider component that wraps the application and provides authentication state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user on initial mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true);
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setError(null);
            } catch (err) {
                setError('Failed to load user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    /**
     * Register a new user
     */
    const register = useCallback(async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const result = await authService.register(userData);
            setUser(result.user);
            return result;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Login an existing user
     */
    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const result = await authService.login(email, password);
            setUser(result.user);
            return result;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Authenticate with Google
     */
    const googleAuth = useCallback(async (googleToken) => {
        try {
            setLoading(true);
            setError(null);
            const result = await authService.googleAuth(googleToken);
            setUser(result.user);
            return result;
        } catch (err) {
            setError(err.message || 'Google authentication failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Logout the current user
     */
    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await authService.logout();
            setUser(null);
            setError(null);
        } catch (err) {
            setError(err.message || 'Logout failed');
        } finally {
            setLoading(false);
        }
    }, []);

    // Context value
    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        googleAuth,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the authentication context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;