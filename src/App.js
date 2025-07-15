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
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import FirebaseTest from './components/FirebaseTest';
import ReduxTest from './components/ReduxTest';
import UserProfile from './components/UserProfile';
import ProfileTest from './components/ProfileTest';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import RoleBasedRoute from './components/routing/RoleBasedRoute';
import DashboardRouter from './components/routing/DashboardRouter';

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
                  <Route path="/login" element={<Login />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/firebase-test" element={<FirebaseTest />} />
                  <Route path="/redux-test" element={<ReduxTest />} />
                  <Route path="/profile-test" element={<ProfileTest />} />
                  <Route path="/onboarding" element={<OnboardingFlow />} />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <UserProfile />
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <RoleBasedRoute requireOnboarding={true}>
                        <ErrorBoundary>
                          <DashboardRouter />
                        </ErrorBoundary>
                      </RoleBasedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
