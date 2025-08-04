import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';

const NotificationTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testNotification = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const testNotificationData = {
        id: `test_${Date.now()}`,
        userId: 'test-user-123',
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        category: 'project',
        read: false,
        actionRequired: true,
        relatedEntity: {
          type: 'project',
          id: 'test-project-123'
        },
        action: {
          label: 'View Test',
          url: '/test',
          type: 'navigation'
        }
      };

      console.log('🧪 Testing notification creation with:', testNotificationData);
      const response = await firebaseService.createNotification(testNotificationData);
      console.log('🧪 Notification created successfully:', response);
      setResult(response);
    } catch (err) {
      console.error('🧪 Notification test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Notification Creation Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testNotification}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test Notification Creation'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Success!</strong> Notification created with ID: {result.id}
          </Typography>
          <Typography variant="caption" component="pre" sx={{ mt: 1, display: 'block' }}>
            {JSON.stringify(result, null, 2)}
          </Typography>
        </Alert>
      )}
      
      <Typography variant="body2" color="text.secondary">
        This test verifies that the createNotification method works with all required fields.
        Check the browser console for detailed logs.
      </Typography>
    </Box>
  );
};

export default NotificationTest;