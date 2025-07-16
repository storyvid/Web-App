import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  LinearProgress,
  Tooltip,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Feedback as FeedbackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const MilestoneCard = ({ 
  milestone, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onReorder,
  isDragging = false,
  dragHandleProps = {}
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      await onStatusChange(milestone.id, newStatus);
    } catch (error) {
      console.error('Error updating milestone status:', error);
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    onEdit(milestone);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(milestone.id);
    handleMenuClose();
  };

  // Status configuration
  const statusConfig = {
    pending: {
      color: 'default',
      label: 'Pending',
      icon: ScheduleIcon,
      bgColor: '#f5f5f5'
    },
    in_progress: {
      color: 'primary',
      label: 'In Progress',
      icon: ScheduleIcon,
      bgColor: '#e3f2fd'
    },
    in_review: {
      color: 'warning',
      label: 'In Review',
      icon: FeedbackIcon,
      bgColor: '#fff3e0'
    },
    revision_requested: {
      color: 'error',
      label: 'Revision Requested',
      icon: FeedbackIcon,
      bgColor: '#ffebee'
    },
    completed: {
      color: 'success',
      label: 'Completed',
      icon: CheckCircleIcon,
      bgColor: '#e8f5e8'
    }
  };

  const currentStatus = statusConfig[milestone.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  // Check if user can modify this milestone
  const canModify = user?.role === 'admin' || 
                   user?.role === 'staff' || 
                   (user?.role === 'client' && milestone.assignedTo === user.uid);

  // Calculate if milestone is overdue
  const isOverdue = milestone.dueDate && 
                   new Date(milestone.dueDate) < new Date() && 
                   milestone.status !== 'completed';

  // Format due date
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: `2px solid ${milestone.status === 'in_review' ? '#ff9800' : 'transparent'}`,
        backgroundColor: currentStatus.bgColor,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(5deg)' : 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          transform: isDragging ? 'rotate(5deg)' : 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Drag Handle */}
          {canModify && onReorder && (
            <Box
              {...dragHandleProps}
              sx={{
                cursor: 'grab',
                color: 'text.secondary',
                '&:active': { cursor: 'grabbing' }
              }}
            >
              <DragIcon />
            </Box>
          )}

          {/* Main Content */}
          <Box flex={1}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flex: 1 }}>
                {milestone.title}
              </Typography>
              
              {canModify && (
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  disabled={isLoading}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
            </Box>

            {/* Description */}
            {milestone.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {milestone.description}
              </Typography>
            )}

            {/* Status and Due Date */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                icon={<StatusIcon />}
                label={currentStatus.label}
                color={currentStatus.color}
                size="small"
              />
              
              {milestone.dueDate && (
                <Typography 
                  variant="body2" 
                  color={isOverdue ? 'error' : 'text.secondary'}
                  sx={{ fontWeight: isOverdue ? 600 : 400 }}
                >
                  {formatDueDate(milestone.dueDate)}
                </Typography>
              )}

              {milestone.revisionCount > 0 && (
                <Tooltip title={`${milestone.revisionCount}/${milestone.maxRevisions} revisions used`}>
                  <Typography variant="body2" color="warning.main">
                    Rev: {milestone.revisionCount}/{milestone.maxRevisions}
                  </Typography>
                </Tooltip>
              )}
            </Box>

            {/* Progress Bar (if applicable) */}
            {milestone.status === 'in_progress' && milestone.progress !== undefined && (
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {milestone.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={milestone.progress || 0}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}

            {/* Client Action Buttons */}
            {user?.role === 'client' && milestone.status === 'in_review' && (
              <Box display="flex" gap={1} mt={2}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => handleStatusChange('completed')}
                  disabled={isLoading}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => handleStatusChange('revision_requested')}
                  disabled={isLoading}
                >
                  Request Revision
                </Button>
              </Box>
            )}

            {/* Feedback Display */}
            {milestone.feedback && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  borderRadius: 1,
                  borderLeft: '4px solid',
                  borderLeftColor: milestone.status === 'revision_requested' ? 'error.main' : 'info.main'
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Client Feedback:
                </Typography>
                <Typography variant="body2">
                  {milestone.feedback}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Loading Overlay */}
        {isLoading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0,
              borderRadius: '4px 4px 0 0'
            }} 
          />
        )}
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        
        {milestone.status !== 'completed' && (
          <MenuItem onClick={() => handleStatusChange('completed')}>
            <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            Mark Complete
          </MenuItem>
        )}

        {user?.role === 'admin' && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default MilestoneCard;