import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const StaffAssignmentDebug = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const debugStaffAssignments = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 DEBUGGING STAFF ASSIGNMENT MISMATCH...');
      console.log('Current staff user ID:', user.uid);
      
      // Get all projects
      const allProjects = await firebaseService.getProjects();
      console.log('All projects:', allProjects);
      
      // Detailed analysis of each project's assignment fields
      const projectAnalysis = allProjects.map(project => {
        const assignedStaffArray = project.assignedStaff || [];
        const projectManager = project.projectManager || null;
        
        return {
          name: project.name,
          id: project.id,
          assignedStaff: assignedStaffArray,
          assignedStaffType: typeof assignedStaffArray,
          assignedStaffLength: Array.isArray(assignedStaffArray) ? assignedStaffArray.length : 'Not array',
          projectManager: projectManager,
          projectManagerType: typeof projectManager,
          // Check exact matches
          staffIncludesExact: Array.isArray(assignedStaffArray) && assignedStaffArray.includes(user.uid),
          managerMatchesExact: projectManager === user.uid,
          // Check loose matches (string comparison)
          staffIncludesLoose: Array.isArray(assignedStaffArray) && assignedStaffArray.some(id => String(id) === String(user.uid)),
          managerMatchesLoose: String(projectManager) === String(user.uid),
          // Raw values for inspection
          assignedStaffRaw: JSON.stringify(assignedStaffArray),
          projectManagerRaw: JSON.stringify(projectManager),
          // Overall match
          shouldMatchCurrent: (Array.isArray(assignedStaffArray) && assignedStaffArray.includes(user.uid)) || projectManager === user.uid
        };
      });
      
      console.log('Project analysis:', projectAnalysis);
      
      // Find projects that should match but don't
      const expectedMatches = projectAnalysis.filter(p => p.shouldMatchCurrent);
      const actualMatches = allProjects.filter(project => 
        project.assignedStaff?.includes(user.uid) || 
        project.projectManager === user.uid
      );
      
      // Check for data type issues
      const dataTypeIssues = projectAnalysis.filter(p => 
        (p.assignedStaffType !== 'object' && p.assignedStaff !== null) ||
        (Array.isArray(p.assignedStaff) && p.assignedStaff.some(id => typeof id !== 'string'))
      );
      
      // Look for projects that mention this user ID anywhere
      const mentionsUser = projectAnalysis.filter(p => 
        JSON.stringify(p).toLowerCase().includes(user.uid.toLowerCase())
      );
      
      setResult({
        staffUserId: user.uid,
        totalProjects: allProjects.length,
        expectedMatches: expectedMatches.length,
        actualMatches: actualMatches.length,
        projectAnalysis: projectAnalysis.slice(0, 10), // Show first 10 for display
        dataTypeIssues,
        mentionsUser,
        recommendations: getRecommendations(projectAnalysis, expectedMatches.length, actualMatches.length, user.uid)
      });
      
    } catch (error) {
      console.error('Debug failed:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = (projects, expected, actual, userId) => {
    const recs = [];
    
    if (expected === 0 && actual === 0) {
      recs.push("No projects have this staff user assigned at all");
      recs.push("Use the Staff Assignment Tool to assign projects to this user");
    }
    
    if (expected > actual) {
      recs.push(`Expected ${expected} matches but only found ${actual} - data type issue?`);
    }
    
    const hasDataTypeIssues = projects.some(p => 
      p.assignedStaffType !== 'object' || 
      (Array.isArray(p.assignedStaff) && p.assignedStaff.some(id => typeof id !== 'string'))
    );
    
    if (hasDataTypeIssues) {
      recs.push("Found data type issues in assignedStaff fields");
    }
    
    const projectsWithAssignments = projects.filter(p => 
      p.assignedStaff?.length > 0 || p.projectManager
    );
    
    if (projectsWithAssignments.length === 0) {
      recs.push("No projects have ANY staff assignments - need to populate assignment fields");
    }
    
    return recs;
  };

  const fixStaffUser = async () => {
    try {
      // This would be a quick fix to assign current user to a test project
      const allProjects = await firebaseService.getProjects();
      if (allProjects.length > 0) {
        const firstProject = allProjects[0];
        await firebaseService.updateProject(firstProject.id, {
          assignedStaff: [user.uid],
          projectManager: user.uid
        });
        alert(`Assigned you to project: ${firstProject.name}`);
        debugStaffAssignments(); // Refresh
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Staff Assignment Debug
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Debugging why staff user sees 0 projects when assignments were made.
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Issue:</strong> Staff user {user?.name} (ID: {user?.uid}) sees 0 projects
          <br />
          <strong>Expected:</strong> Should see projects where assignedStaff includes this ID or projectManager equals this ID
          <br />
          <strong>This will check:</strong> Exact field values and data types in project assignments
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={debugStaffAssignments}
          disabled={loading}
          color="primary"
        >
          🔍 Debug Assignments
        </Button>
        
        <Button 
          variant="contained" 
          color="warning"
          onClick={fixStaffUser}
          disabled={loading}
        >
          🔧 Quick Fix (Assign to First Project)
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Debugging assignments...</Typography>
        </Box>
      )}

      {result && (
        <Box>
          {result.error ? (
            <Alert severity="error">
              <Typography>Debug failed: {result.error}</Typography>
            </Alert>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography>
                  Staff User ID: {result.staffUserId}
                  <br />
                  Total Projects: {result.totalProjects}
                  <br />
                  Expected Matches: {result.expectedMatches}
                  <br />
                  Actual Matches: {result.actualMatches}
                </Typography>
              </Alert>

              {result.recommendations.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🎯 Recommendations:
                    </Typography>
                    {result.recommendations.map((rec, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                        • {rec}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              )}

              {result.mentionsUser.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🔍 Projects Mentioning This User ({result.mentionsUser.length}):
                    </Typography>
                    {result.mentionsUser.map((project, index) => (
                      <Typography key={index} variant="body2">
                        • {project.name}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Project Assignment Analysis (First 10):
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Project</strong></TableCell>
                          <TableCell><strong>Assigned Staff</strong></TableCell>
                          <TableCell><strong>Project Manager</strong></TableCell>
                          <TableCell><strong>Should Match</strong></TableCell>
                          <TableCell><strong>Staff Includes</strong></TableCell>
                          <TableCell><strong>Manager Matches</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.projectAnalysis.map((project, index) => (
                          <TableRow key={index}>
                            <TableCell>{project.name}</TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {project.assignedStaffRaw}
                                <br />
                                (Length: {project.assignedStaffLength})
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {project.projectManagerRaw}
                                <br />
                                (Type: {project.projectManagerType})
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {project.shouldMatchCurrent ? '✅' : '❌'}
                            </TableCell>
                            <TableCell>
                              {project.staffIncludesExact ? '✅' : '❌'}
                              {project.staffIncludesLoose !== project.staffIncludesExact && ' (loose: ✅)'}
                            </TableCell>
                            <TableCell>
                              {project.managerMatchesExact ? '✅' : '❌'}
                              {project.managerMatchesLoose !== project.managerMatchesExact && ' (loose: ✅)'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StaffAssignmentDebug;