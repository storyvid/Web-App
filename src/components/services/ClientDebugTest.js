import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';

const ClientDebugTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testRealClients = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 Testing real client fetch...');
      console.log('useMockData:', firebaseService.useMockData);
      console.log('Firebase DB initialized:', !!firebaseService.db);
      
      // Force real Firebase query
      const originalUseMockData = firebaseService.useMockData;
      firebaseService.useMockData = false;
      
      const clients = await firebaseService.getClients();
      
      // Restore original setting
      firebaseService.useMockData = originalUseMockData;
      
      console.log('Real clients result:', clients);
      
      if (clients.length === 3 && clients[0].name === 'John Smith') {
        setResult({
          type: 'warning',
          message: 'Still getting mock data!',
          details: 'The getClients method is falling back to mock data. This means either:\n1. No users with role="client" exist in Firebase\n2. Firebase query is failing\n3. Database not properly initialized',
          clients
        });
      } else if (clients.length === 0) {
        setResult({
          type: 'info',
          message: 'No clients found in Firebase',
          details: 'The Firebase query worked but returned 0 clients. You need to create users with role="client" in your Firebase users collection.',
          clients
        });
      } else {
        setResult({
          type: 'success',
          message: `Found ${clients.length} real clients!`,
          details: 'Real Firebase data is working correctly.',
          clients
        });
      }
    } catch (error) {
      console.error('Error testing clients:', error);
      setResult({
        type: 'error',
        message: 'Error fetching clients',
        details: error.message,
        clients: []
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestClient = async () => {
    setLoading(true);
    try {
      // Create a test client user
      const testClient = {
        name: 'Test Client',
        email: 'test.client@example.com',
        role: 'client',
        company: 'Test Company Inc.',
        contactPerson: 'Test Client',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creating test client:', testClient);
      
      // Use the createUser method if available, otherwise direct Firestore
      if (firebaseService.createUser) {
        await firebaseService.createUser(testClient);
      } else {
        // Direct Firestore write
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(firebaseService.db, 'users'), testClient);
      }
      
      setResult({
        type: 'success',
        message: 'Test client created successfully!',
        details: 'Now try fetching clients again to see if it appears.',
        clients: [testClient]
      });
    } catch (error) {
      console.error('Error creating test client:', error);
      setResult({
        type: 'error',
        message: 'Error creating test client',
        details: error.message,
        clients: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Client Data Debug Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Debugging why the Services page shows mock clients instead of real Firebase data.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testRealClients}
          disabled={loading}
        >
          Test Real Client Fetch
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={createTestClient}
          disabled={loading}
        >
          Create Test Client
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Processing...</Typography>
        </Box>
      )}

      {result && (
        <Alert severity={result.type} sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {result.message}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {result.details}
          </Typography>
        </Alert>
      )}

      {result?.clients && result.clients.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clients Data:
            </Typography>
            {result.clients.map((client, index) => (
              <Box key={client.id || index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography><strong>Name:</strong> {client.name}</Typography>
                <Typography><strong>Company:</strong> {client.company}</Typography>
                <Typography><strong>ID:</strong> {client.id}</Typography>
                <Typography><strong>Role:</strong> {client.role}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Debug Info:
          </Typography>
          <Typography variant="body2">
            <strong>useMockData:</strong> {firebaseService.useMockData ? 'true' : 'false'}
            <br />
            <strong>Firebase DB:</strong> {firebaseService.db ? 'initialized' : 'not initialized'}
            <br />
            <strong>Expected:</strong> If you have real clients, they should appear. If not, you'll see the mock data fallback.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientDebugTest;