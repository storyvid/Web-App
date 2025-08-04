import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';

const SimpleTest = () => {
  const [clients, setClients] = useState([]);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseService = async () => {
    addTestResult('🧪 Starting Firebase service test...');
    
    try {
      addTestResult(`📊 useMockData: ${firebaseService.useMockData}`);
      
      addTestResult('📞 Calling getClients()...');
      const result = await firebaseService.getClients();
      
      addTestResult(`✅ getClients() returned ${result.length} clients`);
      addTestResult(`📄 First client: ${JSON.stringify(result[0] || 'none')}`);
      
      setClients(result);
    } catch (error) {
      addTestResult(`❌ Error: ${error.message}`);
    }
  };

  useEffect(() => {
    addTestResult('🚀 Component mounted');
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Simple Firebase Test
      </Typography>
      
      <Button variant="contained" onClick={testFirebaseService} sx={{ mb: 2 }}>
        Test Firebase Service
      </Button>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">
          Clients Found: {clients.length}
        </Typography>
        {clients.map(client => (
          <Typography key={client.id} variant="body2">
            • {client.name} - {client.company}
          </Typography>
        ))}
      </Box>
      
      <Box>
        <Typography variant="h6">Test Log:</Typography>
        {testResults.map((result, index) => (
          <Typography key={index} variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {result}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default SimpleTest;