import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import firebaseService from '../../services/firebase/firebaseService';
import { StatsCard } from '../DashboardComponents';
import { styles } from '../../pages/dashboardStyles';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');

  // Use role-based hooks
  const { uiConfig } = useRoleBasedUI();
  // Note: We're doing our own project filtering in useEffect, so no need for useRoleBasedData filtering
  const permissions = { canView: true, canEdit: true, canDelete: false, canCreate: true };

  // Force refresh mechanism
  useEffect(() => {
    const handleForceRefresh = () => {
      console.log('🔄 Force refresh triggered for ClientDashboard');
      if (user?.uid) {
        loadClientProjects();
      }
    };
    
    window.addEventListener('forceProjectRefresh', handleForceRefresh);
    return () => window.removeEventListener('forceProjectRefresh', handleForceRefresh);
  }, [user?.uid]);

  const loadClientProjects = async () => {
    if (!user?.uid) {
      console.log('🚫 ClientDashboard: No user.uid, skipping project load');
      return;
    }
    
    console.log('📊 ClientDashboard: Loading projects for user:', user.uid);
    setLoading(true);
    try {
      // Fetch projects for this specific client
      const allProjects = await firebaseService.getProjects();
      console.log('📦 ClientDashboard: All projects from Firebase:', allProjects);
      console.log('📦 ClientDashboard: Total projects:', allProjects.length);
      
      const clientProjects = allProjects.filter(project => {
        const matches = project.clientId === user.uid;
        console.log(`🔍 Project "${project.name}": clientId="${project.clientId}" matches user.uid="${user.uid}": ${matches}`);
        return matches;
      });
      
      console.log('✅ ClientDashboard: Filtered client projects:', clientProjects);
      console.log('✅ ClientDashboard: Client project count:', clientProjects.length);
      
      // Detailed analysis of each project before setting state
      clientProjects.forEach((project, index) => {
        console.log(`📋 Project ${index + 1}:`, {
          name: project.name,
          id: project.id,
          status: project.status,
          progress: project.progress,
          hasName: !!project.name,
          hasId: !!project.id,
          hasStatus: !!project.status,
          hasProgress: project.progress !== undefined
        });
      });
      
      setProjects(clientProjects);
    } catch (error) {
      console.error('❌ ClientDashboard: Error loading client projects:', error);
      // Fallback to empty array instead of mock data
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientProjects();
  }, [user?.uid]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'primary';
      case 'review': return 'warning';
      case 'completed': return 'success';
      case 'planning': return 'info';
      case 'service_request': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    if (status === 'service_request') {
      return 'PENDING APPROVAL';
    }
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
                  Your Projects ({projects.length})
                </Typography>
                <RoleBasedButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  allowedRoles={['client']}
                  onClick={() => navigate('/services')}
                >
                  Request Project
                </RoleBasedButton>
              </Box>
              
              {projects.map((project, index) => {
                console.log(`🎨 Rendering project ${index + 1}:`, project.name, project.id);
                return (
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
                        Progress: {project.progress ?? 0}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress ?? 0} 
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team: {project.team ? project.team.join(', ') : 'Not assigned'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                );
              })}
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