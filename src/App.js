import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import theme from './styles/theme';
import { store, persistor } from './store';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import FirebaseTest from './components/FirebaseTest';
import ReduxTest from './components/ReduxTest';
import UserProfile from './components/UserProfile';
import ProfileTest from './components/ProfileTest';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import RoleBasedRoute from './components/routing/RoleBasedRoute';
import RoleBasedDashboardTest from './components/testing/RoleBasedDashboardTest';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <Router>
                <Routes>
                  {/* Public Routes - redirect authenticated users */}
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/signup" 
                    element={
                      <PublicRoute>
                        <Signup />
                      </PublicRoute>
                    } 
                  />

                  {/* Onboarding Route - only for authenticated users who haven't completed onboarding */}
                  <Route 
                    path="/onboarding" 
                    element={
                      <ProtectedRoute requireOnboarding={false}>
                        <ErrorBoundary>
                          <Onboarding />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Protected Routes - require authentication and completed onboarding */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Dashboard />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Settings />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <UserProfile />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Utility Routes */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Test Routes - Remove in production */}
                  <Route path="/firebase-test" element={<FirebaseTest />} />
                  <Route path="/redux-test" element={<ReduxTest />} />
                  <Route path="/profile-test" element={<ProfileTest />} />
                  <Route path="/role-test" element={<RoleBasedDashboardTest />} />

                  {/* Redirect root to login - PublicRoute will handle authenticated users */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </Router>
            </AuthProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
