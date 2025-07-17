import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Assignment as MilestoneIcon,
  Folder as FileIcon,
  Info as OverviewIcon,
  Timeline as TimelineIcon,
  Group as TeamIcon,
  AttachMoney as BudgetIcon,
  CalendarToday as CalendarIcon,
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  CloudDownload as DownloadIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  History as HistoryIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import firebaseService from '../services/firebase/firebaseService';
import { getRoleBasedData } from '../data/mockData';
import FileCategoryTabs from '../components/files/FileCategoryTabs';
import LoadingSpinner from '../components/LoadingSpinner';
import TimelineManager from '../components/Admin/TimelineManager';
import { theme, styles } from './dashboardStyles';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(parseInt(searchParams.get('tab') || '0'));
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get dashboard data for layout
      const dashboardData = await firebaseService.getDashboardData(user.role, user.uid);
      
      // Ensure user data is from the authenticated user
      const finalData = {
        ...dashboardData,
        user: {
          ...dashboardData.user,
          name: user.name || dashboardData.user?.name,
          company: user.company || dashboardData.user?.company,
          email: user.email || dashboardData.user?.email,
          avatar: user.avatar || dashboardData.user?.avatar
        }
      };
      
      setData(finalData);
      
      // Import services to get the project and milestones
      const { default: projectManagementService } = await import('../services/projectManagementService');
      const { default: milestoneService } = await import('../services/milestoneService');
      
      // Get the specific project and its milestones
      const [projectData, projectMilestones] = await Promise.all([
        projectManagementService.getProject(projectId),
        milestoneService.getProjectMilestones(projectId)
      ]);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      // Calculate next milestone
      const upcomingMilestones = projectMilestones
        .filter(m => m.status !== 'completed' && m.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      const nextMilestone = upcomingMilestones[0];
      
      // Add any missing fields that the UI expects
      const enrichedProject = {
        ...projectData,
        projectType: projectData.projectType || 'Video Production',
        description: projectData.description || `${projectData.name} for ${projectData.client}`,
        timeline: projectData.timeline || {
          startDate: projectData.createdAt,
          endDate: projectData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          estimatedHours: projectData.estimatedHours || 40
        },
        files: projectData.files || [],
        milestones: projectMilestones || [],
        nextMilestone: nextMilestone ? formatDate(nextMilestone.dueDate) : null,
        nextMilestoneDetails: nextMilestone ? {
          title: nextMilestone.title,
          status: nextMilestone.status || 'pending'
        } : null,
        fileActivity: {
          recentCount: projectData.fileCount || 0,
          lastUpload: projectData.lastFileUpload || 'No files uploaded',
          types: ['Video', 'Images', 'Documents']
        },
        team: projectData.team || [],
        budget: projectData.budget || null,
        deliverables: projectData.deliverables || ['Final Video', 'Raw Footage', 'Project Files'],
        progress: projectData.progress || 0
      };
      
      setProject(enrichedProject);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newValue.toString() });
    }
  };


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  const getStatusIcon = (status) => {
    const icons = {
      'todo': ScheduleIcon,
      'in-progress': PlayIcon,
      'awaiting-feedback': WarningIcon,
      'completed': CheckIcon
    };
    return icons[status] || ScheduleIcon;
  };

  const canEditProject = user?.role === 'admin' || user?.role === 'staff';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  if (loading || !data) {
    return <LoadingSpinner message="Loading project..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/projects')}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            Back to Projects
          </Button>
        </Box>
        
        <Alert severity="error" action={
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
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

  const StatusIcon = getStatusIcon(project.status);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Back Button */}
              <Box sx={{ mb: 2 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/projects')}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  Back to Projects
                </Button>
              </Box>

              {/* Project Header */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <StatusIcon sx={{ fontSize: 28, color: `${getStatusColor(project.status)}.main` }} />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {project.name}
                  </Typography>
                </Stack>
                
                <Typography variant="body1" color="text.secondary">
                  {project.description || project.projectType || 'Video Production Project'}
                </Typography>
              </Box>

              {/* Project Status */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                  <Box flex={1}>
                    
                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                      <Chip
                        label={
                          project.status === 'todo' ? 'To Do' :
                          project.status === 'in-progress' ? 'In Progress' :
                          project.status === 'awaiting-feedback' ? 'Awaiting Feedback' :
                          project.status === 'completed' ? 'Completed' :
                          project.status?.replace('-', ' ') || 'Active'
                        }
                        color={getStatusColor(project.status)}
                        size="medium"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      {project.priority && (
                        <Chip
                          icon={<StarIcon />}
                          label={`${project.priority} priority`}
                          color={project.priority === 'high' ? 'error' : project.priority === 'medium' ? 'warning' : 'default'}
                          variant="outlined"
                          size="medium"
                        />
                      )}
                    </Stack>
                  </Box>

                  {canEditProject && (
                    <IconButton onClick={handleMenuOpen}>
                      <MoreIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Project Progress */}
                <Box mb={4}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    Overall Progress
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      width: '25%',
                      my: 2,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: project.progress >= 90 ? '#4caf50' : // Green for 90%+
                                       project.progress >= 70 ? '#8bc34a' : // Light green for 70-89%
                                       project.progress >= 50 ? '#ffc107' : // Amber for 50-69%
                                       project.progress >= 30 ? '#ff9800' : // Orange for 30-49%
                                       '#f44336' // Red for <30%
                      }
                    }}
                  />
                    <Typography variant="h6" color="primary.main" fontWeight={600}>
                      {project.progress}%
                    </Typography>
                  </Box>
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={3}>
                  {project.timeline && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                        <CalendarIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          {calculateTimeRemaining(project.timeline.endDate)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Until Completion
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {project.budget && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                        <BudgetIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          {formatCurrency(project.budget.actual || project.budget.estimated)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Budget {project.budget.actual ? 'Spent' : 'Estimated'}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {project.fileActivity && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                        <FileIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          {project.fileActivity.recentCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Project Files
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                </Grid>
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
                  <Tab label="Overview" icon={<OverviewIcon />} iconPosition="start" />
                  <Tab label="Milestones" icon={<MilestoneIcon />} iconPosition="start" />
                  <Tab label="Files" icon={<FileIcon />} iconPosition="start" />
                  <Tab label="Team" icon={<TeamIcon />} iconPosition="start" />
                </Tabs>
              </Paper>

              {/* Tab Content */}
              <Box>
                {/* Overview Tab */}
                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    {/* Project Details */}
                    <Grid item xs={12} md={8}>
                      <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h5" gutterBottom>
                            Project Information
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1" color="text.secondary">
                                Project Type
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {project.projectType || 'Video Production'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1" color="text.secondary">
                                Client
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {project.client}
                              </Typography>
                            </Grid>
                            {project.genre && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" color="text.secondary">
                                  Genre
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {project.genre}
                                </Typography>
                              </Grid>
                            )}
                            {project.timeline && (
                              <>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle1" color="text.secondary">
                                    Start Date
                                  </Typography>
                                  <Typography variant="body1" sx={{ mb: 2 }}>
                                    {formatDate(project.timeline.startDate)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle1" color="text.secondary">
                                    End Date
                                  </Typography>
                                  <Typography variant="body1" sx={{ mb: 2 }}>
                                    {formatDate(project.timeline.endDate)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle1" color="text.secondary">
                                    Estimated Hours
                                  </Typography>
                                  <Typography variant="body1" sx={{ mb: 2 }}>
                                    {project.timeline.estimatedHours} hours
                                  </Typography>
                                </Grid>
                              </>
                            )}
                          </Grid>
                          
                          {project.deliverables && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                Deliverables
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {project.deliverables.map((deliverable, index) => (
                                  <Chip
                                    key={index}
                                    label={deliverable}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </CardContent>
                      </Card>

                      {/* Budget Information */}
                      {project.budget && (
                        <Card sx={{ mb: 3 }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>
                              Budget Information
                            </Typography>
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1" color="text.secondary">
                                  Estimated Budget
                                </Typography>
                                <Typography variant="h6" color="primary.main">
                                  {formatCurrency(project.budget.estimated)}
                                </Typography>
                              </Grid>
                              {project.budget.actual && (
                                <Grid item xs={12} sm={4}>
                                  <Typography variant="subtitle1" color="text.secondary">
                                    Actual Spent
                                  </Typography>
                                  <Typography variant="h6" color="success.main">
                                    {formatCurrency(project.budget.actual)}
                                  </Typography>
                                </Grid>
                              )}
                              {project.budget.estimated && project.budget.actual && (
                                <Grid item xs={12} sm={4}>
                                  <Typography variant="subtitle1" color="text.secondary">
                                    Remaining
                                  </Typography>
                                  <Typography variant="h6" color="info.main">
                                    {formatCurrency(project.budget.estimated - project.budget.actual)}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recent Activity */}
                      <Card>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h5" gutterBottom>
                            Recent Activity
                          </Typography>
                          <List>
                            {project.fileActivity?.lastUpload && (
                              <ListItem>
                                <ListItemIcon>
                                  <FileIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Files uploaded"
                                  secondary={`${project.fileActivity.recentCount} files • ${project.fileActivity.lastUpload}`}
                                />
                              </ListItem>
                            )}
                            {project.nextMilestoneDetails && (
                              <ListItem>
                                <ListItemIcon>
                                  <MilestoneIcon color="warning" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={project.nextMilestoneDetails.title}
                                  secondary={`Due ${project.nextMilestone} • ${project.nextMilestoneDetails.status.replace('_', ' ')}`}
                                />
                              </ListItem>
                            )}
                            <ListItem>
                              <ListItemIcon>
                                <TrendingIcon color="success" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Progress updated"
                                secondary={`${project.progress}% complete • 2 hours ago`}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                      {/* Team */}
                      <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h5" gutterBottom>
                            Project Team
                          </Typography>
                          {project.team && project.team.length > 0 ? (
                            <Stack spacing={2}>
                              {project.team.map((member, index) => (
                                <Box key={index} display="flex" alignItems="center" spacing={2}>
                                  <Avatar 
                                    src={member.avatar} 
                                    sx={{ width: 40, height: 40, mr: 2 }}
                                  >
                                    {member.name?.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                      {member.name || `Team Member ${index + 1}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {member.role || 'Team Member'}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No team members assigned
                            </Typography>
                          )}
                        </CardContent>
                      </Card>

                      {/* Next Milestone */}
                      {project.nextMilestoneDetails && (
                        <Card sx={{ mb: 3 }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>
                              Next Milestone
                            </Typography>
                            <Box>
                              <Typography variant="body1" fontWeight={500} gutterBottom>
                                {project.nextMilestoneDetails.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Due: {project.nextMilestone}
                              </Typography>
                              <Chip
                                label={
                                  project.nextMilestoneDetails.status === 'pending' ? 'Pending' :
                                  project.nextMilestoneDetails.status === 'in-progress' ? 'In Progress' :
                                  project.nextMilestoneDetails.status === 'completed' ? 'Completed' :
                                  project.nextMilestoneDetails.status === 'overdue' ? 'Overdue' :
                                  project.nextMilestoneDetails.status.replace('_', ' ')
                                }
                                size="small"
                                color={
                                  project.nextMilestoneDetails.status === 'pending' ? 'warning' :
                                  project.nextMilestoneDetails.status === 'in-progress' ? 'info' :
                                  project.nextMilestoneDetails.status === 'completed' ? 'success' :
                                  project.nextMilestoneDetails.status === 'overdue' ? 'error' :
                                  'default'
                                }
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {/* File Summary */}
                      {project.fileActivity && (
                        <Card>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>
                              File Summary
                            </Typography>
                            <Stack spacing={2}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Total Files</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {project.fileActivity.recentCount}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Last Upload</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {project.fileActivity.lastUpload}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" gutterBottom>File Types</Typography>
                                <Stack direction="row" spacing={1}>
                                  {project.fileActivity.types?.map((type, index) => (
                                    <Chip key={index} label={type} size="small" variant="outlined" />
                                  ))}
                                </Stack>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      )}
                    </Grid>
                  </Grid>
                )}

                {/* Milestones Tab */}
                {activeTab === 1 && (
                  <TimelineManager 
                    projectId={projectId}
                    projectName={project.name}
                    onClose={() => {}} // No close button needed since it's in a tab
                    showHeader={false} // Hide header since we're in a tab
                  />
                )}

                {/* Files Tab */}
                {activeTab === 2 && (
                  <FileCategoryTabs
                    projectId={projectId}
                    allowUpload={user?.role === 'admin' || user?.role === 'staff'}
                    allowDelete={user?.role === 'admin'}
                    allowEdit={user?.role === 'admin' || user?.role === 'staff'}
                    defaultCategory="videos"
                    onFileAction={(action, fileOrResults) => {
                      console.log('File action:', action, fileOrResults);
                      // Handle file actions like upload, download, edit, etc.
                    }}
                  />
                )}

                {/* Team Tab */}
                {activeTab === 3 && (
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        Project Team
                      </Typography>
                      
                      {/* Assigned User */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          Assigned To
                        </Typography>
                        <Box display="flex" alignItems="center" spacing={2}>
                          <Avatar 
                            src={project.assignedToAvatar} 
                            sx={{ width: 48, height: 48, mr: 2 }}
                          >
                            {project.assignedToName?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {project.assignedToName || 'Unassigned'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {project.assignedToEmail || 'No email'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Primary Contact
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Created By */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          Project Manager
                        </Typography>
                        <Box display="flex" alignItems="center" spacing={2}>
                          <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
                            A
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              Admin
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Project Creator
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created {formatDate(project.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Additional Team Members */}
                      {project.team && project.team.length > 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Additional Team Members
                          </Typography>
                          <Stack spacing={2}>
                            {project.team.map((member, index) => (
                              <Box key={index} display="flex" alignItems="center" spacing={2}>
                                <Avatar 
                                  src={member.avatar} 
                                  sx={{ width: 40, height: 40, mr: 2 }}
                                >
                                  {member.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {member.name || `Team Member ${index + 1}`}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.role || 'Team Member'}
                                  </Typography>
                                  {member.email && (
                                    <Typography variant="caption" color="text.secondary">
                                      {member.email}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {(!project.team || project.team.length === 0) && (
                        <Alert severity="info">
                          No additional team members are assigned to this project.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
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