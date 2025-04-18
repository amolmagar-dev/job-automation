import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check if there's a theme preference in localStorage
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('jobSuiteX-theme');
        return savedTheme || 'dark'; // Default to dark theme
    });

    // Update the theme in localStorage and add/remove theme class
    useEffect(() => {
        localStorage.setItem('jobSuiteX-theme', theme);

        // Remove previous theme class
        document.documentElement.classList.remove('theme-dark', 'theme-light');

        // Add current theme class to root element
        document.documentElement.classList.add(`theme-${theme}`);
    }, [theme]);

    // Toggle between light and dark themes
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // Value object for the context provider
    const themeContextValue = {
        theme,
        setTheme,
        toggleTheme,
        isDarkTheme: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={themeContextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};