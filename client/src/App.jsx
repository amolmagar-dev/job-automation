// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import JobSuiteXLanding from './components/pages/JobSuiteXLanding';
import Dashboard from './components/pages/JobSuiteXDashboard';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <ThemeProvider>
    <Routes>
      <Route path="/" element={<JobSuiteXLanding />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Add more routes here as needed */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <GoogleOAuthProvider clientId={'24150226404-nj776uql5gbojddrmnodt6rj8n6kdrr0.apps.googleusercontent.com'}>
        <AuthProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;