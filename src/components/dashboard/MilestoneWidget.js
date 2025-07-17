import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Feedback as FeedbackIcon,
  Warning as WarningIcon,
  PlayArrow as PlayIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import firebaseService from '../../services/firebase/firebaseService';

const MilestoneWidget = ({ 
  projectId = null,
  title = "Upcoming Milestones",
  maxItems = 5,
  showProjectName = true,
  compact = false,
  onMilestoneClick = null
}) => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load milestones
  useEffect(() => {
    loadMilestones();
  }, [projectId, user?.uid]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (projectId) {
        // Get milestones for specific project
        data = await firebaseService.getMilestones(projectId);
      } else {
        // Get user's milestones across all projects
        const userProjects = await firebaseService.getUserProjects(user?.uid);
        const allMilestones = [];
        
        for (const project of userProjects) {
          const projectMilestones = await firebaseService.getMilestones(project.id);
          // Add project name to each milestone
          projectMilestones.forEach(milestone => {
            milestone.projectName = project.name;
          });
          allMilestones.push(...projectMilestones);
        }
        
        // Sort by due date and filter for upcoming/in-progress
        data = allMilestones
          .filter(m => m.status !== 'completed')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, maxItems);
      }
      
      setMilestones(data);
    } catch (err) {
      console.error('Error loading milestones:', err);
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  // Handle milestone status change
  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      await firebaseService.updateMilestone(milestoneId, { status: newStatus });
      // Refresh milestones
      loadMilestones();
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Failed to update milestone');
    }
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'default',
        icon: ScheduleIcon,
        label: 'Pending',
        bgColor: '#f5f5f5'
      },
      in_progress: {
        color: 'primary',
        icon: PlayIcon,
        label: 'In Progress',
        bgColor: '#e3f2fd'
      },
      in_review: {
        color: 'warning',
        icon: FeedbackIcon,
        label: 'In Review',
        bgColor: '#fff3e0'
      },
      revision_requested: {
        color: 'error',
        icon: WarningIcon,
        label: 'Revision Requested',
        bgColor: '#ffebee'
      },
      completed: {
        color: 'success',
        icon: CheckCircleIcon,
        label: 'Completed',
        bgColor: '#e8f5e8'
      }
    };
    return configs[status] || configs.pending;
  };

  // Check if milestone is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  // Format due date
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Due today', urgent: true };
    if (diffDays === 1) return { text: 'Due tomorrow', urgent: true };
    if (diffDays === -1) return { text: 'Due yesterday', overdue: true };
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, overdue: true };
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, urgent: true };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, soon: true };
    
    return { text: date.toLocaleDateString(), normal: true };
  };

  // Handle milestone click
  const handleMilestoneClick = (milestone) => {
    if (onMilestoneClick) {
      onMilestoneClick(milestone);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader 
          title={
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
          }
        />
        <CardContent>
          {[1, 2, 3].map((i) => (
            <Box key={i} display="flex" alignItems="center" mb={2}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box flex={1}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader 
          title={
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
          }
        />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader 
          title={title}
          avatar={<TrendingIcon color="action" />}
        />
        <CardContent>
          <Box textAlign="center" py={3}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              All caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No upcoming milestones at this time
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title={title}
        avatar={<TrendingIcon color="primary" />}
        action={
          <Tooltip title="View all milestones">
            <IconButton size="small">
              <MoreIcon />
            </IconButton>
          </Tooltip>
        }
      />
      
      <CardContent sx={{ pt: 0 }}>
        <List disablePadding>
          {milestones.map((milestone, index) => {
            const statusConfig = getStatusConfig(milestone.status);
            const StatusIcon = statusConfig.icon;
            const dueDateInfo = formatDueDate(milestone.dueDate);
            
            return (
              <ListItem
                key={milestone.id}
                disablePadding
                sx={{
                  mb: index < milestones.length - 1 ? 1 : 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: dueDateInfo.overdue ? '#ffebee' : 
                                 dueDateInfo.urgent ? '#fff3e0' : 'background.paper',
                  cursor: onMilestoneClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: onMilestoneClick ? 'action.hover' : 'inherit'
                  }
                }}
                onClick={() => handleMilestoneClick(milestone)}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Avatar
                    sx={{
                      backgroundColor: statusConfig.color === 'default' ? 'grey.300' : `${statusConfig.color}.main`,
                      width: 40,
                      height: 40
                    }}
                  >
                    <StatusIcon />
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {milestone.title}
                      </Typography>
                      {showProjectName && milestone.projectName && (
                        <Typography variant="caption" color="text.secondary">
                          {milestone.projectName}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box mt={0.5}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Chip
                          label={statusConfig.label}
                          size="small"
                          color={statusConfig.color}
                        />
                        <Typography
                          variant="caption"
                          color={dueDateInfo.overdue ? 'error' : 
                                dueDateInfo.urgent ? 'warning.main' : 'text.secondary'}
                          fontWeight={dueDateInfo.overdue || dueDateInfo.urgent ? 600 : 400}
                        >
                          {dueDateInfo.text}
                        </Typography>
                      </Box>
                      
                      {milestone.progress !== undefined && milestone.status === 'in_progress' && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={milestone.progress}
                            sx={{ flex: 1, height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {milestone.progress}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />

                {/* Quick Actions */}
                {user?.role === 'client' && milestone.status === 'in_review' && (
                  <Box display="flex" gap={0.5} ml={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(milestone.id, 'completed');
                      }}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      ✓
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(milestone.id, 'revision_requested');
                      }}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      ↻
                    </Button>
                  </Box>
                )}
              </ListItem>
            );
          })}
        </List>
      </CardContent>

      {milestones.length >= maxItems && (
        <CardActions>
          <Button size="small" fullWidth>
            View All Milestones
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default MilestoneWidget;