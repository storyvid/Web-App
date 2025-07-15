import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Tabs,
  Tab,
  Badge,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Comment as CommentIcon,
  Attachment as AttachmentIcon,
  Activity as ActivityIcon,
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Send as SendIcon,
  Add as AddIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';
import PermissionGate from '../common/PermissionGate';

const ProjectCollaboration = ({ project, onUpdateProject }) => {
  const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      loadCollaborationData();
    }
  }, [project]);

  const loadCollaborationData = async () => {
    try {
      setLoading(true);
      // TODO: Load from API
      // For now, using mock data
      const mockComments = [
        {
          id: 'comment-1',
          content: 'The initial rough cut looks great! I love the opening sequence. Can we adjust the color temperature in the middle section to be slightly warmer?',
          authorId: project.clientId,
          authorName: 'Alex Johnson',
          authorAvatar: 'https://i.pravatar.cc/40?img=1',
          authorRole: 'client',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          replies: [
            {
              id: 'reply-1',
              content: 'Absolutely! I\'ll adjust the color grading in that section. Should have an updated version ready by tomorrow.',
              authorId: 'staff-1',
              authorName: 'John Doe',
              authorAvatar: 'https://i.pravatar.cc/40?img=2',
              authorRole: 'staff',
              timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
            }
          ],
          attachments: [],
          tags: ['feedback', 'color-grading']
        },
        {
          id: 'comment-2',
          content: 'Updated the audio mix based on previous feedback. The dialogue is now more prominent and the background music is balanced.',
          authorId: 'staff-2',
          authorName: 'Sarah Miller',
          authorAvatar: 'https://i.pravatar.cc/40?img=3',
          authorRole: 'staff',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          replies: [],
          attachments: [
            { id: 'audio-1', name: 'audio_mix_v2.wav', type: 'audio', size: '15.2 MB' }
          ],
          tags: ['audio', 'update']
        }
      ];

      const mockActivities = [
        {
          id: 'activity-1',
          type: 'status_change',
          description: 'Project status changed to "In Review"',
          authorId: 'staff-1',
          authorName: 'John Doe',
          authorAvatar: 'https://i.pravatar.cc/40?img=2',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          metadata: { oldStatus: 'in_progress', newStatus: 'review' }
        },
        {
          id: 'activity-2',
          type: 'file_upload',
          description: 'Uploaded new video cut (v3)',
          authorId: 'staff-1',
          authorName: 'John Doe',
          authorAvatar: 'https://i.pravatar.cc/40?img=2',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          metadata: { fileName: 'brand_story_v3.mp4', fileSize: '245 MB' }
        },
        {
          id: 'activity-3',
          type: 'team_assignment',
          description: 'Sarah Miller assigned to project',
          authorId: 'admin-1',
          authorName: 'Mike Johnson',
          authorAvatar: 'https://i.pravatar.cc/40?img=4',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { assignedUserId: 'staff-2', assignedUserName: 'Sarah Miller' }
        }
      ];

      setComments(mockComments);
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = {
        id: `comment-${Date.now()}`,
        content: newComment,
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorRole: user.role,
        timestamp: new Date().toISOString(),
        replies: [],
        attachments: [],
        tags: []
      };

      if (replyTo) {
        // Add as reply
        setComments(prev => prev.map(c => 
          c.id === replyTo.id 
            ? { ...c, replies: [...c.replies, { ...comment, id: `reply-${Date.now()}` }] }
            : c
        ));
      } else {
        // Add as new comment
        setComments(prev => [comment, ...prev]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: newContent, edited: true };
        }
        // Also check replies
        if (comment.replies.some(r => r.id === commentId)) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId ? { ...reply, content: newContent, edited: true } : reply
            )
          };
        }
        return comment;
      }));
      setEditingComment(null);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentMenuAnchor(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleStatusChange = async () => {
    try {
      // Add activity for status change
      const activity = {
        id: `activity-${Date.now()}`,
        type: 'status_change',
        description: `Project status changed to "${newStatus.replace('_', ' ')}"`,
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        timestamp: new Date().toISOString(),
        metadata: { oldStatus: project.status, newStatus, comment: statusComment }
      };

      setActivities(prev => [activity, ...prev]);

      // Update project status
      if (onUpdateProject) {
        onUpdateProject({ ...project, status: newStatus });
      }

      setShowStatusDialog(false);
      setNewStatus('');
      setStatusComment('');
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'status_change':
        return <ScheduleIcon color="primary" />;
      case 'file_upload':
        return <AttachmentIcon color="success" />;
      case 'team_assignment':
        return <CheckIcon color="info" />;
      case 'comment':
        return <CommentIcon color="secondary" />;
      default:
        return <InfoIcon />;
    }
  };

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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderComments = () => (
    <Box>
      {/* Add Comment */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar src={user?.avatar} sx={{ width: 40, height: 40 }}>
              {user?.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              {replyTo && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Replying to {replyTo.authorName}'s comment
                  <Button size="small" onClick={() => setReplyTo(null)} sx={{ ml: 1 }}>
                    Cancel
                  </Button>
                </Alert>
              )}
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <PermissionGate allowedRoles={['admin', 'staff']}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ScheduleIcon />}
                      onClick={() => setShowStatusDialog(true)}
                      sx={{ mr: 1 }}
                    >
                      Update Status
                    </Button>
                  </PermissionGate>
                </Box>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  {replyTo ? 'Reply' : 'Comment'}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.map((comment) => (
        <Card key={comment.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar src={comment.authorAvatar} sx={{ width: 40, height: 40 }}>
                {comment.authorName.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">{comment.authorName}</Typography>
                    <Chip label={comment.authorRole} size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(comment.timestamp)}
                    </Typography>
                    {comment.edited && (
                      <Typography variant="caption" color="text.secondary">
                        (edited)
                      </Typography>
                    )}
                  </Box>
                  {(comment.authorId === user?.uid || user?.role === 'admin') && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setCommentMenuAnchor(e.currentTarget);
                        setSelectedComment(comment);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {comment.content}
                </Typography>

                {comment.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                    {comment.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}

                {comment.attachments.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {comment.attachments.map((attachment) => (
                      <Chip
                        key={attachment.id}
                        icon={<AttachmentIcon />}
                        label={`${attachment.name} (${attachment.size})`}
                        variant="outlined"
                        clickable
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </Box>
                )}

                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => setReplyTo(comment)}
                >
                  Reply
                </Button>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                    {comment.replies.map((reply) => (
                      <Box key={reply.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar src={reply.authorAvatar} sx={{ width: 32, height: 32 }}>
                          {reply.authorName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" fontSize="0.875rem">
                              {reply.authorName}
                            </Typography>
                            <Chip label={reply.authorRole} size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(reply.timestamp)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontSize="0.875rem">
                            {reply.content}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {comments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No comments yet. Be the first to add feedback!
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderActivities = () => (
    <Box>
      <List>
        {activities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={activity.authorAvatar} sx={{ width: 40, height: 40 }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>{activity.authorName}</strong> {activity.description}
                    </Typography>
                    {activity.type === 'status_change' && (
                      <Chip
                        label={activity.metadata.newStatus.replace('_', ' ')}
                        color={getStatusColor(activity.metadata.newStatus)}
                        size="small"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(activity.timestamp)}
                    </Typography>
                    {activity.metadata?.comment && (
                      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                        "{activity.metadata.comment}"
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < activities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>

      {activities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No activities yet.
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab 
          label={
            <Badge badgeContent={comments.length} color="primary">
              Comments
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={activities.length} color="secondary">
              Activity
            </Badge>
          } 
        />
      </Tabs>

      {tabValue === 0 && renderComments()}
      {tabValue === 1 && renderActivities()}

      {/* Comment Actions Menu */}
      <Menu
        anchorEl={commentMenuAnchor}
        open={Boolean(commentMenuAnchor)}
        onClose={() => setCommentMenuAnchor(null)}
      >
        <MenuItem onClick={() => setEditingComment(selectedComment)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteComment(selectedComment?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem>
          <FlagIcon sx={{ mr: 1 }} />
          Report
        </MenuItem>
      </Menu>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)}>
        <DialogTitle>Update Project Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <PermissionGate allowedRoles={['admin']}>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </PermissionGate>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment (Optional)"
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            placeholder="Add a comment about this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleStatusChange}
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectCollaboration;