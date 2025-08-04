import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';

const ProductionTest = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const testClientFetch = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Testing client fetch with production Firebase...');
      const clientsData = await firebaseService.getClients();
      console.log('Clients fetched:', clientsData);
      
      setClients(clientsData);
      setSuccess(`Successfully fetched ${clientsData.length} clients from Firebase`);
    } catch (err) {
      console.error('Error testing client fetch:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testNotificationCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Testing notification creation...');
      const notification = await firebaseService.createNotification({
        id: `test_${Date.now()}`,
        userId: 'test-user',
        title: 'Production Test',
        message: 'Testing notification creation in production mode',
        type: 'info',
        category: 'system',
        read: false,
        actionRequired: false,
        relatedEntity: {
          type: 'test',
          id: 'test-id'
        },
        action: {
          label: 'Test',
          url: '/test',
          type: 'navigation'
        }
      });
      
      console.log('Notification created:', notification);
      setSuccess('Successfully created notification in Firebase');
    } catch (err) {
      console.error('Error testing notification:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Production Firebase Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Testing Services page with real Firebase data (useMockData = false)
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testClientFetch}
          disabled={loading}
        >
          Test Client Fetch
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={testNotificationCreate}
          disabled={loading}
        >
          Test Notification
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Testing...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {clients.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clients Found: {clients.length}
            </Typography>
            {clients.map((client, index) => (
              <Typography key={client.id || index} variant="body2">
                • {client.name} ({client.company}) - ID: {client.id}
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProductionTest;