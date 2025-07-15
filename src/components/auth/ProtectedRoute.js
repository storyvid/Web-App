import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

import { selectUser, selectIsAuthenticated, selectAuthLoading } from '../../store/slices/authSlice';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requireOnboarding = true,
  redirectTo = '/login' 
}) => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  // Show loading spinner while authentication is being determined
  if (authLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Redirect to onboarding if user hasn't completed onboarding
  if (requireOnboarding && !user?.onboardingComplete) {
    return (
      <Navigate 
        to="/onboarding" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2,
          textAlign: 'center',
          p: 3
        }}
      >
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required role: {requiredRoles.join(' or ')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your role: {user?.role || 'Not assigned'}
        </Typography>
      </Box>
    );
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;