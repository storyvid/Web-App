import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Fab,
  LinearProgress,
  Stack,
  Avatar,
  Tooltip,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import projectManagementService from '../../services/projectManagementService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminProjectsContent = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  
  // Data state
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  
  // UI state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [createLoading, setCreateLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    assignedTo: '',
    status: 'todo',
    priority: 'medium',
    timeline: {
      startDate: '',
      endDate: '',
      estimatedHours: ''
    },
    budget: {
      estimated: '',
      currency: 'USD'
    }
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    comment: ''
  });

  // Inline editing state
  const [editingProgress, setEditingProgress] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [tempProgress, setTempProgress] = useState('');
  const [tempStatus, setTempStatus] = useState('');

  useEffect(() => {
    // Don't do anything if auth is still loading or user is incomplete
    if (authLoading || !user || user === null || !user.uid || !user.role) {
      return; // Still loading auth state or user data incomplete
    }
    
    if (user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    
    loadData();
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    // Don't proceed if auth is still loading or user is incomplete
    if (authLoading || !user || user === null || !user.uid || !user.role) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Ensure projectManagementService has current user context
      projectManagementService.setCurrentUser(user);
      
      const [projectsData, usersData, statsData] = await Promise.all([
        projectManagementService.getAllProjects(),
        projectManagementService.getAllUsers(),
        projectManagementService.getProjectStatistics()
      ]);
      
      setProjects(projectsData);
      setUsers(usersData);
      setStatistics(statsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
      
      // Only show error if this isn't an auth-related issue
      if (user && user.role === 'admin') {
        // User-friendly error messages based on error type
        let userMessage = 'Unable to load project data. ';
        
        if (err.message.includes('permission') || err.message.includes('admin')) {
          userMessage = 'Access denied. Only administrators can view this page.';
        } else if (err.message.includes('network') || err.message.includes('offline')) {
          userMessage = 'Connection problem. Please check your internet and try again.';
        } else {
          userMessage += 'Please refresh the page or contact support if this continues.';
        }
        
        setError(userMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    // Clear any previous errors
    setError('');
    setSuccess('');

    // Validation with user-friendly messages
    if (!newProject.name?.trim()) {
      setError('Please enter a project name.');
      return;
    }
    
    if (!newProject.assignedTo) {
      setError('Please select a team member to assign this project to.');
      return;
    }

    // Optional validation for better UX
    if (newProject.name.trim().length < 3) {
      setError('Project name must be at least 3 characters long.');
      return;
    }

    try {
      setCreateLoading(true);
      setError('');
      
      const newProjectData = await projectManagementService.createProject(newProject, newProject.assignedTo);
      
      // Show success message and auto-close after delay
      setSuccess(`✅ Project "${newProjectData.name}" created and assigned successfully!`);
      
      // Auto-close dialog after showing success message
      setTimeout(() => {
        setShowCreateDialog(false);
        setSuccess('');
        setNewProject({
          name: '',
          description: '',
          assignedTo: '',
          status: 'todo',
          priority: 'medium',
          timeline: { startDate: '', endDate: '', estimatedHours: '' },
          budget: { estimated: '', currency: 'USD' }
        });
      }, 1500);
      
      // Reload data immediately
      loadData();
    } catch (err) {
      console.error('Error creating project:', err);
      
      // User-friendly error messages
      let userMessage = 'Unable to create project. ';
      
      if (err.message.includes('Failed to create project')) {
        userMessage += 'Please check that all required fields are filled correctly.';
      } else if (err.message.includes('not found')) {
        userMessage += 'The selected team member was not found. Please try selecting again.';
      } else if (err.message.includes('permission')) {
        userMessage += 'You don\'t have permission to create projects.';
      } else if (err.message.includes('network') || err.message.includes('offline')) {
        userMessage += 'Please check your internet connection and try again.';
      } else {
        userMessage += 'Please try again or contact support if the problem persists.';
      }
      
      setError(userMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      setError('Please select a status.');
      return;
    }

    try {
      setStatusLoading(true);
      setError('');
      
      await projectManagementService.updateProjectStatus(
        selectedProject.id, 
        statusUpdate.status, 
        statusUpdate.comment
      );
      
      setSuccess('Project status updated successfully!');
      setShowStatusDialog(false);
      setStatusUpdate({ status: '', comment: '' });
      setSelectedProject(null);
      
      // Reload data
      loadData();
    } catch (err) {
      console.error('Error updating project status:', err);
      setError(`Failed to update status: ${err.message}`);
    } finally {
      setStatusLoading(false);
    }
  };

  // Inline editing functions
  const startProgressEdit = (projectId, currentProgress) => {
    setEditingProgress(projectId);
    setTempProgress(currentProgress.toString());
  };

  const startStatusEdit = (projectId, currentStatus) => {
    setEditingStatus(projectId);
    setTempStatus(currentStatus);
  };

  const saveProgressEdit = async (projectId) => {
    const newProgress = parseInt(tempProgress);
    
    // Enhanced validation with user-friendly messages
    if (isNaN(newProgress) || tempProgress.trim() === '') {
      setError('Please enter a valid number for progress.');
      return;
    }
    
    if (newProgress < 0 || newProgress > 100) {
      setError('Progress must be between 0 and 100.');
      return;
    }
    
    try {
      setError(''); // Clear any existing errors
      await projectManagementService.updateProjectProgress(projectId, newProgress);
      setSuccess(`✅ Progress updated to ${newProgress}%`);
      setEditingProgress(null);
      setTempProgress('');
      
      // Auto-clear success message after 2 seconds
      setTimeout(() => setSuccess(''), 2000);
      
      loadData();
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Unable to update progress. Please try again.');
    }
  };

  const saveStatusEdit = async (projectId) => {
    if (!tempStatus) {
      setError('Please select a status.');
      return;
    }
    
    try {
      setError(''); // Clear any existing errors
      await projectManagementService.updateProjectStatus(projectId, tempStatus);
      
      const statusDisplayName = tempStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      setSuccess(`✅ Status updated to ${statusDisplayName}`);
      setEditingStatus(null);
      setTempStatus('');
      
      // Auto-clear success message after 2 seconds
      setTimeout(() => setSuccess(''), 2000);
      
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Unable to update status. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingProgress(null);
    setEditingStatus(null);
    setTempProgress('');
    setTempStatus('');
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'info',
      'in-progress': 'primary',
      'awaiting-feedback': 'warning',
      'completed': 'success'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Not set';
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'name' || sortBy === 'assignedToName') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  if (loading || authLoading || !user || user === null || !user.uid || !user.role) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={600}>
            Project Management
          </Typography>
          <Button
            variant="contained"
            startIcon={loading ? (
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  border: '2px solid currentColor',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
            ) : (
              <RefreshIcon />
            )}
            onClick={loadData}
            disabled={loading}
            sx={{ 
              minWidth: 120,
              transition: 'all 0.2s ease-in-out' 
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Create, assign, and manage projects across your organization
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                {statistics.totalProjects || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight={700}>
                {statistics.activeProjects || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {statistics.completedProjects || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {statistics.averageProgress || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={500} color="text.secondary">
              All Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateDialog(true)}
            >
              Create Project
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortOrder}
                      onClick={() => {
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setSortBy('name');
                      }}
                    >
                      Project Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedProjects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {project.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {project.assignedToName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.assignedToEmail}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {editingStatus === project.id ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={tempStatus}
                              onChange={(e) => setTempStatus(e.target.value)}
                              size="small"
                            >
                              <MenuItem value="todo">To Do</MenuItem>
                              <MenuItem value="in-progress">In Progress</MenuItem>
                              <MenuItem value="awaiting-feedback">Awaiting Feedback</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton size="small" onClick={() => saveStatusEdit(project.id)}>
                            <CheckIcon />
                          </IconButton>
                          <IconButton size="small" onClick={cancelEdit}>
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Chip
                          label={project.status?.replace('-', ' ') || 'Unknown'}
                          color={getStatusColor(project.status)}
                          size="small"
                          sx={{ 
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => startStatusEdit(project.id, project.status)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.priority || 'Medium'}
                        color={getPriorityColor(project.priority)}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {editingProgress === project.id ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TextField
                            size="small"
                            type="number"
                            value={tempProgress}
                            onChange={(e) => setTempProgress(e.target.value)}
                            inputProps={{ min: 0, max: 100 }}
                            sx={{ width: 80 }}
                          />
                          <Typography variant="body2">%</Typography>
                          <IconButton size="small" onClick={() => saveProgressEdit(project.id)}>
                            <CheckIcon />
                          </IconButton>
                          <IconButton size="small" onClick={cancelEdit}>
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => startProgressEdit(project.id, project.progress)}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={project.progress || 0}
                            sx={{ width: 60, height: 6 }}
                          />
                          <Typography variant="body2">
                            {project.progress || 0}%
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(project.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Manage Timeline">
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigate(`/project/${project.id}/timeline`);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <TimelineIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setActionAnchor(e.currentTarget);
                            setSelectedProject(project);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {projects.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Create your first project to get started.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
                sx={{ mt: 2 }}
              >
                Create Project
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setShowCreateDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={() => setActionAnchor(null)}
      >
        <MenuItem onClick={() => {
          navigate(`/project/${selectedProject?.id}`);
          setActionAnchor(null);
        }}>
          <EditIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          setStatusUpdate({ status: selectedProject?.status || '', comment: '' });
          setShowStatusDialog(true);
          setActionAnchor(null);
        }}>
          <ScheduleIcon sx={{ mr: 1 }} />
          Update Status
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/project/${selectedProject?.id}/timeline`);
          setActionAnchor(null);
        }}>
          <TimelineIcon sx={{ mr: 1 }} />
          Manage Timeline
        </MenuItem>
      </Menu>

      {/* Create Project Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => {
          setShowCreateDialog(false);
          setError('');
          setSuccess('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          {/* Dialog Error/Success Alert */}
          {error && showCreateDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && showCreateDialog && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newProject.assignedTo}
                  label="Assign To"
                  onChange={(e) => setNewProject(prev => ({ ...prev, assignedTo: e.target.value }))}
                >
                  {users.map((user) => (
                    <MenuItem key={user.uid} value={user.uid}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newProject.priority}
                  label="Priority"
                  onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newProject.timeline.startDate}
                onChange={(e) => setNewProject(prev => ({
                  ...prev,
                  timeline: { ...prev.timeline, startDate: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newProject.timeline.endDate}
                onChange={(e) => setNewProject(prev => ({
                  ...prev,
                  timeline: { ...prev.timeline, endDate: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={newProject.timeline.estimatedHours}
                onChange={(e) => setNewProject(prev => ({
                  ...prev,
                  timeline: { ...prev.timeline, estimatedHours: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Budget ($)"
                type="number"
                value={newProject.budget.estimated}
                onChange={(e) => setNewProject(prev => ({
                  ...prev,
                  budget: { ...prev.budget, estimated: e.target.value }
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowCreateDialog(false);
              setError('');
              setSuccess('');
            }}
            disabled={createLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={createLoading || !newProject.name?.trim() || !newProject.assignedTo}
            sx={{
              minWidth: 140,
              transition: 'all 0.2s ease-in-out',
              '&:disabled': {
                opacity: 0.7
              }
            }}
          >
            {createLoading ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    border: '2px solid currentColor',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} 
                />
                <Typography variant="button">Creating...</Typography>
              </Stack>
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog 
        open={showStatusDialog} 
        onClose={() => setShowStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Project Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusUpdate.status}
              label="Status"
              onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="awaiting-feedback">Awaiting Feedback</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Comment (Optional)"
            multiline
            rows={3}
            value={statusUpdate.comment}
            onChange={(e) => setStatusUpdate(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Add a comment about this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={statusLoading}
          >
            {statusLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default AdminProjectsContent;