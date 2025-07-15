import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  Divider
} from '@mui/material';
import FirebaseService from '../services/firebase/firebaseService';

const FirebaseTest = () => {
  const [testResults, setTestResults] = useState({
    initialization: 'pending',
    authentication: 'pending',
    dataWrite: 'pending',
    dataRead: 'pending',
    cleanup: 'pending'
  });
  const [testLog, setTestLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const firebaseService = new FirebaseService();

  const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message,
      type,
      id: Date.now() + Math.random()
    };
    setTestLog(prev => [...prev, logEntry]);
  };

  const updateTestResult = (test, result) => {
    setTestResults(prev => ({
      ...prev,
      [test]: result
    }));
  };

  const testInitialization = async () => {
    try {
      log('Testing Firebase initialization...');
      await firebaseService.initialize();
      
      // Test if Firebase is properly configured
      if (firebaseService.auth && firebaseService.db) {
        updateTestResult('initialization', 'success');
        log('✅ Firebase initialized successfully', 'success');
        return true;
      } else {
        updateTestResult('initialization', 'error');
        log('❌ Firebase initialization incomplete', 'error');
        return false;
      }
    } catch (error) {
      updateTestResult('initialization', 'error');
      log(`❌ Firebase initialization failed: ${error.message}`, 'error');
      return false;
    }
  };

  const testAuthentication = async () => {
    try {
      log('Testing authentication with FirebaseService...');
      
      // Try to sign in with test credentials
      const result = await firebaseService.signIn('client@test.com', 'password');
      
      if (result.success) {
        updateTestResult('authentication', 'success');
        log('✅ Authentication successful', 'success');
        log(`Current user: ${result.user.email}`, 'info');
        setCurrentUser(result.user);
        return true;
      } else {
        updateTestResult('authentication', 'error');
        log('❌ Authentication failed', 'error');
        return false;
      }
    } catch (error) {
      if (error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
        updateTestResult('authentication', 'warning');
        log('⚠️ Test user not found - run user migration first', 'warning');
        return false;
      } else {
        updateTestResult('authentication', 'error');
        log(`❌ Authentication error: ${error.message}`, 'error');
        return false;
      }
    }
  };

  const testDataWrite = async () => {
    try {
      log('Testing data write operations...');
      
      // Test creating a user (this uses Firestore)
      const testUserData = {
        email: `test-${Date.now()}@storyvid.com`,
        name: 'Test User',
        role: 'test',
        company: 'Test Company',
        accountType: 'Test Account',
        phone: '+1 (555) 000-0000',
        isActive: true,
        isTestData: true
      };

      const result = await firebaseService.createUser(testUserData);
      
      if (result) {
        updateTestResult('dataWrite', 'success');
        log('✅ Data write successful', 'success');
        log(`Created test user document`, 'info');
        return true;
      } else {
        updateTestResult('dataWrite', 'error');
        log('❌ Data write failed', 'error');
        return false;
      }
    } catch (error) {
      updateTestResult('dataWrite', 'error');
      log(`❌ Data write error: ${error.message}`, 'error');
      return false;
    }
  };

  const testDataRead = async () => {
    try {
      log('Testing data read operations...');
      
      if (currentUser) {
        const userData = await firebaseService.getUser(currentUser.uid);
        
        if (userData) {
          updateTestResult('dataRead', 'success');
          log('✅ Data read successful', 'success');
          log(`Read user data: ${userData.name}`, 'info');
          return true;
        } else {
          updateTestResult('dataRead', 'error');
          log('❌ Data read failed - no data returned', 'error');
          return false;
        }
      } else {
        updateTestResult('dataRead', 'warning');
        log('⚠️ Cannot test data read - no authenticated user', 'warning');
        return false;
      }
    } catch (error) {
      updateTestResult('dataRead', 'error');
      log(`❌ Data read error: ${error.message}`, 'error');
      return false;
    }
  };

  const testCleanup = async () => {
    try {
      log('Testing cleanup operations...');
      
      if (currentUser) {
        await firebaseService.signOut();
        setCurrentUser(null);
        log('✅ User signed out successfully', 'success');
      }
      
      updateTestResult('cleanup', 'success');
      log('✅ Cleanup completed', 'success');
      return true;
    } catch (error) {
      updateTestResult('cleanup', 'error');
      log(`❌ Cleanup error: ${error.message}`, 'error');
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestLog([]);
    
    // Reset test results
    setTestResults({
      initialization: 'pending',
      authentication: 'pending',
      dataWrite: 'pending',
      dataRead: 'pending',
      cleanup: 'pending'
    });

    log('🚀 Starting Firebase integration tests...');
    log('=' .repeat(50));

    const tests = [
      { name: 'Initialization', fn: testInitialization },
      { name: 'Authentication', fn: testAuthentication },
      { name: 'Data Write', fn: testDataWrite },
      { name: 'Data Read', fn: testDataRead },
      { name: 'Cleanup', fn: testCleanup }
    ];

    let passed = 0;
    for (const test of tests) {
      log(`\n--- Testing ${test.name} ---`);
      const result = await test.fn();
      if (result) passed++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    log('\n' + '='.repeat(50));
    log(`🎯 Tests completed: ${passed}/${tests.length} passed`);
    
    if (passed === tests.length) {
      log('🎉 All tests passed! Firebase integration is working perfectly.', 'success');
    } else {
      log(`⚠️ ${tests.length - passed} test(s) failed. Check Firebase configuration.`, 'warning');
    }

    setIsRunning(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '⏳';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔥 Firebase Integration Test Suite
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This test suite verifies that Firebase is properly integrated with your StoryVid application.
        Make sure you've run the user migration script first.
      </Alert>

      {/* Test Status Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(testResults).map(([test, status]) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={test}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
                  {test.charAt(0).toUpperCase() + test.slice(1)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={`${getStatusColor(status)}.main`}
                  sx={{ fontWeight: 'bold' }}
                >
                  {getStatusIcon(status)} {status.toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Test Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Test Controls</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={runAllTests}
            disabled={isRunning}
            startIcon={isRunning ? <CircularProgress size={20} /> : null}
          >
            {isRunning ? 'Running Tests...' : '🚀 Run All Tests'}
          </Button>
          <Button variant="outlined" onClick={() => setTestLog([])}>
            Clear Log
          </Button>
        </Box>
      </Paper>

      {/* Test Log */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Test Log</Typography>
        <Box 
          sx={{ 
            height: 400, 
            overflow: 'auto', 
            bgcolor: 'grey.900', 
            color: 'common.white',
            p: 2,
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            borderRadius: 1
          }}
        >
          {testLog.length === 0 ? (
            <Typography color="grey.400">
              Click "Run All Tests" to begin testing...
            </Typography>
          ) : (
            testLog.map((log) => (
              <Box key={log.id} sx={{ mb: 0.5 }}>
                <Typography 
                  component="span" 
                  sx={{ 
                    color: log.type === 'error' ? 'error.main' : 
                           log.type === 'success' ? 'success.main' :
                           log.type === 'warning' ? 'warning.main' : 'inherit'
                  }}
                >
                  [{log.timestamp}] {log.message}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Paper>

      {/* Manual Test Section */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Manual Testing</Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Use these controls carefully in development only. 
          Make sure to test with non-production data.
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Test Authentication</Typography>
            <TextField size="small" placeholder="Email" defaultValue="client@test.com" sx={{ mr: 1, mb: 1 }} />
            <TextField size="small" type="password" placeholder="Password" defaultValue="password" sx={{ mr: 1, mb: 1 }} />
            <Button size="small" variant="outlined" onClick={testAuthentication}>
              Test Login
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Current Status</Typography>
            <Typography variant="body2">
              <strong>User:</strong> {currentUser ? `${currentUser.email}` : 'Not signed in'}
            </Typography>
            <Typography variant="body2">
              <strong>Service State:</strong> {firebaseService.useMockData ? 'Mock Data' : 'Firebase'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FirebaseTest;