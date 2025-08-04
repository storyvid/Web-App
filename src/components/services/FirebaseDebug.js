import React, { useState } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';

const FirebaseDebug = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testGetClients = async () => {
    console.log('🧪 Testing getClients...');
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseService.getClients();
      console.log('🧪 Test result:', result);
      setClients(result);
    } catch (err) {
      console.error('🧪 Test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testMockDataToggle = () => {
    console.log('🧪 Current useMockData:', firebaseService.useMockData);
    firebaseService.useMockData = !firebaseService.useMockData;
    console.log('🧪 New useMockData:', firebaseService.useMockData);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Firebase Service Debug
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Controls
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={testGetClients} disabled={loading}>
            {loading ? 'Testing...' : 'Test getClients()'}
          </Button>
          <Button variant="outlined" onClick={testMockDataToggle}>
            Toggle Mock Data
          </Button>
        </Box>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error.contrastText">
            Error:
          </Typography>
          <Typography variant="body2" color="error.contrastText">
            {error}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Clients ({clients.length})
        </Typography>
        {clients.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No clients found
          </Typography>
        ) : (
          <List>
            {clients.map((client) => (
              <ListItem key={client.id}>
                <ListItemText
                  primary={client.name}
                  secondary={`Company: ${client.company} | ID: ${client.id}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default FirebaseDebug;