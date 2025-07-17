import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Paper,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  VideoLibrary as VideoIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  Message as MessageIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';
import RoleBasedNavigation from '../navigation/RoleBasedNavigation';
import RoleBasedButton from '../common/RoleBasedButton';
import { useRoleBasedData, useRoleBasedUI } from '../../hooks/useRoleBasedData';
import { StatsCard } from '../DashboardComponents';
import { styles } from '../../pages/dashboardStyles';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');

  // Use role-based hooks
  const { uiConfig } = useRoleBasedUI();
  const { data: filteredProjects, permissions } = useRoleBasedData(projects, 'projects');

  useEffect(() => {
    // TODO: Load client-specific data
    // For now, using mock data
    setTimeout(() => {
      setProjects([
        {
          id: 1,
          name: 'Corporate Brand Video',
          status: 'in_progress',
          progress: 65,
          dueDate: '2024-08-15',
          team: ['John D.', 'Sarah M.']
        },
        {
          id: 2,
          name: 'Product Demo Series',
          status: 'review',
          progress: 90,
          dueDate: '2024-08-10',
          team: ['Mike R.', 'Lisa K.']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'primary';
      case 'review': return 'warning';
      case 'completed': return 'success';
      case 'planning': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading your projects...</Typography>
      </Box>
    );
  }

  const drawerWidth = 280;

  const drawer = (
    <RoleBasedNavigation 
      activeItem={activeNavItem}
      onMenuItemClick={setActiveNavItem}
    />
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, mb: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {uiConfig.dashboardTitle || 'Dashboard'}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome back, {user?.name}!
          </Typography>
          {user?.clientProfile?.company && (
            <Typography variant="body2" color="text.secondary">
              {user.clientProfile.company}
            </Typography>
          )}
        </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={VideoIcon}
            title="Active Projects"
            value={projects.length}
            statKey="activeProjects"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={ScheduleIcon}
            title="Pending Review"
            value={projects.filter(p => p.status === 'review' || p.status === 'awaiting-feedback').length}
            statKey="pendingApprovals"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={TrendingIcon}
            title="Avg Progress"
            value={`${Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) || 0}%`}
            statKey="avgProgress"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={MessageIcon}
            title="New Messages"
            value={3}
            statKey="newMessages"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Active Projects */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Your Projects ({filteredProjects.length})
                </Typography>
                <RoleBasedButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  allowedRoles={['client']}
                  onClick={() => console.log('Request new project')}
                >
                  Request Project
                </RoleBasedButton>
              </Box>
              
              {filteredProjects.map((project) => (
                <Card key={project.id} variant="outlined" sx={{ mb: 2, width: '500px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {project.name}
                        </Typography>
                        <Chip 
                          label={getStatusText(project.status)}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<PlayIcon />}
                        size="small"
                      >
                        View
                      </Button>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: {project.progress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team: {project.team.join(', ')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Recent Updates */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Updates
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <VideoIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="First draft ready for review"
                    secondary="Corporate Brand Video • 2 hours ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <MessageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Client feedback received"
                    secondary="Product Demo Series • 1 day ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <ScheduleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Milestone completed"
                    secondary="Script finalization • 2 days ago"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  fullWidth
                >
                  Message Team
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VideoIcon />}
                  fullWidth
                >
                  View Assets
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  fullWidth
                >
                  Schedule Review
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Client Profile Info */}
      {user?.clientProfile && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Profile Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Company:</strong> {user.clientProfile.company}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Industry:</strong> {user.clientProfile.industry}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Project Types:</strong> {user.clientProfile.projectTypes?.join(', ')}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Preferred Timeline:</strong> {user.clientProfile.timeline}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
      </Box>
    </Box>
  );
};

export default ClientDashboard;