import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  Button
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Assignment as MilestoneIcon,
  Folder as FileIcon,
  Info as OverviewIcon,
  Timeline as TimelineIcon,
  Group as TeamIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import firebaseService from '../services/firebase/firebaseService';
import MilestoneList from '../components/milestones/MilestoneList';
import FileManager from '../components/files/FileManager';
import { theme } from './dashboardStyles';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(parseInt(searchParams.get('tab') || '0'));
  const [anchorEl, setAnchorEl] = useState(null);

  // Load project data
  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectData = await firebaseService.getProject(projectId);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      setProject(projectData);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update URL parameter
    if (newValue === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newValue.toString() });
    }
  };

  // Handle menu actions
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'in-production': 'primary',
      'in-review': 'warning',
      'completed': 'success',
      'on-hold': 'error',
      'pending': 'default'
    };
    return colors[status] || 'default';
  };

  // Check if user can edit project
  const canEditProject = user?.role === 'admin' || user?.role === 'staff';

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header Skeleton */}
        <Box mb={3}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width="60%" height={40} />
        </Box>
        
        {/* Project Info Skeleton */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="rectangular" height={200} />
        </Paper>
        
        {/* Tabs Skeleton */}
        <Skeleton variant="rectangular" height={48} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button onClick={handleBack}>
            Back to Dashboard
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={handleBack}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <BackIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary">
          {project.name}
        </Typography>
      </Breadcrumbs>

      {/* Project Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {project.projectType || 'Video Project'}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={project.status?.replace('-', ' ') || 'Active'}
                color={getStatusColor(project.status)}
                size="medium"
              />
              <Typography variant="body2" color="text.secondary">
                Client: {project.client}
              </Typography>
              {project.nextMilestone && (
                <Typography variant="body2" color="text.secondary">
                  Next: {project.nextMilestone}
                </Typography>
              )}
            </Box>
          </Box>

          {canEditProject && (
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          )}
        </Box>

        {/* Project Progress */}
        {project.progress !== undefined && (
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                Overall Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Project Team */}
        {project.team && project.team.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Team
            </Typography>
            <AvatarGroup max={6}>
              {project.team.map((member, index) => (
                <Avatar
                  key={index}
                  alt={member.name}
                  src={member.avatar}
                  sx={{ width: 32, height: 32 }}
                >
                  {member.name?.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Overview"
            icon={<OverviewIcon />}
            iconPosition="start"
          />
          <Tab
            label="Milestones"
            icon={<MilestoneIcon />}
            iconPosition="start"
          />
          <Tab
            label="Files"
            icon={<FileIcon />}
            iconPosition="start"
          />
          <Tab
            label="Timeline"
            icon={<TimelineIcon />}
            iconPosition="start"
          />
          <Tab
            label="Team"
            icon={<TeamIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Details
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Project Type
                      </Typography>
                      <Typography variant="body1">
                        {project.projectType || 'Video Production'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Client
                      </Typography>
                      <Typography variant="body1">
                        {project.client}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={project.status?.replace('-', ' ') || 'Active'}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </Box>
                    {project.deliverables && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Deliverables
                        </Typography>
                        {project.deliverables.map((deliverable, index) => (
                          <Chip
                            key={index}
                            label={deliverable}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activity feed will be implemented here
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Milestones Tab */}
        {activeTab === 1 && (
          <MilestoneList
            projectId={projectId}
            onMilestoneUpdate={loadProject}
          />
        )}

        {/* Files Tab */}
        {activeTab === 2 && (
          <FileManager
            projectId={projectId}
            title="Project Files"
            showTabs={false}
            allowUpload={true}
            allowDelete={true}
          />
        )}

        {/* Timeline Tab */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Timeline view will be implemented here
            </Typography>
          </Paper>
        )}

        {/* Team Tab */}
        {activeTab === 4 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team management interface will be implemented here
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Project Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ScheduleIcon sx={{ mr: 1, fontSize: 20 }} />
          Update Timeline
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectDetail;