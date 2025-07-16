import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const MilestoneDialog = ({ open, milestone, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    dueDate: null,
    assignedTo: '',
    priority: 'medium',
    category: 'general',
    maxRevisions: 2
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or milestone changes
  useEffect(() => {
    if (open) {
      if (milestone) {
        setFormData({
          title: milestone.title || '',
          description: milestone.description || '',
          status: milestone.status || 'pending',
          dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
          assignedTo: milestone.assignedTo || '',
          priority: milestone.priority || 'medium',
          category: milestone.category || 'general',
          maxRevisions: milestone.maxRevisions || 2
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'pending',
          dueDate: null,
          assignedTo: '',
          priority: 'medium',
          category: 'general',
          maxRevisions: 2
        });
      }
      setErrors({});
    }
  }, [open, milestone]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date
    }));
    
    if (errors.dueDate) {
      setErrors(prev => ({
        ...prev,
        dueDate: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (formData.dueDate < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    if (formData.maxRevisions < 0 || formData.maxRevisions > 10) {
      newErrors.maxRevisions = 'Max revisions must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
        updatedAt: new Date().toISOString()
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving milestone:', error);
      setErrors({ submit: error.message || 'Failed to save milestone' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'revision_requested', label: 'Revision Requested' },
    { value: 'completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'script', label: 'Script Review' },
    { value: 'production', label: 'Production' },
    { value: 'editing', label: 'Editing' },
    { value: 'review', label: 'Client Review' },
    { value: 'approval', label: 'Final Approval' },
    { value: 'delivery', label: 'Delivery' }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'primary',
      high: 'warning',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit
        }}
      >
        <DialogTitle>
          {milestone ? 'Edit Milestone' : 'Create New Milestone'}
        </DialogTitle>

        <DialogContent dividers>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                label="Milestone Title"
                value={formData.title}
                onChange={handleChange('title')}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
                required
                autoFocus
                placeholder="e.g., Script Review & Approval"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                error={Boolean(errors.description)}
                helperText={errors.description}
                fullWidth
                required
                multiline
                rows={3}
                placeholder="Describe what needs to be accomplished for this milestone..."
              />
            </Grid>

            {/* Status and Priority */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange('status')}
                  label="Status"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={handleChange('priority')}
                  label="Priority"
                  renderValue={(value) => (
                    <Box display="flex" alignItems="center">
                      <Chip
                        label={priorityOptions.find(p => p.value === value)?.label}
                        color={getPriorityColor(value)}
                        size="small"
                      />
                    </Box>
                  )}
                >
                  {priorityOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Chip
                        label={option.label}
                        color={getPriorityColor(option.value)}
                        size="small"
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Category and Due Date */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="Category"
                >
                  {categoryOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={Boolean(errors.dueDate)}
                    helperText={errors.dueDate}
                  />
                )}
                minDate={new Date()}
              />
            </Grid>

            {/* Max Revisions */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Max Revisions"
                type="number"
                value={formData.maxRevisions}
                onChange={handleChange('maxRevisions')}
                error={Boolean(errors.maxRevisions)}
                helperText={errors.maxRevisions || 'Maximum number of revision rounds allowed'}
                fullWidth
                inputProps={{ min: 0, max: 10 }}
              />
            </Grid>

            {/* Current milestone info if editing */}
            {milestone && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'grey.50', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Current Milestone Info
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    <Chip label={`Order: ${milestone.order || 0}`} size="small" />
                    <Chip 
                      label={`Revisions: ${milestone.revisionCount || 0}/${milestone.maxRevisions || 2}`} 
                      size="small" 
                      color={milestone.revisionCount >= milestone.maxRevisions ? 'error' : 'default'}
                    />
                    {milestone.completedAt && (
                      <Chip 
                        label={`Completed: ${new Date(milestone.completedAt).toLocaleDateString()}`} 
                        size="small" 
                        color="success"
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : (milestone ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default MilestoneDialog;