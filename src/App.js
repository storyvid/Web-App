import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
