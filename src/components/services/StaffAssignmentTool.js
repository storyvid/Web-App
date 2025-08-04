import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import firebaseService from '../../services/firebase/firebaseService';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const StaffAssignmentTool = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState({});

  const analyzeStaffAssignments = async () => {
    setLoading(true);
    setData(null);
    
    try {
      console.log('🔍 ANALYZING STAFF ASSIGNMENTS...');
      
      // Get all projects and staff users
      const [allProjects, allUsers] = await Promise.all([
        firebaseService.getProjects(),
        firebaseService.getAllUsers()
      ]);
      
      const staffUsers = allUsers.filter(u => u.role === 'staff');
      console.log('Staff users:', staffUsers);
      console.log('All projects:', allProjects);
      
      // Analyze current assignments
      const projectAnalysis = allProjects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status,
        assignedStaff: project.assignedStaff || [],
        projectManager: project.projectManager || null,
        hasStaffAssigned: !!(project.assignedStaff?.length || project.projectManager),
        needsAssignment: !(project.assignedStaff?.length || project.projectManager)
      }));
      
      const unassignedProjects = projectAnalysis.filter(p => p.needsAssignment);
      const assignedProjects = projectAnalysis.filter(p => p.hasStaffAssigned);
      
      console.log('Project analysis:', projectAnalysis);
      
      setData({
        allProjects: projectAnalysis,
        staffUsers,
        unassignedProjects,
        assignedProjects,
        stats: {
          total: allProjects.length,
          assigned: assignedProjects.length,
          unassigned: unassignedProjects.length
        }
      });
      
      // Initialize assignments for unassigned projects
      const initialAssignments = {};
      unassignedProjects.forEach(project => {
        initialAssignments[project.id] = {
          assignedStaff: [],
          projectManager: ''
        };
      });
      setAssignments(initialAssignments);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = (projectId, field, value) => {
    setAssignments(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value
      }
    }));
  };

  const applyAssignments = async () => {
    setLoading(true);
    try {
      console.log('🔧 APPLYING STAFF ASSIGNMENTS...');
      
      const updates = [];
      for (const [projectId, assignment] of Object.entries(assignments)) {
        if (assignment.projectManager || assignment.assignedStaff.length > 0) {
          updates.push({
            id: projectId,
            assignedStaff: assignment.assignedStaff,
            projectManager: assignment.projectManager
          });
        }
      }
      
      console.log('Applying updates:', updates);
      
      // Update each project
      for (const update of updates) {
        await firebaseService.updateProject(update.id, {
          assignedStaff: update.assignedStaff,
          projectManager: update.projectManager
        });
      }
      
      alert(`Successfully assigned staff to ${updates.length} projects!`);
      
      // Refresh data
      await analyzeStaffAssignments();
      
    } catch (error) {
      console.error('Assignment failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickAssignAll = (staffUserId) => {
    if (!data?.unassignedProjects) return;
    
    const updatedAssignments = { ...assignments };
    data.unassignedProjects.forEach(project => {
      updatedAssignments[project.id] = {
        assignedStaff: [staffUserId],
        projectManager: staffUserId
      };
    });
    setAssignments(updatedAssignments);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        👥 Staff Assignment Tool
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Assign staff members to projects so they can see their work.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Current Issue:</strong> Staff user can't see projects because they're not assigned
          <br />
          <strong>Solution:</strong> Assign staff to projects via assignedStaff or projectManager fields
          <br />
          <strong>Security:</strong> Staff will ONLY see projects they're assigned to
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={analyzeStaffAssignments}
          disabled={loading}
          color="primary"
        >
          🔍 Analyze Assignments
        </Button>
        
        {data && !data.error && data.unassignedProjects?.length > 0 && (
          <Button 
            variant="contained" 
            color="success"
            onClick={applyAssignments}
            disabled={loading || Object.keys(assignments).length === 0}
          >
            💾 Apply Assignments
          </Button>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Processing...</Typography>
        </Box>
      )}

      {data && (
        <Box>
          {data.error ? (
            <Alert severity="error">
              <Typography>Error: {data.error}</Typography>
            </Alert>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography>
                  Found {data.stats.total} total projects: 
                  {data.stats.assigned} assigned, {data.stats.unassigned} unassigned
                  <br />
                  Staff users available: {data.staffUsers.length}
                </Typography>
              </Alert>

              {/* Quick Assignment */}
              {data.unassignedProjects.length > 0 && data.staffUsers.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🚀 Quick Assignment
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Assign all unassigned projects to a staff member:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {data.staffUsers.map(staff => (
                        <Button
                          key={staff.uid}
                          variant="outlined"
                          onClick={() => quickAssignAll(staff.uid)}
                        >
                          Assign All to {staff.name}
                        </Button>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Unassigned Projects */}
              {data.unassignedProjects.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ⚠️ Unassigned Projects ({data.unassignedProjects.length})
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Project Name</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Assign Staff</strong></TableCell>
                            <TableCell><strong>Project Manager</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.unassignedProjects.map(project => (
                            <TableRow key={project.id}>
                              <TableCell>{project.name}</TableCell>
                              <TableCell>
                                <Chip label={project.status} size="small" />
                              </TableCell>
                              <TableCell>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                  <Select
                                    multiple
                                    value={assignments[project.id]?.assignedStaff || []}
                                    onChange={(e) => updateAssignment(project.id, 'assignedStaff', e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => 
                                      selected.length === 0 ? 'Select Staff' : 
                                      selected.map(id => data.staffUsers.find(s => s.uid === id)?.name).join(', ')
                                    }
                                  >
                                    {data.staffUsers.map(staff => (
                                      <MenuItem key={staff.uid} value={staff.uid}>
                                        {staff.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                  <Select
                                    value={assignments[project.id]?.projectManager || ''}
                                    onChange={(e) => updateAssignment(project.id, 'projectManager', e.target.value)}
                                    displayEmpty
                                  >
                                    <MenuItem value="">None</MenuItem>
                                    {data.staffUsers.map(staff => (
                                      <MenuItem key={staff.uid} value={staff.uid}>
                                        {staff.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Projects */}
              {data.assignedProjects.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ✅ Assigned Projects ({data.assignedProjects.length})
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Project Name</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Assigned Staff</strong></TableCell>
                            <TableCell><strong>Project Manager</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.assignedProjects.slice(0, 10).map(project => (
                            <TableRow key={project.id}>
                              <TableCell>{project.name}</TableCell>
                              <TableCell>
                                <Chip label={project.status} size="small" />
                              </TableCell>
                              <TableCell>
                                {project.assignedStaff.length > 0 ? 
                                  project.assignedStaff.join(', ') : 'None'}
                              </TableCell>
                              <TableCell>
                                {project.projectManager || 'None'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
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

export default StaffAssignmentTool;