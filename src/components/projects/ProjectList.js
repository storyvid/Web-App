import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Grid,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Fab,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as TeamIcon,
  Comment as CommentIcon,
  PlayArrow as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';
import firebaseService from '../../services/firebase/firebaseService';
import PermissionGate from '../common/PermissionGate';
import RoleBasedButton from '../common/RoleBasedButton';
import ProjectCreationForm from './ProjectCreationForm';
import ProjectDetails from './ProjectDetails';

const ProjectList = ({ viewMode = 'grid' }) => {
  const user = useSelector(selectUser);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState(null);

  // Note: We're doing our own project filtering in loadProjects, so no need for useRoleBasedData filtering
  const permissions = { canView: true, canEdit: true, canDelete: false, canCreate: true };

  // Force refresh mechanism
  useEffect(() => {
    const handleForceRefresh = () => {
      console.log('🔄 Force refresh triggered for ProjectList');
      loadProjects();
    };
    
    window.addEventListener('forceProjectRefresh', handleForceRefresh);
    return () => window.removeEventListener('forceProjectRefresh', handleForceRefresh);
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('📋 ProjectList: Loading projects for user:', user?.uid, 'role:', user?.role);
      
      // Load real projects from Firebase
      const allProjects = await firebaseService.getProjects();
      console.log('📋 ProjectList: All projects from Firebase:', allProjects);
      
      let userProjects = [];
      switch (user?.role) {
        case 'client':
          userProjects = allProjects.filter(project => project.clientId === user.uid);
          break;
        case 'admin':
          userProjects = allProjects; // Admins see all projects
          break;
        case 'staff':
          userProjects = allProjects.filter(project => 
            project.assignedStaff?.includes(user.uid) || 
            project.projectManager === user.uid
          );
          break;
        default:
          userProjects = [];
      }
      
      console.log('📋 ProjectList: Filtered projects for user:', userProjects);
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getMockProjectsForRole = (role) => {
    const baseProjects = [
      {
        id: 'project-1',
        name: 'Corporate Brand Video',
        description: 'A comprehensive brand story video for corporate marketing',
        status: 'in_progress',
        priority: 'high',
        clientId: 'client-1',
        clientName: 'Tech Innovators Inc',
        companyId: 'company-123',
        projectManager: 'admin-1',
        assignedStaff: ['staff-1', 'staff-2'],
        timeline: {
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          estimatedHours: 120,
          actualHours: 80
        },
        projectType: 'Corporate Video',
        progress: 65,
        team: [
          { id: 'staff-1', name: 'John Doe', avatar: 'https://i.pravatar.cc/40?img=1' },
          { id: 'staff-2', name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/40?img=2' }
        ]
      },
      {
        id: 'project-2',
        name: 'Product Demo Series',
        description: 'A series of product demonstration videos',
        status: 'review',
        priority: 'medium',
        clientId: 'client-2',
        clientName: 'StartupCo',
        companyId: 'company-123',
        projectManager: 'admin-1',
        assignedStaff: ['staff-2', 'staff-3'],
        timeline: {
          startDate: '2024-01-01',
          endDate: '2024-01-30',
          estimatedHours: 80,
          actualHours: 75
        },
        projectType: 'Product Demo',
        progress: 90,
        team: [
          { id: 'staff-2', name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/40?img=2' },
          { id: 'staff-3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/40?img=3' }
        ]
      }
    ];

    // Filter based on role
    switch (role) {
      case 'client':
        return baseProjects.filter(p => p.clientId === user?.uid);
      case 'staff':
        return baseProjects.filter(p => p.assignedStaff.includes(user?.uid));
      case 'admin':
        return baseProjects;
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'info',
      'in-progress': 'primary',
      'awaiting-feedback': 'warning',
      'completed': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'info',
      'medium': 'warning',
      'high': 'error',
      'urgent': 'error'
    };
    return colors[priority] || 'default';
  };

  const handleProjectAction = (project, action) => {
    setSelectedProject(project);
    setActionAnchor(null);

    switch (action) {
      case 'view':
        setSelectedProjectForDetails(project);
        setShowProjectDetails(true);
        break;
      case 'edit':
        // Open edit dialog
        console.log('Edit project:', project.id);
        break;
      case 'status':
        setShowStatusDialog(true);
        break;
      case 'delete':
        handleDeleteProject(project.id);
        break;
      default:
        break;
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      console.log('Creating project:', projectData);
      // TODO: Call API to create project
      setShowCreateForm(false);
      await loadProjects(); // Reload projects
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
  };

  const handleDeleteProject = async (projectId) => {
    try {
      console.log('Deleting project:', projectId);
      // TODO: Call API to delete project
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleStatusChange = async () => {
    try {
      console.log('Changing status:', selectedProject.id, newStatus, statusComment);
      // TODO: Call API to change status
      const updatedProject = { ...selectedProject, status: newStatus };
      handleUpdateProject(updatedProject);
      setShowStatusDialog(false);
      setNewStatus('');
      setStatusComment('');
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  const getFilteredAndSortedProjects = () => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'name' || sortBy === 'clientName') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  };

  const renderGridView = () => {
    const projectsToRender = getFilteredAndSortedProjects();

    return (
      <Grid container spacing={3}>
        {projectsToRender.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {project.description}
                    </Typography>
                  </Box>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setActionAnchor(e.currentTarget);
                      setSelectedProject(project);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                {/* Status and priority chips removed as requested */}
                {/* <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={project.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                  <Chip 
                    label={project.priority.toUpperCase()}
                    color={getPriorityColor(project.priority)}
                    size="small"
                    variant="outlined"
                  />
                </Box> */}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress: {project.progress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {/* Team avatar group removed as requested */}
                  {/* <Box>
                    <Typography variant="caption" color="text.secondary">
                      Team
                    </Typography>
                    <AvatarGroup max={3} sx={{ mt: 0.5 }}>
                      {project.team.map((member) => (
                        <Avatar 
                          key={member.id}
                          src={member.avatar}
                          sx={{ width: 24, height: 24 }}
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Box> */}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTableView = () => {
    const projectsToRender = getFilteredAndSortedProjects();

    return (
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
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectsToRender.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.projectType}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{project.clientName}</TableCell>
                <TableCell>
                  <Chip 
                    label={project.status.replace('_', ' ')}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ width: 60, height: 6 }}
                    />
                    <Typography variant="body2">{project.progress}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <AvatarGroup max={3}>
                    {project.team.map((member) => (
                      <Avatar 
                        key={member.id}
                        src={member.avatar}
                        sx={{ width: 28, height: 28 }}
                        title={member.name}
                      />
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell>
                  {new Date(project.timeline.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setActionAnchor(e.currentTarget);
                      setSelectedProject(project);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading projects...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with filters and search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="awaiting-feedback">Awaiting Feedback</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Project list */}
      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      {/* Empty state */}
      {getFilteredAndSortedProjects().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user?.role === 'client' 
              ? "You don't have any projects yet. Request your first project!"
              : "No projects match your current filters."
            }
          </Typography>
          <PermissionGate allowedRoles={['client', 'admin']}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
              sx={{ mt: 2 }}
            >
              {user?.role === 'client' ? 'Request Project' : 'Create Project'}
            </Button>
          </PermissionGate>
        </Box>
      )}

      {/* Floating Action Button */}
      <PermissionGate allowedRoles={['client', 'admin']}>
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setShowCreateForm(true)}
        >
          <AddIcon />
        </Fab>
      </PermissionGate>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={() => setActionAnchor(null)}
      >
        <MenuItem onClick={() => handleProjectAction(selectedProject, 'view')}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <PermissionGate allowedRoles={['admin']}>
          <MenuItem onClick={() => handleProjectAction(selectedProject, 'edit')}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Project
          </MenuItem>
        </PermissionGate>
        
        <MenuItem onClick={() => handleProjectAction(selectedProject, 'status')}>
          <CommentIcon sx={{ mr: 1 }} />
          Change Status
        </MenuItem>
        
        <PermissionGate allowedRoles={['admin']}>
          <MenuItem onClick={() => handleProjectAction(selectedProject, 'delete')}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Project
          </MenuItem>
        </PermissionGate>
      </Menu>

      {/* Project Creation Form */}
      <ProjectCreationForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateProject}
        loading={loading}
      />

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)}>
        <DialogTitle>Change Project Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="awaiting-feedback">Awaiting Feedback</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <PermissionGate allowedRoles={['admin']}>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </PermissionGate>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment (Optional)"
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            placeholder="Add a comment about this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleStatusChange}
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Details Dialog */}
      <ProjectDetails
        project={selectedProjectForDetails}
        open={showProjectDetails}
        onClose={() => {
          setShowProjectDetails(false);
          setSelectedProjectForDetails(null);
        }}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />
    </Box>
  );
};

export default ProjectList;