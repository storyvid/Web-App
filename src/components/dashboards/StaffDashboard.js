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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Schedule as TimeIcon,
  Group as TeamIcon,
  TrendingUp as PerformanceIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [assignments, setAssignments] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load staff-specific data
    setTimeout(() => {
      setAssignments([
        {
          id: 1,
          projectName: 'Corporate Brand Video',
          clientName: 'Tech Innovators Inc',
          task: 'Video Editing',
          priority: 'high',
          dueDate: '2024-08-15',
          progress: 75,
          estimatedHours: 8,
          loggedHours: 6
        },
        {
          id: 2,
          projectName: 'Product Demo Series',
          clientName: 'StartupCo',
          task: 'Color Grading',
          priority: 'medium',
          dueDate: '2024-08-12',
          progress: 40,
          estimatedHours: 4,
          loggedHours: 1.5
        }
      ]);
      
      setTimeEntries([
        { date: '2024-08-08', project: 'Corporate Brand Video', hours: 3.5, task: 'Video Editing' },
        { date: '2024-08-08', project: 'Product Demo Series', hours: 1.5, task: 'Color Grading' },
        { date: '2024-08-07', project: 'Corporate Brand Video', hours: 2.5, task: 'Asset Review' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [dispatch]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const totalHoursThisWeek = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const activeProjects = assignments.length;
  const completionRate = Math.round(
    assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading your assignments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {user?.staffProfile?.position || 'Team Member'} Dashboard
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TaskIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {activeProjects}
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
                <TimeIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {totalHoursThisWeek}h
                  </Typography>
                  <Typography color="text.secondary">
                    This Week
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
                <PerformanceIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {completionRate}%
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
                <TeamIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {user?.staffProfile?.availability?.hoursPerWeek || 40}h
                  </Typography>
                  <Typography color="text.secondary">
                    Weekly Capacity
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Assignments */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Assignments
              </Typography>
              
              {assignments.map((assignment) => (
                <Card key={assignment.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {assignment.task}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {assignment.projectName} • {assignment.clientName}
                        </Typography>
                        <Chip 
                          label={assignment.priority.toUpperCase()}
                          color={getPriorityColor(assignment.priority)}
                          size="small"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<PlayIcon />}
                        size="small"
                      >
                        Work
                      </Button>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: {assignment.progress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={assignment.progress} 
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Time: {assignment.loggedHours}h / {assignment.estimatedHours}h
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Time Tracking */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Time Entries
              </Typography>
              <List dense>
                {timeEntries.map((entry, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <TimerIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${entry.hours}h - ${entry.task}`}
                      secondary={`${entry.project} • ${entry.date}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                Log Time
              </Button>
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
                  startIcon={<TimerIcon />}
                  fullWidth
                >
                  Start Timer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TaskIcon />}
                  fullWidth
                >
                  View All Tasks
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CompleteIcon />}
                  fullWidth
                >
                  Mark Complete
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Staff Profile Info */}
      {user?.staffProfile && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Your Profile
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Position:</strong> {user.staffProfile.position}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Experience:</strong> {user.staffProfile.experience}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Skills:</strong> {user.staffProfile.skills?.slice(0, 3).join(', ')}
                {user.staffProfile.skills?.length > 3 && ` +${user.staffProfile.skills.length - 3} more`}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Availability:</strong> {user.staffProfile.availability?.type} 
                ({user.staffProfile.availability?.hoursPerWeek}h/week)
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default StaffDashboard;