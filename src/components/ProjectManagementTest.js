import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import projectManagementService from '../services/projectManagementService';
import firebaseService from '../services/firebase/firebaseService';

const ProjectManagementTest = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testProject, setTestProject] = useState({
    name: 'Test Project',
    description: 'A test project for validation',
    assignedTo: '',
    status: 'planning',
    priority: 'medium'
  });

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testCurrentUser = () => {
    addResult('=== DEBUG INFO ===', 'info');
    addResult(`Auth Context User: ${user ? user.name : 'null'} (${user ? user.role : 'no role'})`, 'info');
    addResult(`Firebase Service Current User: ${firebaseService.currentUser ? firebaseService.currentUser.name : 'null'} (${firebaseService.currentUser ? firebaseService.currentUser.role : 'no role'})`, 'info');
    addResult(`User UID: ${user ? user.uid : 'null'}`, 'info');
    addResult(`Firebase Service UID: ${firebaseService.currentUser ? firebaseService.currentUser.uid : 'null'}`, 'info');
    addResult('=== END DEBUG ===', 'info');
  };

  const syncFirebaseUser = () => {
    if (user && !firebaseService.currentUser) {
      addResult('Syncing user to Firebase service...', 'info');
      firebaseService.currentUser = user;
      addResult(`✅ Synced user: ${user.name} (${user.role})`, 'success');
    } else if (firebaseService.currentUser) {
      addResult('Firebase service already has current user', 'info');
    } else {
      addResult('❌ No user to sync', 'error');
    }
  };

  const testGetAllUsers = async () => {
    try {
      setLoading(true);
      addResult('Testing getAllUsers()...', 'info');
      
      const users = await projectManagementService.getAllUsers();
      addResult(`✅ Found ${users.length} users`, 'success');
      
      if (users.length > 0) {
        addResult(`Sample user: ${users[0].name} (${users[0].role})`, 'info');
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testGetAllProjects = async () => {
    try {
      setLoading(true);
      addResult('Testing getAllProjects()...', 'info');
      
      const projects = await projectManagementService.getAllProjects();
      addResult(`✅ Found ${projects.length} projects`, 'success');
      
      if (projects.length > 0) {
        addResult(`Sample project: ${projects[0].name} (${projects[0].status})`, 'info');
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testCreateProject = async () => {
    if (!testProject.name || !testProject.assignedTo) {
      addResult('❌ Please fill in project name and assign to a user', 'error');
      return;
    }

    try {
      setLoading(true);
      addResult('Testing createProject()...', 'info');
      
      const newProject = await projectManagementService.createProject(testProject, testProject.assignedTo);
      addResult(`✅ Created project: ${newProject.name} (ID: ${newProject.id})`, 'success');
      
      // Clear form
      setTestProject(prev => ({ ...prev, name: '', description: '' }));
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testGetStatistics = async () => {
    try {
      setLoading(true);
      addResult('Testing getProjectStatistics()...', 'info');
      
      const stats = await projectManagementService.getProjectStatistics();
      addResult(`✅ Statistics: ${stats.totalProjects} total, ${stats.activeProjects} active`, 'success');
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Project Management Service Test
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test the project management service functions. Make sure you're logged in as an admin.
      </Typography>

      {/* Test Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Controls
          </Typography>
          
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={testCurrentUser}
              color="secondary"
            >
              Debug User Info
            </Button>
            <Button
              variant="contained"
              onClick={syncFirebaseUser}
              color="warning"
            >
              Sync Firebase User
            </Button>
            <Button
              variant="outlined"
              onClick={testGetAllUsers}
              disabled={loading}
            >
              Test Get All Users
            </Button>
            <Button
              variant="outlined"
              onClick={testGetAllProjects}
              disabled={loading}
            >
              Test Get All Projects
            </Button>
            <Button
              variant="outlined"
              onClick={testGetStatistics}
              disabled={loading}
            >
              Test Get Statistics
            </Button>
            <Button
              variant="outlined"
              onClick={clearResults}
              color="secondary"
            >
              Clear Results
            </Button>
          </Stack>

          {/* Create Project Test */}
          <Typography variant="subtitle1" gutterBottom>
            Test Create Project
          </Typography>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Project Name"
              value={testProject.name}
              onChange={(e) => setTestProject(prev => ({ ...prev, name: e.target.value }))}
              size="small"
            />
            <TextField
              label="Description"
              value={testProject.description}
              onChange={(e) => setTestProject(prev => ({ ...prev, description: e.target.value }))}
              size="small"
            />
            <TextField
              label="Assign To (User ID)"
              value={testProject.assignedTo}
              onChange={(e) => setTestProject(prev => ({ ...prev, assignedTo: e.target.value }))}
              size="small"
              helperText="Enter a valid user ID from the 'Get All Users' test"
            />
            <FormControl size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={testProject.priority}
                label="Priority"
                onChange={(e) => setTestProject(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={testCreateProject}
              disabled={loading}
            >
              Create Test Project
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          
          {results.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No test results yet. Run some tests above.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {results.map((result, index) => (
                <Alert
                  key={index}
                  severity={result.type}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {result.timestamp}
                  </Typography>
                  <br />
                  {result.message}
                </Alert>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectManagementTest;