import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Stack,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  Avatar,
  Fab,
  Menu
} from '@mui/material';
import {
  Add as AddIcon,
  Timeline as TimelineIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  Flag as FlagIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';

import milestoneService from '../../services/milestoneService';

const TimelineManager = ({ projectId, projectName, onClose }) => {
  const [milestones, setMilestones] = useState([]);
  const [timelineData, setTimelineData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [actionAnchor, setActionAnchor] = useState(null);

  // Form state
  const [createLoading, setCreateLoading] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    type: 'review',
    dueDate: '',
    assignedTo: '',
    dependencies: []
  });

  useEffect(() => {
    if (projectId) {
      loadTimelineData();
    }
  }, [projectId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const timeline = await milestoneService.getProjectTimeline(projectId);
      setTimelineData(timeline);
      setMilestones(timeline.milestones);
    } catch (err) {
      console.error('Error loading timeline:', err);
      setError('Unable to load project timeline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!newMilestone.title?.trim()) {
      setError('Please enter a milestone title.');
      return;
    }

    if (!newMilestone.dueDate) {
      setError('Please select a due date.');
      return;
    }

    try {
      setCreateLoading(true);
      
      const milestoneData = {
        ...newMilestone,
        dueDate: new Date(newMilestone.dueDate)
      };

      await milestoneService.createMilestone(projectId, milestoneData);
      
      setSuccess(`✅ Milestone "${newMilestone.title}" created successfully!`);
      
      setTimeout(() => {
        setShowCreateDialog(false);
        setSuccess('');
        setNewMilestone({
          title: '',
          description: '',
          type: 'review',
          dueDate: '',
          assignedTo: '',
          dependencies: []
        });
      }, 1500);
      
      loadTimelineData();
    } catch (err) {
      console.error('Error creating milestone:', err);
      setError('Unable to create milestone. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId, newStatus) => {
    try {
      setError('');
      await milestoneService.updateMilestoneStatus(milestoneId, newStatus);
      
      const statusDisplayName = newStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      setSuccess(`✅ Milestone status updated to ${statusDisplayName}`);
      
      setTimeout(() => setSuccess(''), 2000);
      loadTimelineData();
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Unable to update milestone status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      'in-progress': 'info',
      completed: 'success',
      overdue: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: PendingIcon,
      'in-progress': StartIcon,
      completed: CompletedIcon,
      overdue: OverdueIcon
    };
    return icons[status] || PendingIcon;
  };

  const getMilestoneTypeColor = (type) => {
    const colors = {
      draft: 'info',
      review: 'warning',
      final: 'success',
      meeting: 'secondary'
    };
    return colors[type] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading timeline...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Project Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {projectName} • {milestones.length} milestones
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
          >
            Add Milestone
          </Button>
        </Stack>
      </Stack>

      {/* Timeline Statistics */}
      {timelineData.timeline && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {timelineData.timeline.totalMilestones}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Milestones
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {timelineData.timeline.completedMilestones}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight={700}>
                  {timelineData.timeline.overdueMilestones}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  {timelineData.timeline.completionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Milestones Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Milestones Timeline
          </Typography>

          {milestones.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No milestones yet
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Create your first milestone to start tracking project progress.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
                sx={{ mt: 2 }}
              >
                Add First Milestone
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Milestone</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {milestones.map((milestone) => {
                    const StatusIcon = getStatusIcon(milestone.status);
                    const daysUntil = getDaysUntilDue(milestone.dueDate);
                    const overdue = isOverdue(milestone.dueDate, milestone.status);
                    
                    return (
                      <TableRow key={milestone.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {milestone.title}
                            </Typography>
                            {milestone.description && (
                              <Typography variant="caption" color="text.secondary">
                                {milestone.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={milestone.type?.replace('-', ' ') || 'Review'}
                            color={getMilestoneTypeColor(milestone.type)}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <StatusIcon 
                              sx={{ 
                                fontSize: 16, 
                                color: overdue && milestone.status !== 'completed' ? 'error.main' : `${getStatusColor(milestone.status)}.main`
                              }} 
                            />
                            <Chip
                              label={overdue && milestone.status !== 'completed' ? 'Overdue' : milestone.status?.replace('-', ' ') || 'Pending'}
                              color={overdue && milestone.status !== 'completed' ? 'error' : getStatusColor(milestone.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {formatDate(milestone.dueDate)}
                            </Typography>
                            {daysUntil !== null && milestone.status !== 'completed' && (
                              <Typography 
                                variant="caption" 
                                color={daysUntil < 0 ? 'error.main' : daysUntil <= 3 ? 'warning.main' : 'text.secondary'}
                              >
                                {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                                 daysUntil === 0 ? 'Due today' :
                                 `${daysUntil} days left`}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {milestone.status === 'completed' ? (
                              <Typography variant="body2" color="success.main" fontWeight={600}>
                                ✓ Complete
                              </Typography>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleUpdateMilestoneStatus(milestone.id, 'in-progress')}
                                  disabled={milestone.status === 'in-progress'}
                                >
                                  {milestone.status === 'in-progress' ? 'In Progress' : 'Start'}
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleUpdateMilestoneStatus(milestone.id, 'completed')}
                                >
                                  Complete
                                </Button>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setActionAnchor(e.currentTarget);
                              setSelectedMilestone(milestone);
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={() => setActionAnchor(null)}
      >
        <MenuItem onClick={() => {
          setShowEditDialog(true);
          setActionAnchor(null);
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Milestone
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement delete
          setActionAnchor(null);
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Milestone
        </MenuItem>
      </Menu>

      {/* Create Milestone Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => {
          setShowCreateDialog(false);
          setError('');
          setSuccess('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Milestone</DialogTitle>
        <DialogContent>
          {/* Dialog Error/Success Alert */}
          {error && showCreateDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && showCreateDialog && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Milestone Title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newMilestone.type}
                  label="Type"
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="draft">Draft Delivery</MenuItem>
                  <MenuItem value="review">Client Review</MenuItem>
                  <MenuItem value="final">Final Delivery</MenuItem>
                  <MenuItem value="meeting">Meeting/Call</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowCreateDialog(false);
              setError('');
              setSuccess('');
            }}
            disabled={createLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateMilestone}
            disabled={createLoading || !newMilestone.title?.trim() || !newMilestone.dueDate}
            sx={{
              minWidth: 140,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {createLoading ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    border: '2px solid currentColor',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} 
                />
                <Typography variant="button">Creating...</Typography>
              </Stack>
            ) : (
              'Create Milestone'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setShowCreateDialog(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TimelineManager;