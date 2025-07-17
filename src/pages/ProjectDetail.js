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
  ThemeProvider,
  CssBaseline
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
import MilestoneList from '../components/milestones/MilestoneList';
import FileManager from '../components/files/FileManager';
import { Sidebar, Header } from '../components/DashboardComponents';
import LoadingSpinner from '../components/LoadingSpinner';
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
  const [activeMenuItem, setActiveMenuItem] = useState('projects');
  const [mobileOpen, setMobileOpen] = useState(false);

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
      
      // Find the specific project
      const projectData = finalData.projects.find(p => p.id === projectId || p.id === parseInt(projectId));
      
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newValue.toString() });
    }
  };

  const handleMenuItemClick = (menuId) => {
    setActiveMenuItem(menuId);
    
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'assets':
        console.log('Assets page not implemented yet');
        break;
      case 'services':
        console.log('Services page not implemented yet');
        break;
      default:
        break;
    }
  };

  const handleMobileMenuClick = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  const getStatusIcon = (status) => {
    const icons = {
      'in-production': PlayIcon,
      'in-review': WarningIcon,
      'completed': CheckIcon,
      'on-hold': ErrorIcon,
      'pending': ScheduleIcon
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
    return <LoadingSpinner fullScreen message="Loading project..." />;
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={styles.dashboardContainer}>
          <Sidebar 
            activeItem={activeMenuItem} 
            onMenuItemClick={handleMenuItemClick}
            userRole={user?.role || 'client'}
            mobileOpen={mobileOpen}
            onMobileClose={handleMobileClose}
            user={user}
          />
          
          <Box sx={styles.mainContent}>
            <Header 
              user={data.user} 
              notifications={data.notifications}
              onMobileMenuClick={handleMobileMenuClick}
            />
            
            <Box sx={styles.contentWrapper}>
              <Box sx={styles.leftContent}>
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
                
                <Alert severity="error" action={
                  <Button onClick={() => navigate('/projects')}>
                    Back to Projects
                  </Button>
                }>
                  {error}
                </Alert>
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (!project) {
    return null;
  }

  const StatusIcon = getStatusIcon(project.status);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={styles.dashboardContainer}>
        <Sidebar 
          activeItem={activeMenuItem} 
          onMenuItemClick={handleMenuItemClick}
          userRole={user?.role || 'client'}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
          user={user}
        />
        
        <Box sx={styles.mainContent}>
          <Header 
            user={data.user} 
            notifications={data.notifications}
            onMobileMenuClick={handleMobileMenuClick}
          />
          
          <Box sx={styles.contentWrapper}>
            <Box sx={styles.leftContent}>
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
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                      <StatusIcon sx={{ fontSize: 28, color: `${getStatusColor(project.status)}.main` }} />
                      <Typography variant="h3" fontWeight={700}>
                        {project.name}
                      </Typography>
                    </Stack>
                    
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description || project.projectType || 'Video Production Project'}
                    </Typography>
                    
                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                      <Chip
                        label={project.status?.replace('-', ' ') || 'Active'}
                        color={getStatusColor(project.status)}
                        size="medium"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip
                        icon={<BusinessIcon />}
                        label={project.client}
                        variant="outlined"
                        size="medium"
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
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Overall Progress
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={600}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: project.progress >= 90 ? '#4caf50' : // Green for 90%+
                                       project.progress >= 70 ? '#8bc34a' : // Light green for 70-89%
                                       project.progress >= 50 ? '#ffc107' : // Amber for 50-69%
                                       project.progress >= 30 ? '#ff9800' : // Orange for 30-49%
                                       '#f44336' // Red for <30%
                      }
                    }}
                  />
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={3}>
                  {project.timeline && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
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
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
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
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
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
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <TeamIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        {project.team?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team Members
                      </Typography>
                    </Card>
                  </Grid>
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
                  <Tab label="Timeline" icon={<TimelineIcon />} iconPosition="start" />
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
                        <CardContent>
                          <Typography variant="h5" gutterBottom>
                            Project Information
                          </Typography>
                          <Grid container spacing={2}>
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
                          <CardContent>
                            <Typography variant="h5" gutterBottom>
                              Budget Information
                            </Typography>
                            <Grid container spacing={2}>
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
                        <CardContent>
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
                        <CardContent>
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
                          <CardContent>
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
                                label={project.nextMilestoneDetails.status.replace('_', ' ')}
                                size="small"
                                color={project.nextMilestoneDetails.status === 'pending_approval' ? 'warning' : 'default'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {/* File Summary */}
                      {project.fileActivity && (
                        <Card>
                          <CardContent>
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
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Project Timeline
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Timeline visualization will be implemented here
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Team Tab */}
                {activeTab === 4 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Team Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team management interface will be implemented here
                      </Typography>
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
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ProjectDetail;