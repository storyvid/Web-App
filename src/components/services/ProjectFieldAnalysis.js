import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import firebaseService from '../../services/firebase/firebaseService';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const ProjectFieldAnalysis = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeProjectFields = async () => {
    setLoading(true);
    setAnalysis(null);
    
    try {
      console.log('🔍 ANALYZING PROJECT FIELD STRUCTURES...');
      
      // Get all projects for this user
      const allProjects = await firebaseService.getProjects();
      const userProjects = allProjects.filter(project => project.clientId === user.uid);
      
      console.log('Found user projects:', userProjects);
      
      // Categorize projects by creation method (based on fields or names)
      const servicesCreated = userProjects.filter(p => 
        p.serviceRequested || 
        p.name?.toLowerCase().includes('service') ||
        p.name?.toLowerCase().includes('commercial') ||
        p.name?.toLowerCase().includes('sam') // Based on your project names
      );
      
      const regularProjects = userProjects.filter(p => !servicesCreated.includes(p));
      
      // Analyze field differences
      const getProjectFields = (projects) => {
        const allFields = new Set();
        const fieldAnalysis = {};
        
        projects.forEach(project => {
          Object.keys(project).forEach(key => {
            allFields.add(key);
            if (!fieldAnalysis[key]) {
              fieldAnalysis[key] = {
                presentIn: 0,
                values: new Set(),
                types: new Set()
              };
            }
            fieldAnalysis[key].presentIn++;
            fieldAnalysis[key].values.add(String(project[key]).substring(0, 50)); // Truncate long values
            fieldAnalysis[key].types.add(typeof project[key]);
          });
        });
        
        return { allFields: Array.from(allFields), fieldAnalysis };
      };
      
      const servicesFields = getProjectFields(servicesCreated);
      const regularFields = getProjectFields(regularProjects);
      
      // Find missing fields
      const missingInServices = regularFields.allFields.filter(field => 
        !servicesFields.allFields.includes(field)
      );
      
      const missingInRegular = servicesFields.allFields.filter(field => 
        !regularFields.allFields.includes(field)
      );
      
      // Check for potential UI filtering conditions
      const potentialFilters = [
        'status',
        'approvalStatus', 
        'statusLabel',
        'progress',
        'visibility',
        'active',
        'deleted',
        'archived',
        'published'
      ];
      
      const filterAnalysis = {};
      potentialFilters.forEach(field => {
        filterAnalysis[field] = {
          servicesValues: servicesCreated.map(p => ({ name: p.name, value: p[field] })),
          regularValues: regularProjects.map(p => ({ name: p.name, value: p[field] }))
        };
      });
      
      // Detailed project comparison
      const projectComparison = userProjects.map(project => {
        const isServicesCreated = servicesCreated.includes(project);
        return {
          name: project.name,
          id: project.id,
          creationType: isServicesCreated ? 'Services Page' : 'Regular',
          status: project.status,
          statusLabel: project.statusLabel,
          approvalStatus: project.approvalStatus,
          progress: project.progress,
          hasServiceRequested: !!project.serviceRequested,
          hasVideoType: !!project.videoType,
          hasEstimatedHours: !!project.estimatedHours,
          createdAt: project.createdAt,
          // Check for all critical fields
          criticalFields: {
            status: project.status !== undefined,
            statusLabel: project.statusLabel !== undefined,
            approvalStatus: project.approvalStatus !== undefined,
            progress: project.progress !== undefined,
            clientId: project.clientId !== undefined,
            name: project.name !== undefined
          }
        };
      });
      
      setAnalysis({
        totalUserProjects: userProjects.length,
        servicesCreated: servicesCreated.length,
        regularProjects: regularProjects.length,
        servicesFields,
        regularFields,
        missingInServices,
        missingInRegular,
        filterAnalysis,
        projectComparison,
        rawProjects: userProjects
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkDashboardFiltering = () => {
    if (!analysis) return;
    
    console.log('🔍 CHECKING DASHBOARD FILTERING LOGIC...');
    
    // Simulate the dashboard filtering that might be happening
    const projects = analysis.rawProjects;
    
    console.log('All user projects:', projects.length);
    
    // Check common filter conditions
    const activeProjects = projects.filter(p => p.status !== 'deleted' && p.status !== 'archived');
    console.log('Active projects (not deleted/archived):', activeProjects.length);
    
    const approvedProjects = projects.filter(p => p.approvalStatus === 'approved' || !p.approvalStatus);
    console.log('Approved projects:', approvedProjects.length);
    
    const visibleProjects = projects.filter(p => p.visibility !== 'hidden');
    console.log('Visible projects:', visibleProjects.length);
    
    const withProgress = projects.filter(p => p.progress !== undefined && p.progress !== null);
    console.log('Projects with progress defined:', withProgress.length);
    
    const withValidStatus = projects.filter(p => 
      p.status && p.status !== 'draft' && p.status !== 'pending'
    );
    console.log('Projects with valid status (not draft/pending):', withValidStatus.length);
    
    // Most likely culprits for showing only 2 projects
    const likelyDashboardFilter = projects.filter(p => 
      p.status && 
      p.status !== 'draft' && 
      p.status !== 'service_request' &&
      p.approvalStatus !== 'pending'
    );
    console.log('🎯 LIKELY DASHBOARD FILTER (status not draft/service_request, approval not pending):', likelyDashboardFilter.length);
    
    if (likelyDashboardFilter.length === 2) {
      console.log('🎯 FOUND THE ISSUE! Dashboard is filtering out draft/service_request/pending projects');
      console.log('Filtered projects:', likelyDashboardFilter);
      console.log('Excluded projects:', projects.filter(p => !likelyDashboardFilter.includes(p)));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Project Field Structure Analysis
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Analyzing why 5 matching projects show as only 2 in dashboard UI.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Issue:</strong> Debug shows 5 matching projects, but dashboard shows 2
          <br />
          <strong>Hypothesis:</strong> UI filtering based on project status, approvalStatus, or missing fields
          <br />
          <strong>This analysis will:</strong> Compare Services-created vs regular project fields
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={analyzeProjectFields}
          disabled={loading}
          color="primary"
          size="large"
        >
          🔍 Analyze Project Fields
        </Button>
        
        {analysis && !analysis.error && (
          <Button 
            variant="contained" 
            color="secondary"
            onClick={checkDashboardFiltering}
            disabled={loading}
          >
            🎯 Check Dashboard Filtering
          </Button>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Analyzing project structures...</Typography>
        </Box>
      )}

      {analysis && (
        <Box>
          {analysis.error ? (
            <Alert severity="error">
              <Typography>Analysis failed: {analysis.error}</Typography>
            </Alert>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography>
                  Found {analysis.totalUserProjects} total projects: 
                  {analysis.servicesCreated} created via Services page, 
                  {analysis.regularProjects} regular projects
                </Typography>
              </Alert>

              {/* Project Comparison Table */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">📊 Project Comparison (All 5 Projects)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Project Name</strong></TableCell>
                          <TableCell><strong>Creation Type</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Approval Status</strong></TableCell>
                          <TableCell><strong>Progress</strong></TableCell>
                          <TableCell><strong>Has Service Field</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analysis.projectComparison.map((project, index) => (
                          <TableRow key={index}>
                            <TableCell>{project.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={project.creationType}
                                color={project.creationType === 'Services Page' ? 'primary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={project.status || 'undefined'}
                                color={
                                  project.status === 'draft' ? 'warning' :
                                  project.status === 'service_request' ? 'info' :
                                  project.status === 'in_progress' ? 'success' : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={project.approvalStatus || 'undefined'}
                                color={
                                  project.approvalStatus === 'pending' ? 'warning' :
                                  project.approvalStatus === 'approved' ? 'success' : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{project.progress ?? 'undefined'}</TableCell>
                            <TableCell>{project.hasServiceRequested ? '✅' : '❌'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

              {/* Field Differences */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">🔧 Field Differences</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {analysis.missingInServices.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="error">
                        ❌ Fields missing in Services-created projects:
                      </Typography>
                      <Typography variant="body2">
                        {analysis.missingInServices.join(', ')}
                      </Typography>
                    </Box>
                  )}
                  
                  {analysis.missingInRegular.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="info">
                        🆕 Fields only in Services-created projects:
                      </Typography>
                      <Typography variant="body2">
                        {analysis.missingInRegular.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Status Filter Analysis */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">🎯 Status Filter Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Status Values by Project Type:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Services Created:</Typography>
                        {analysis.filterAnalysis.status?.servicesValues.map((item, index) => (
                          <Typography key={index} variant="body2">
                            • {item.name}: "{item.value}"
                          </Typography>
                        ))}
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Regular Projects:</Typography>
                        {analysis.filterAnalysis.status?.regularValues.map((item, index) => (
                          <Typography key={index} variant="body2">
                            • {item.name}: "{item.value}"
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Box>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Expected Findings:
          </Typography>
          <Typography variant="body2">
            1. <strong>Status Filtering:</strong> Dashboard might filter out 'draft' or 'service_request' status
            <br />
            2. <strong>Approval Filtering:</strong> Dashboard might only show 'approved' projects
            <br />
            3. <strong>Missing Critical Fields:</strong> Services-created projects missing required UI fields
            <br />
            4. <strong>Progress Filtering:</strong> Dashboard might filter based on progress values
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectFieldAnalysis;