import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';
import { X } from 'lucide-react';

const AdminServiceModal = ({ open, onClose, service, onSubmit, clients = [], submitting = false }) => {
  console.log('🏢 AdminServiceModal rendered with clients:', clients);
  
  const [formData, setFormData] = useState({
    clientId: '',
    projectName: '',
    description: '',
    timeline: '',
    budget: '',
    skipApproval: false,
    additionalNotes: ''
  });
  const [errors, setErrors] = useState({});

  // Parse the base price from service (e.g., "Starting at $5,000" -> 5000)
  const basePrice = service?.price.replace(/[^0-9]/g, '') || '0';

  useEffect(() => {
    if (service) {
      setFormData(prev => ({ ...prev, budget: basePrice }));
    }
  }, [service, basePrice]);

  const timelines = [
    { value: 'asap', label: 'ASAP - As soon as possible' },
    { value: '1-2weeks', label: '1-2 Weeks' },
    { value: '1month', label: '1 Month' },
    { value: '2months', label: '2 Months' },
    { value: '3months', label: '3 Months' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const handleChange = (field) => (event) => {
    const value = field === 'skipApproval' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    if (!formData.timeline) {
      newErrors.timeline = 'Please select a timeline';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      ...formData,
      serviceType: service.id,
      serviceName: service.name,
      budget: parseFloat(formData.budget)
    });
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        clientId: '',
        projectName: '',
        description: '',
        timeline: '',
        budget: basePrice,
        skipApproval: false,
        additionalNotes: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!service) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Create {service.name} Project</Typography>
          <IconButton 
            onClick={handleClose} 
            disabled={submitting}
            size="small"
          >
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Service Info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{service.name}</strong>
            </Typography>
            <Typography variant="caption">
              {service.description}
            </Typography>
          </Alert>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Client Selection */}
            <FormControl fullWidth error={!!errors.clientId}>
              <InputLabel>Select Client</InputLabel>
              <Select
                value={formData.clientId}
                onChange={handleChange('clientId')}
                label="Select Client"
                disabled={submitting}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name} - {client.company || 'No Company'}
                  </MenuItem>
                ))}
              </Select>
              {errors.clientId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.clientId}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Project Name"
              fullWidth
              value={formData.projectName}
              onChange={handleChange('projectName')}
              error={!!errors.projectName}
              helperText={errors.projectName}
              placeholder="e.g., Summer Campaign Commercial"
              disabled={submitting}
            />

            <TextField
              label="Project Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Project goals, target audience, and key messages..."
              disabled={submitting}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth error={!!errors.timeline}>
                <InputLabel>Timeline</InputLabel>
                <Select
                  value={formData.timeline}
                  onChange={handleChange('timeline')}
                  label="Timeline"
                  disabled={submitting}
                >
                  {timelines.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.timeline && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.timeline}
                  </Typography>
                )}
              </FormControl>

              <TextField
                label="Budget"
                fullWidth
                value={formData.budget}
                onChange={handleChange('budget')}
                error={!!errors.budget}
                helperText={errors.budget}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                type="number"
                disabled={submitting}
              />
            </Box>

            <TextField
              label="Additional Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.additionalNotes}
              onChange={handleChange('additionalNotes')}
              placeholder="Any special requirements or notes for the team?"
              disabled={submitting}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.skipApproval}
                  onChange={handleChange('skipApproval')}
                  disabled={submitting}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Start project immediately</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Skip client approval and begin production right away
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={handleClose} 
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminServiceModal;