import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

import { selectUser, selectIsAuthenticated, selectAuthLoading } from '../../store/slices/authSlice';

const PublicRoute = ({ 
  children, 
  redirectTo = '/dashboard',
  redirectOnboarding = '/onboarding'
}) => {
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

  // If user is authenticated, redirect appropriately
  if (isAuthenticated && user) {
    // If user hasn't completed onboarding, redirect to onboarding
    if (!user.onboardingComplete) {
      return <Navigate to={redirectOnboarding} replace />;
    }
    
    // If user has completed onboarding, redirect to dashboard
    return <Navigate to={redirectTo} replace />;
  }

  // Render the public content (login/signup pages)
  return children;
};

export default PublicRoute;