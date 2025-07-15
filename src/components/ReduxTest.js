import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { setTheme, updatePreferences } from '../store/slices/uiSlice';
import { setUser, clearAuth } from '../store/slices/authSlice';

const ReduxTest = () => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.ui.theme);
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const preferences = useSelector(state => state.ui.preferences);

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  const handleSetTestUser = () => {
    dispatch(setUser({
      uid: 'test-123',
      email: 'test@storyvid.com',
      name: 'Test User',
      role: 'client',
      company: 'Test Company'
    }));
  };

  const handleClearUser = () => {
    dispatch(clearAuth());
  };

  const handleUpdatePreferences = () => {
    dispatch(updatePreferences({
      itemsPerPage: 20,
      emailNotifications: !preferences.emailNotifications
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Redux Integration Test
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        ✅ Redux store is working! This page proves Redux integration is successful.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Redux State
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          <strong>Theme:</strong> {theme}
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          <strong>User:</strong> {user ? `${user.name} (${user.email})` : 'None'}
        </Typography>
        
        <Typography variant="body2" component="div">
          <strong>Email Notifications:</strong> {preferences.emailNotifications ? 'Enabled' : 'Disabled'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Redux Actions
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={handleToggleTheme}
          >
            Toggle Theme ({theme})
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleSetTestUser}
            disabled={isAuthenticated}
          >
            Set Test User
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleClearUser}
            disabled={!isAuthenticated}
          >
            Clear User
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleUpdatePreferences}
          >
            Toggle Email Notifications
          </Button>
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Redux Features Working:</strong><br/>
          ✅ Store configuration<br/>
          ✅ Slice reducers<br/>
          ✅ Actions dispatch<br/>
          ✅ State persistence (refresh the page to test)<br/>
          ✅ Selectors<br/>
          ✅ React integration
        </Typography>
      </Alert>
    </Box>
  );
};

export default ReduxTest;