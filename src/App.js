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
import DataMigrationHandler from './components/DataMigrationHandler';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ProjectsList from './pages/ProjectsList';
import Settings from './pages/Settings';
import AdminProjects from './pages/AdminProjects';
import AdminUsers from './pages/AdminUsers';
import Unauthorized from './pages/Unauthorized';
import UserProfile from './components/UserProfile';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import RoleBasedRoute from './components/routing/RoleBasedRoute';
import AppLayout from './components/layout/AppLayout';
import DashboardContent from './pages/content/DashboardContent';
import ProjectsListContent from './pages/content/ProjectsListContent';
import SettingsContent from './pages/content/SettingsContent';
import AdminProjectsContent from './pages/content/AdminProjectsContent';
import AdminUsersContent from './pages/content/AdminUsersContent';
import MilestoneDetail from './pages/MilestoneDetail';
import ServicesContent from './pages/content/ServicesContent';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <DataMigrationHandler>
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

                  {/* Protected Routes with Persistent Layout */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <AppLayout />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  >
                    {/* Dashboard routes */}
                    <Route path="/dashboard" element={<DashboardContent />} />
                    <Route path="/projects" element={<ProjectsListContent />} />
                    <Route path="/project/:projectId" element={<ProjectDetail />} />
                    <Route path="/project/:projectId/timeline" element={<MilestoneDetail />} />
                    <Route path="/settings" element={<SettingsContent />} />
                    
                    {/* Services Route - Only for Client and Admin roles */}
                    <Route 
                      path="/services" 
                      element={
                        <RoleBasedRoute allowedRoles={['client', 'admin']}>
                          <ServicesContent />
                        </RoleBasedRoute>
                      } 
                    />
                    
                    {/* Admin Routes - Require admin role */}
                    <Route 
                      path="/admin/projects" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <AdminProjectsContent />
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/users" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <AdminUsersContent />
                        </RoleBasedRoute>
                      } 
                    />
                  </Route>
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
                  

                  {/* Redirect root to dashboard for authenticated users, login for others */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Router>
            </AuthProvider>
          </DataMigrationHandler>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </ErrorBoundary>
  );
}

export default App;
