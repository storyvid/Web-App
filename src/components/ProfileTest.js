import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Paper, Alert, Divider } from '@mui/material';
import { setUser, clearAuth } from '../store/slices/authSlice';
import { setTheme } from '../store/slices/uiSlice';

const ProfileTest = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const theme = useSelector(state => state.ui.theme);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const handleSetTestUser = () => {
    dispatch(setUser({
      uid: 'test-profile-123',
      email: 'test@storyvid.com',
      name: 'Profile Test User',
      role: 'client',
      company: 'Test Company Ltd',
      phone: '+1-555-0123',
      accountType: 'Premium Client',
      settings: {
        emailNotifications: true,
        pushNotifications: false,
        soundNotifications: true,
        timezone: 'America/New_York',
        language: 'en'
      }
    }));
  };

  const handleToggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const handleClearUser = () => {
    dispatch(clearAuth());
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        User Profile Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page tests the complete user profile flow with Redux integration.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current State
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Theme:</strong> {theme}
        </Typography>
        
        {user && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>User:</strong> {user.name} ({user.email})
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Company:</strong> {user.company}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Role:</strong> {user.role}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Settings:</strong> {user.settings ? 'Available' : 'Not set'}
            </Typography>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Actions
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleSetTestUser}
            disabled={isAuthenticated}
          >
            Set Test User
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleToggleTheme}
          >
            Toggle Theme
          </Button>
          
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleClearUser}
            disabled={!isAuthenticated}
          >
            Clear User
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {isAuthenticated && (
          <Alert severity="success">
            ✅ User is authenticated! You can now navigate to{' '}
            <a href="/profile" style={{ color: 'inherit' }}>/profile</a>{' '}
            to test the complete UserProfile component.
          </Alert>
        )}
        
        {!isAuthenticated && (
          <Alert severity="warning">
            ⚠️ Set a test user first, then navigate to /profile to test the profile management.
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Testing Checklist
        </Typography>
        <Typography variant="body2" component="div">
          ✅ Redux store integration<br/>
          ✅ User authentication state<br/>
          ✅ Theme switching<br/>
          ✅ Profile data management<br/>
          ✅ Settings persistence<br/>
          🔄 Navigate to /profile to test complete flow
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfileTest;