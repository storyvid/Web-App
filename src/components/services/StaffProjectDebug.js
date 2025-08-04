import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const StaffProjectDebug = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const debugStaffProjects = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 DEBUGGING STAFF PROJECT ACCESS...');
      console.log('Current user:', user);
      
      // Get all projects
      const allProjects = await firebaseService.getProjects();
      console.log('All projects:', allProjects);
      
      // Check what fields exist for staff filtering
      const projectAnalysis = allProjects.map(project => ({
        name: project.name,
        id: project.id,
        assignedStaff: project.assignedStaff,
        projectManager: project.projectManager,
        hasAssignedStaff: !!project.assignedStaff,
        hasProjectManager: !!project.projectManager,
        staffIncludes: project.assignedStaff?.includes(user.uid),
        managerMatches: project.projectManager === user.uid,
        shouldShowForStaff: project.assignedStaff?.includes(user.uid) || project.projectManager === user.uid
      }));
      
      console.log('Project analysis:', projectAnalysis);
      
      // Current filtering logic
      const currentStaffProjects = allProjects.filter(project => 
        project.assignedStaff?.includes(user.uid) || 
        project.projectManager === user.uid
      );
      
      console.log('Current staff filtering result:', currentStaffProjects);
      
      // Alternative filtering approaches
      const alternativeFilters = {
        // Option 1: Projects where staff is mentioned anywhere
        anyMention: allProjects.filter(project => 
          JSON.stringify(project).includes(user.uid)
        ),
        
        // Option 2: Projects created by this user
        createdByUser: allProjects.filter(project => 
          project.createdBy === user.uid || project.creator === user.uid
        ),
        
        // Option 3: All projects for now (fallback)
        allProjects: allProjects
      };
      
      setResult({
        user: {
          uid: user.uid,
          name: user.name,
          role: user.role
        },
        totalProjects: allProjects.length,
        projectAnalysis,
        currentStaffProjects: currentStaffProjects.length,
        alternativeFilters: {
          anyMention: alternativeFilters.anyMention.length,
          createdByUser: alternativeFilters.createdByUser.length,
          allProjects: alternativeFilters.allProjects.length
        },
        recommendations: getRecommendations(projectAnalysis, currentStaffProjects.length)
      });
      
    } catch (error) {
      console.error('Staff debug failed:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = (analysis, currentCount) => {
    const projectsWithoutStaffFields = analysis.filter(p => !p.hasAssignedStaff && !p.hasProjectManager);
    
    if (currentCount === 0 && projectsWithoutStaffFields.length > 0) {
      return [
        "Staff has 0 projects because projects are missing assignedStaff/projectManager fields",
        `${projectsWithoutStaffFields.length} projects have no staff assignment fields`,
        "Recommendation: Either populate these fields OR change filtering logic",
        "Quick fix: Show all projects to staff temporarily"
      ];
    }
    
    if (currentCount > 0) {
      return [
        "Staff filtering is working correctly",
        `Staff has access to ${currentCount} projects`
      ];
    }
    
    return [
      "No clear issue identified",
      "May need to assign staff to projects or change filtering logic"
    ];
  };

  const applyQuickFix = async () => {
    alert('Quick fix would modify the staff filtering to show more projects. This is a demo - implement the actual fix in the component.');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        👥 Staff Project Access Debug
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Debugging why staff members can't see their projects.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Issue:</strong> Staff user logged in but sees no projects
          <br />
          <strong>Current filtering:</strong> project.assignedStaff?.includes(user.uid) || project.projectManager === user.uid
          <br />
          <strong>This will check:</strong> If projects have the required staff assignment fields
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={debugStaffProjects}
          disabled={loading}
          color="primary"
        >
          🔍 Debug Staff Projects
        </Button>
        
        {result && !result.error && (
          <Button 
            variant="contained" 
            color="secondary"
            onClick={applyQuickFix}
            disabled={loading}
          >
            🔧 Apply Quick Fix
          </Button>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Debugging staff project access...</Typography>
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
                  Staff user: {result.user.name} ({result.user.uid})
                  <br />
                  Total projects in database: {result.totalProjects}
                  <br />
                  Projects accessible to staff: {result.currentStaffProjects}
                </Typography>
              </Alert>

              {result.recommendations && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🎯 Analysis & Recommendations:
                    </Typography>
                    {result.recommendations.map((rec, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                        • {rec}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Alternative Filtering Results:
                  </Typography>
                  <Typography variant="body2">
                    • Any mention of user ID: {result.alternativeFilters.anyMention} projects
                    <br />
                    • Created by user: {result.alternativeFilters.createdByUser} projects  
                    <br />
                    • All projects: {result.alternativeFilters.allProjects} projects
                  </Typography>
                </CardContent>
              </Card>

              {result.projectAnalysis && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📋 Project Staff Assignment Analysis:
                    </Typography>
                    {result.projectAnalysis.slice(0, 5).map((project, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>{project.name}</strong>
                          <br />
                          Has assignedStaff: {project.hasAssignedStaff ? '✅' : '❌'}
                          <br />
                          Has projectManager: {project.hasProjectManager ? '✅' : '❌'}
                          <br />
                          Should show for staff: {project.shouldShowForStaff ? '✅' : '❌'}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StaffProjectDebug;