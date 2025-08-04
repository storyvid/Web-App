import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Divider } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const ProjectDebugTest = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const debugProjectMatching = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 Debugging project-client matching...');
      console.log('Current user:', user);
      
      // Get all projects
      const allProjects = await firebaseService.getProjects();
      console.log('All projects:', allProjects);
      
      // Get all clients
      const allClients = await firebaseService.getClients();
      console.log('All clients:', allClients);
      
      // Filter projects for current user (if client)
      const userProjects = allProjects.filter(project => project.clientId === user.uid);
      console.log('Projects for current user:', userProjects);
      
      // Create detailed analysis
      const analysis = {
        totalProjects: allProjects.length,
        totalClients: allClients.length,
        userRole: user?.role,
        userId: user?.uid,
        userName: user?.name,
        userProjects: userProjects.length,
        projectDetails: allProjects.map(p => ({
          name: p.name,
          clientId: p.clientId,
          status: p.status,
          matchesCurrentUser: p.clientId === user.uid
        })),
        clientDetails: allClients.map(c => ({
          name: c.name,
          id: c.id,
          isCurrentUser: c.id === user.uid
        }))
      };
      
      let message, type, details;
      
      if (allProjects.length === 0) {
        type = 'warning';
        message = 'No projects found in database';
        details = 'No projects exist yet. Create a project via Services page first.';
      } else if (userProjects.length === 0) {
        type = 'warning';
        message = `Found ${allProjects.length} projects but none match current user`;
        details = `Current user ID: ${user.uid}\n\nProject client IDs:\n${allProjects.map(p => `• ${p.name}: clientId="${p.clientId}"`).join('\n')}\n\nPossible issues:\n1. Projects were created with different clientId\n2. User ID doesn't match any project clientId\n3. User is admin viewing as wrong role`;
      } else {
        type = 'success';
        message = `✅ Found ${userProjects.length} projects for current user`;
        details = `Projects matching user ID ${user.uid}:\n${userProjects.map(p => `• ${p.name} (${p.status})`).join('\n')}`;
      }
      
      setResult({
        type,
        message,
        details,
        analysis
      });
      
    } catch (error) {
      console.error('Debug failed:', error);
      setResult({
        type: 'error',
        message: 'Debug test failed',
        details: error.message,
        analysis: null
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateAdminProjectCreation = async () => {
    setLoading(true);
    try {
      // Get a client to create project for
      const clients = await firebaseService.getClients();
      if (clients.length === 0) {
        throw new Error('No clients available to create project for');
      }
      
      const targetClient = clients[0];
      console.log('Creating test project for client:', targetClient);
      
      // Simulate the admin project creation data
      const testProjectData = {
        name: `Debug Test Project ${Date.now()}`,
        description: 'Test project created for debugging client dashboard visibility',
        clientId: targetClient.id, // This should match the client's user ID
        status: 'draft',
        statusLabel: 'Draft',
        priority: 'medium',
        progress: 0,
        videoType: 'commercial',
        budget: 5000,
        estimatedHours: 33,
        actualHours: 0,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        deliverables: [],
        assets: [],
        finalDeliverables: [],
        feedback: [],
        approvalStatus: 'pending',
        assignedStaff: [],
        projectManager: user.uid,
        serviceRequested: 'Video Commercials',
        requestedTimeline: '1-2weeks',
        additionalNotes: 'Debug test project'
      };
      
      console.log('Project data to create:', testProjectData);
      
      const newProject = await firebaseService.createProject(testProjectData);
      console.log('Created project:', newProject);
      
      setResult({
        type: 'success',
        message: '✅ Test project created successfully!',
        details: `Created project "${testProjectData.name}" for client "${targetClient.name}"\n\nProject ID: ${newProject.id}\nClient ID: ${targetClient.id}\n\nThis project should appear in ${targetClient.name}'s dashboard.\n\nTo verify: Log in as that client and check dashboard.`,
        analysis: { newProject, targetClient }
      });
      
    } catch (error) {
      console.error('Error creating test project:', error);
      setResult({
        type: 'error',
        message: 'Failed to create test project',
        details: error.message,
        analysis: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Project-Client Matching Debug
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Debugging why projects created via Services page don't appear in client dashboards.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Current User:</strong> {user?.name || 'Not logged in'} (ID: {user?.uid || 'N/A'}, Role: {user?.role || 'N/A'})
          <br />
          <strong>Issue:</strong> Projects show in admin view but not in selected client's dashboard
          <br />
          <strong>Expected:</strong> Project clientId should match the selected client's user ID
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={debugProjectMatching}
          disabled={loading}
          color="primary"
        >
          Debug Project Matching
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={simulateAdminProjectCreation}
          disabled={loading}
        >
          Create Test Project
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
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
            {result.details}
          </Typography>
        </Alert>
      )}

      {result?.analysis && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Analysis:
            </Typography>
            
            {result.analysis.totalProjects !== undefined && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Database Summary:</Typography>
                <Typography variant="body2">
                  • Total Projects: {result.analysis.totalProjects}
                  <br />
                  • Total Clients: {result.analysis.totalClients}
                  <br />
                  • Projects for current user: {result.analysis.userProjects}
                </Typography>
              </Box>
            )}
            
            {result.analysis.projectDetails && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">All Projects:</Typography>
                {result.analysis.projectDetails.map((project, index) => (
                  <Box key={index} sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{project.name}</strong> - Client ID: "{project.clientId}" - Status: {project.status}
                      {project.matchesCurrentUser && <span style={{ color: 'green' }}> ✅ MATCHES CURRENT USER</span>}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {result.analysis.clientDetails && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">All Clients:</Typography>
                {result.analysis.clientDetails.map((client, index) => (
                  <Box key={index} sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{client.name}</strong> - ID: "{client.id}"
                      {client.isCurrentUser && <span style={{ color: 'blue' }}> 👤 CURRENT USER</span>}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Troubleshooting Steps:
          </Typography>
          <Typography variant="body2">
            1. <strong>Debug Project Matching</strong> - Shows which projects exist and their clientId values
            <br />
            2. Compare project clientId with client user IDs
            <br />
            3. If clientId doesn't match any client ID, the project won't appear in client dashboard
            <br />
            4. Verify that Services page is setting clientId correctly when admin creates project
            <br />
            5. Check if client user ID matches the ID selected in dropdown
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectDebugTest;