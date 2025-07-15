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
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as TeamIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  Activity as ActivityIcon,
  Assignment as TaskIcon,
  FilePresent as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';
import PermissionGate from '../common/PermissionGate';
import RoleBasedButton from '../common/RoleBasedButton';
import ProjectCollaboration from './ProjectCollaboration';
import TeamAssignmentFlow from './TeamAssignmentFlow';

const ProjectDetails = ({ project, open, onClose, onUpdateProject, onDeleteProject }) => {
  const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [showTeamAssignment, setShowTeamAssignment] = useState(false);
  const [projectData, setProjectData] = useState(project);

  useEffect(() => {
    setProjectData(project);
  }, [project]);

  const getStatusColor = (status) => {
    const colors = {
      planning: 'info',
      in_progress: 'primary',
      review: 'warning',
      completed: 'success',
      cancelled: 'error'
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

  const handleProjectAction = (action) => {
    setActionAnchor(null);
    switch (action) {
      case 'edit':
        console.log('Edit project:', projectData.id);
        break;
      case 'team':
        setShowTeamAssignment(true);
        break;
      case 'delete':
        if (onDeleteProject) {
          onDeleteProject(projectData.id);
        }
        onClose();
        break;
      default:
        break;
    }
  };

  const handleUpdateProject = (updatedProject) => {
    setProjectData(updatedProject);
    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }
  };

  const handleAssignStaff = async (projectId, staffIds) => {
    try {
      console.log('Assigning staff:', staffIds, 'to project:', projectId);
      // TODO: Call API to assign staff
      const updatedProject = {
        ...projectData,
        assignedStaff: [...(projectData.assignedStaff || []), ...staffIds]
      };
      handleUpdateProject(updatedProject);
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  const handleRemoveStaff = async (projectId, staffIds) => {
    try {
      console.log('Removing staff:', staffIds, 'from project:', projectId);
      // TODO: Call API to remove staff
      const updatedProject = {
        ...projectData,
        assignedStaff: (projectData.assignedStaff || []).filter(id => !staffIds.includes(id))
      };
      handleUpdateProject(updatedProject);
    } catch (error) {
      console.error('Failed to remove staff:', error);
    }
  };

  const renderOverview = () => (
    <Box>
      <Grid container spacing={3}>
        {/* Project Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {projectData.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {projectData.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={projectData.status?.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(projectData.status)}
                />
                <Chip 
                  label={projectData.priority?.toUpperCase()}
                  color={getPriorityColor(projectData.priority)}
                  variant="outlined"
                />
                {projectData.projectType && (
                  <Chip 
                    label={projectData.projectType}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            
            <PermissionGate allowedRoles={['admin', 'staff']}>
              <IconButton
                onClick={(e) => setActionAnchor(e.currentTarget)}
              >
                <MoreIcon />
              </IconButton>
            </PermissionGate>
          </Box>
        </Grid>

        {/* Progress */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={projectData.progress || 0} 
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" fontWeight="bold">
                  {projectData.progress || 0}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {projectData.progress >= 100 ? 'Project completed!' : 
                 projectData.progress >= 75 ? 'Nearly complete' :
                 projectData.progress >= 50 ? 'Making good progress' :
                 projectData.progress >= 25 ? 'Getting started' : 'Just beginning'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Timeline
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Start Date"
                    secondary={projectData.timeline?.startDate ? 
                      new Date(projectData.timeline.startDate).toLocaleDateString() : 'Not set'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="End Date"
                    secondary={projectData.timeline?.endDate ? 
                      new Date(projectData.timeline.endDate).toLocaleDateString() : 'Not set'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Estimated Hours"
                    secondary={`${projectData.timeline?.estimatedHours || 0} hours`}
                  />
                </ListItem>
                {projectData.timeline?.actualHours && (
                  <ListItem>
                    <ListItemText
                      primary="Actual Hours"
                      secondary={`${projectData.timeline.actualHours} hours`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Budget
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Estimated Budget"
                    secondary={`$${projectData.budget?.estimated?.toLocaleString() || 0} ${projectData.budget?.currency || 'USD'}`}
                  />
                </ListItem>
                {projectData.budget?.actual && (
                  <ListItem>
                    <ListItemText
                      primary="Actual Spent"
                      secondary={`$${projectData.budget.actual.toLocaleString()} ${projectData.budget.currency || 'USD'}`}
                    />
                  </ListItem>
                )}
                {projectData.budget?.estimated && projectData.budget?.actual && (
                  <ListItem>
                    <ListItemText
                      primary="Remaining"
                      secondary={`$${(projectData.budget.estimated - projectData.budget.actual).toLocaleString()} ${projectData.budget.currency || 'USD'}`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Team */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <TeamIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Team Members
                </Typography>
                <PermissionGate allowedRoles={['admin']}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TeamIcon />}
                    onClick={() => setShowTeamAssignment(true)}
                  >
                    Manage Team
                  </Button>
                </PermissionGate>
              </Box>
              
              {projectData.team && projectData.team.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {projectData.team.map((member) => (
                    <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={member.avatar} sx={{ width: 32, height: 32 }}>
                        {member.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{member.name}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No team members assigned yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Client Information */}
        {projectData.clientName && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Client Information
                </Typography>
                <Typography variant="body1">
                  {projectData.clientName}
                </Typography>
                {projectData.communications?.preferredContactMethod && (
                  <Typography variant="body2" color="text.secondary">
                    Preferred contact: {projectData.communications.preferredContactMethod}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  if (!projectData) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Project Details</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Overview" />
            <Tab 
              label={
                <Badge badgeContent={0} color="primary">
                  Collaboration
                </Badge>
              } 
            />
            <Tab label="Files & Assets" />
            <Tab label="Tasks" />
          </Tabs>
          
          <Box sx={{ p: 3, maxHeight: 600, overflow: 'auto' }}>
            {tabValue === 0 && renderOverview()}
            {tabValue === 1 && (
              <ProjectCollaboration 
                project={projectData} 
                onUpdateProject={handleUpdateProject}
              />
            )}
            {tabValue === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Files & Assets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  File management coming soon.
                </Typography>
              </Box>
            )}
            {tabValue === 3 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TaskIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Tasks & Milestones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Task management coming soon.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={() => setActionAnchor(null)}
      >
        <PermissionGate allowedRoles={['admin']}>
          <MenuItem onClick={() => handleProjectAction('edit')}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Project
          </MenuItem>
        </PermissionGate>
        
        <PermissionGate allowedRoles={['admin']}>
          <MenuItem onClick={() => handleProjectAction('team')}>
            <TeamIcon sx={{ mr: 1 }} />
            Manage Team
          </MenuItem>
        </PermissionGate>
        
        <PermissionGate allowedRoles={['admin']}>
          <MenuItem onClick={() => handleProjectAction('delete')}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Project
          </MenuItem>
        </PermissionGate>
      </Menu>

      {/* Team Assignment Flow */}
      <TeamAssignmentFlow
        open={showTeamAssignment}
        onClose={() => setShowTeamAssignment(false)}
        project={projectData}
        onAssignStaff={handleAssignStaff}
        onRemoveStaff={handleRemoveStaff}
      />
    </>
  );
};

export default ProjectDetails;