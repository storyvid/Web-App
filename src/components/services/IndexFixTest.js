import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Divider } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';

const IndexFixTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testFixedClientQuery = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔧 Testing FIXED client query (without orderBy)...');
      
      // Test the fixed query
      const clients = await firebaseService.getClients();
      console.log('✅ Fixed query result:', clients);
      
      if (clients.length === 0) {
        setResult({
          type: 'warning',
          message: 'Query worked but no clients found',
          details: `The Firebase query executed successfully but returned 0 clients.\n\nThis means:\n✅ No more index error!\n⚠️ You have no users with role="client" in your Firestore database.\n\nTo fix: Create users with role="client" in Firebase Console or use the "Create Test Client" button below.`,
          clients: []
        });
      } else {
        setResult({
          type: 'success',
          message: `✅ SUCCESS! Found ${clients.length} real clients`,
          details: `The index error is fixed and we found real client data!\n\nClients found:\n${clients.map(c => `• ${c.name} (${c.company})`).join('\n')}`,
          clients
        });
      }
    } catch (error) {
      console.error('❌ Query still failing:', error);
      
      if (error.message.includes('requires an index')) {
        setResult({
          type: 'error', 
          message: '❌ Index error still exists',
          details: `The composite index is still required. This shouldn't happen with the fix.\n\nError: ${error.message}\n\nPlease check if the firebaseService.js changes were applied correctly.`,
          clients: []
        });
      } else {
        setResult({
          type: 'error',
          message: '❌ Different error occurred',
          details: `A different error occurred:\n\n${error.message}\n\nThis might be a permissions issue or database connectivity problem.`,
          clients: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createTestClient = async () => {
    setLoading(true);
    try {
      // Import Firestore functions
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      const testClient = {
        name: 'Test Client User',
        email: `test.client.${Date.now()}@example.com`,
        role: 'client',
        company: 'Test Company Ltd',
        contactPerson: 'Test Client User',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating test client:', testClient);
      
      const docRef = await addDoc(collection(firebaseService.db, 'users'), testClient);
      
      setResult({
        type: 'success',
        message: '✅ Test client created successfully!',
        details: `Created client with ID: ${docRef.id}\n\nNow run the client query test again to see if it appears in the dropdown.`,
        clients: [{ ...testClient, id: docRef.id }]
      });
    } catch (error) {
      console.error('Error creating test client:', error);
      setResult({
        type: 'error',
        message: '❌ Error creating test client',
        details: `Failed to create test client:\n\n${error.message}`,
        clients: []
      });
    } finally {
      setLoading(false);
    }
  };

  const testServicesPageFlow = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing complete Services page flow...');
      
      // Test client fetch
      const clients = await firebaseService.getClients();
      console.log('Clients:', clients);
      
      // Test project fetch  
      const projects = await firebaseService.getProjects();
      console.log('Projects:', projects);
      
      // Test notification creation
      const testNotification = {
        id: `flow_test_${Date.now()}`,
        userId: 'test-user',
        title: 'Flow Test',
        message: 'Testing complete Services page flow',
        type: 'info',
        category: 'test',
        read: false,
        actionRequired: false,
        relatedEntity: { type: 'test', id: 'flow-test' },
        action: { label: 'Test', url: '/test', type: 'navigation' }
      };
      
      const notification = await firebaseService.createNotification(testNotification);
      console.log('Notification:', notification);
      
      setResult({
        type: 'success',
        message: '✅ Complete flow test passed!',
        details: `All Services page functions working:\n\n• Client fetch: ${clients.length} clients\n• Project fetch: ${projects.length} projects\n• Notification creation: Success\n\nThe Services page should now work without index errors.`,
        clients
      });
    } catch (error) {
      console.error('Flow test failed:', error);
      setResult({
        type: 'error',
        message: '❌ Flow test failed',
        details: `One or more Services page functions failed:\n\n${error.message}`,
        clients: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 Firebase Index Fix Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Testing the fix for the Firebase composite index error in client queries.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Problem:</strong> Firebase query with where() + orderBy() requires composite index
          <br />
          <strong>Fix:</strong> Removed orderBy() from query, added client-side sorting
          <br />
          <strong>Expected:</strong> Client dropdown should work without index errors
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testFixedClientQuery}
          disabled={loading}
          color="primary"
        >
          Test Fixed Client Query
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={createTestClient}
          disabled={loading}
        >
          Create Test Client
        </Button>

        <Button 
          variant="contained" 
          color="success"
          onClick={testServicesPageFlow}
          disabled={loading}
        >
          Test Complete Flow
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Testing...</Typography>
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
              Clients Found ({result.clients.length}):
            </Typography>
            {result.clients.map((client, index) => (
              <Box key={client.id || index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography><strong>Name:</strong> {client.name || 'N/A'}</Typography>
                <Typography><strong>Company:</strong> {client.company || 'N/A'}</Typography>
                <Typography><strong>Email:</strong> {client.email || 'N/A'}</Typography>
                <Typography><strong>ID:</strong> {client.id || 'N/A'}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Next Steps:
          </Typography>
          <Typography variant="body2">
            1. Run "Test Fixed Client Query" - should work without index errors
            <br />
            2. If no clients found, click "Create Test Client" to add sample data
            <br />
            3. Go to Services page and test the admin client dropdown
            <br />
            4. Create a project and verify it appears in client dashboard
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IndexFixTest;