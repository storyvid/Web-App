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
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  VideoLibrary as VideoIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  Message as MessageIcon,
  Notifications as NotificationIcon,
  Add as AddIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {user?.clientProfile?.company || 'Your Projects'} Dashboard
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VideoIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {projects.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {projects.filter(p => p.status === 'review').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Pending Review
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) || 0}%
                  </Typography>
                  <Typography color="text.secondary">
                    Avg Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MessageIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">3</Typography>
                  <Typography color="text.secondary">
                    New Messages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Active Projects */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Your Projects
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  New Project
                </Button>
              </Box>
              
              {projects.map((project) => (
                <Card key={project.id} variant="outlined" sx={{ mb: 2 }}>
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
  );
};

export default ClientDashboard;