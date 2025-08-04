import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import firebaseService from '../../services/firebase/firebaseService';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const ThoroughDebugTest = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [debugResult, setDebugResult] = useState(null);

  const thoroughDebug = async () => {
    setLoading(true);
    setDebugResult(null);
    
    try {
      console.log('🔍 STARTING THOROUGH DEBUG...');
      console.log('👤 Current user:', user);
      
      const result = {
        user: {
          uid: user?.uid,
          name: user?.name,
          role: user?.role,
          email: user?.email
        },
        timestamp: new Date().toISOString()
      };

      // Step 1: Test Firebase connection
      console.log('📡 Step 1: Testing Firebase connection...');
      result.firebaseConnection = {
        useMockData: firebaseService.useMockData,
        dbInitialized: !!firebaseService.db,
        status: firebaseService.db ? 'connected' : 'not connected'
      };

      // Step 2: Fetch ALL projects (no filtering)
      console.log('📦 Step 2: Fetching ALL projects from Firebase...');
      const allProjects = await firebaseService.getProjects();
      console.log('📦 All projects raw data:', allProjects);
      
      result.allProjects = {
        count: allProjects.length,
        projects: allProjects.map(p => ({
          id: p.id,
          name: p.name,
          clientId: p.clientId,
          status: p.status,
          createdAt: p.createdAt
        }))
      };

      // Step 3: Analyze clientId matching
      console.log('🎯 Step 3: Analyzing clientId matching...');
      const matchingProjects = allProjects.filter(project => {
        const matches = project.clientId === user?.uid;
        console.log(`🔍 Project "${project.name}": clientId="${project.clientId}" vs user.uid="${user?.uid}" = ${matches}`);
        return matches;
      });
      
      result.clientMatching = {
        userUid: user?.uid,
        totalProjects: allProjects.length,
        matchingProjects: matchingProjects.length,
        matches: matchingProjects.map(p => ({
          id: p.id,
          name: p.name,
          clientId: p.clientId,
          status: p.status
        })),
        nonMatches: allProjects.filter(p => p.clientId !== user?.uid).map(p => ({
          id: p.id,
          name: p.name,
          clientId: p.clientId,
          status: p.status,
          difference: `Expected: "${user?.uid}", Got: "${p.clientId}"`
        }))
      };

      // Step 4: Test ClientDashboard logic exactly
      console.log('📊 Step 4: Simulating ClientDashboard logic...');
      const clientDashboardProjects = allProjects.filter(project => project.clientId === user.uid);
      
      result.clientDashboardSimulation = {
        filterLogic: 'project.clientId === user.uid',
        userUid: user.uid,
        resultCount: clientDashboardProjects.length,
        projects: clientDashboardProjects.map(p => ({
          id: p.id,
          name: p.name,
          clientId: p.clientId
        }))
      };

      // Step 5: Test ProjectList logic for different roles
      console.log('📋 Step 5: Simulating ProjectList logic...');
      let projectListProjects = [];
      switch (user?.role) {
        case 'client':
          projectListProjects = allProjects.filter(project => project.clientId === user.uid);
          break;
        case 'admin':
          projectListProjects = allProjects; // Admins see all projects
          break;
        case 'staff':
          projectListProjects = allProjects.filter(project => 
            project.assignedStaff?.includes(user.uid) || 
            project.projectManager === user.uid
          );
          break;
        default:
          projectListProjects = [];
      }
      
      result.projectListSimulation = {
        userRole: user?.role,
        filterLogic: user?.role === 'client' ? 'project.clientId === user.uid' : 
                    user?.role === 'admin' ? 'all projects' :
                    user?.role === 'staff' ? 'assigned projects' : 'none',
        resultCount: projectListProjects.length,
        projects: projectListProjects.map(p => ({
          id: p.id,
          name: p.name,
          clientId: p.clientId
        }))
      };

      // Step 6: Check data types and potential issues
      console.log('🔧 Step 6: Checking for data type issues...');
      result.dataTypeAnalysis = {
        userUidType: typeof user?.uid,
        userUidValue: user?.uid,
        clientIdTypes: [...new Set(allProjects.map(p => typeof p.clientId))],
        clientIdValues: [...new Set(allProjects.map(p => p.clientId))],
        potentialIssues: []
      };

      // Check for potential type mismatches
      if (typeof user?.uid === 'string') {
        const nonStringClientIds = allProjects.filter(p => typeof p.clientId !== 'string');
        if (nonStringClientIds.length > 0) {
          result.dataTypeAnalysis.potentialIssues.push('Some clientId values are not strings');
        }
      }

      // Check for exact string matches
      const exactMatches = allProjects.filter(p => p.clientId === user?.uid);
      const looseMatches = allProjects.filter(p => p.clientId == user?.uid); // eslint-disable-line eqeqeq
      
      if (exactMatches.length !== looseMatches.length) {
        result.dataTypeAnalysis.potentialIssues.push('Type coercion affects matching');
      }

      // Step 7: Real-time component state check
      console.log('🎭 Step 7: Component state analysis...');
      result.componentAnalysis = {
        expectedDashboardCount: clientDashboardProjects.length,
        expectedProjectListCount: projectListProjects.length,
        debugMessage: clientDashboardProjects.length === 2 ? 
          'Still showing 2 - check if components are using correct state' :
          'Count looks correct - check component rendering'
      };

      console.log('✅ THOROUGH DEBUG COMPLETE');
      console.log('📊 Final result:', result);
      
      setDebugResult(result);
      
    } catch (error) {
      console.error('❌ Debug failed:', error);
      setDebugResult({
        error: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const fixDiscoveredIssues = async () => {
    if (!debugResult) return;
    
    setLoading(true);
    try {
      console.log('🔧 ATTEMPTING TO FIX DISCOVERED ISSUES...');
      
      // Fix 1: Check if there are type mismatches
      if (debugResult.dataTypeAnalysis?.potentialIssues.length > 0) {
        console.log('🔧 Fixing type mismatches...');
        // Could implement automatic fixes here
      }
      
      // Fix 2: Force refresh component state
      console.log('🔧 Triggering component refresh...');
      
      // Dispatch a custom event to force component refresh
      window.dispatchEvent(new CustomEvent('forceProjectRefresh'));
      
      alert('Attempted fixes applied. Check dashboard and projects page.');
      
    } catch (error) {
      console.error('Fix attempt failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Thorough Project Debug Analysis
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Deep debugging why projects show 2 instead of 5 in dashboard and project list.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Current User:</strong> {user?.name || 'Not logged in'} (ID: {user?.uid || 'N/A'}, Role: {user?.role || 'N/A'})
          <br />
          <strong>Issue:</strong> Expected 5 projects, seeing only 2 in UI
          <br />
          <strong>This test will:</strong> Trace the exact data flow from Firebase → filtering → UI
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={thoroughDebug}
          disabled={loading}
          color="primary"
          size="large"
        >
          🔍 Run Thorough Debug
        </Button>
        
        {debugResult && !debugResult.error && (
          <Button 
            variant="contained" 
            color="secondary"
            onClick={fixDiscoveredIssues}
            disabled={loading}
          >
            🔧 Fix Issues
          </Button>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Running thorough debug analysis...</Typography>
        </Box>
      )}

      {debugResult && (
        <Box>
          {debugResult.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6">Debug Failed</Typography>
              <Typography variant="body2">{debugResult.error}</Typography>
            </Alert>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6">Debug Complete!</Typography>
                <Typography variant="body2">
                  Found {debugResult.allProjects?.count || 0} total projects, 
                  {debugResult.clientMatching?.matchingProjects || 0} matching user ID.
                  Dashboard should show: {debugResult.clientDashboardSimulation?.resultCount || 0} projects.
                </Typography>
              </Alert>

              {/* Detailed Results */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">🎯 Client ID Matching Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>User UID:</strong> "{debugResult.user?.uid}"<br />
                    <strong>Total Projects:</strong> {debugResult.allProjects?.count}<br />
                    <strong>Matching Projects:</strong> {debugResult.clientMatching?.matchingProjects}
                  </Typography>
                  
                  {debugResult.clientMatching?.matches.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: 'green' }}>✅ Matching Projects:</Typography>
                      {debugResult.clientMatching.matches.map((project, index) => (
                        <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                          • {project.name} (ID: {project.id}, Client: {project.clientId})
                        </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {debugResult.clientMatching?.nonMatches.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'red' }}>❌ Non-Matching Projects:</Typography>
                      {debugResult.clientMatching.nonMatches.slice(0, 3).map((project, index) => (
                        <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                          • {project.name} - {project.difference}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">📊 Component Simulation Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">ClientDashboard Simulation:</Typography>
                    <Typography variant="body2">
                      Filter: {debugResult.clientDashboardSimulation?.filterLogic}<br />
                      Expected Count: {debugResult.clientDashboardSimulation?.resultCount}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2">ProjectList Simulation:</Typography>
                    <Typography variant="body2">
                      Role: {debugResult.projectListSimulation?.userRole}<br />
                      Filter: {debugResult.projectListSimulation?.filterLogic}<br />
                      Expected Count: {debugResult.projectListSimulation?.resultCount}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">🔧 Data Type Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    <strong>User UID Type:</strong> {debugResult.dataTypeAnalysis?.userUidType}<br />
                    <strong>Client ID Types:</strong> {debugResult.dataTypeAnalysis?.clientIdTypes.join(', ')}<br />
                    <strong>Unique Client IDs:</strong> {debugResult.dataTypeAnalysis?.clientIdValues.join(', ')}
                  </Typography>
                  
                  {debugResult.dataTypeAnalysis?.potentialIssues.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Potential Issues:</Typography>
                      {debugResult.dataTypeAnalysis.potentialIssues.map((issue, index) => (
                        <Typography key={index} variant="body2">• {issue}</Typography>
                      ))}
                    </Alert>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Next Steps Based on Results:
          </Typography>
          <Typography variant="body2">
            1. <strong>If matching count is correct</strong> → Issue is in component rendering/state
            <br />
            2. <strong>If matching count is wrong</strong> → Issue is in data or filtering logic
            <br />
            3. <strong>If type issues found</strong> → Need to fix data type mismatches
            <br />
            4. <strong>After debug</strong> → Check actual dashboard and projects page
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ThoroughDebugTest;