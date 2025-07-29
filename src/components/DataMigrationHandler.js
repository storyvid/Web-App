import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import dataMigrationService from '../services/firebase/dataMigration';
import firebaseService from '../services/firebase/firebaseService';

const DataMigrationHandler = ({ children }) => {
  const [migrationStatus, setMigrationStatus] = useState('checking'); // checking, running, completed, error
  const [error, setError] = useState(null);

  useEffect(() => {
    const runMigrationCheck = async () => {
      try {
        // Wait for Firebase to initialize
        if (!firebaseService.app) {
          await firebaseService.initialize();
        }

        // Check for force migration parameter
        const urlParams = new URLSearchParams(window.location.search);
        const forceMigration = urlParams.get('forceMigration') === 'true';

        if (forceMigration) {
          console.log('🔄 Force migration requested...');
          setMigrationStatus('running');
          await dataMigrationService.forceMigration();
          setMigrationStatus('completed');
          console.log('✅ Force migration completed successfully');
          
          // Remove the parameter from URL
          urlParams.delete('forceMigration');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          window.history.replaceState({}, '', newUrl);
          return;
        }

        // Skip migration - use manual data creation
        console.log('✅ Using manual data creation mode');
        setMigrationStatus('completed');
        
      } catch (error) {
        console.error('❌ Migration error:', error);
        setError(error.message);
        setMigrationStatus('error');
      }
    };

    runMigrationCheck();
  }, []);

  if (migrationStatus === 'checking') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Checking system status...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we verify your data
        </Typography>
      </Box>
    );
  }

  if (migrationStatus === 'running') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          px: 3
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
          <LinearProgress />
        </Box>
        <Typography variant="h6" gutterBottom textAlign="center">
          Setting up your StoryVid experience...
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          We're preparing your dashboard with sample data and creating test accounts.
          This will only take a moment.
        </Typography>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1, maxWidth: 500 }}>
          <Typography variant="caption" color="info.dark" textAlign="center" display="block">
            Creating demo accounts:<br/>
            • admin@test.com (Admin Dashboard)<br/>
            • staff@test.com (Staff Dashboard)<br/>
            • client@test.com (Client Portal)<br/>
            Password: 123456789
          </Typography>
        </Box>
      </Box>
    );
  }

  if (migrationStatus === 'error') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          px: 3
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Setup Error
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {error || 'An error occurred during setup. Please refresh the page to try again.'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          If this error persists, please check your Firebase configuration.
        </Typography>
      </Box>
    );
  }

  // Migration completed - render the app
  return children;
};

export default DataMigrationHandler;