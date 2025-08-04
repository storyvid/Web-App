import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { X } from 'lucide-react';

const ServiceRequestModal = ({ open, onClose, service, onSubmit, submitting = false }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    timeline: '',
    additionalNotes: ''
  });
  const [errors, setErrors] = useState({});

  const timelines = [
    { value: 'asap', label: 'ASAP - As soon as possible' },
    { value: '1-2weeks', label: '1-2 Weeks' },
    { value: '1month', label: '1 Month' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    if (!formData.timeline) {
      newErrors.timeline = 'Please select a timeline';
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
      basePrice: service.price
    });
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        projectName: '',
        description: '',
        timeline: '',
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
          <Typography variant="h6">Request {service.name}</Typography>
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
              <strong>{service.name}</strong> - {service.price}
            </Typography>
            <Typography variant="caption">
              {service.description}
            </Typography>
          </Alert>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              placeholder="Tell us about your project goals, target audience, and key messages..."
              disabled={submitting}
            />

            <FormControl fullWidth error={!!errors.timeline}>
              <InputLabel>Preferred Timeline</InputLabel>
              <Select
                value={formData.timeline}
                onChange={handleChange('timeline')}
                label="Preferred Timeline"
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
              label="Additional Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.additionalNotes}
              onChange={handleChange('additionalNotes')}
              placeholder="Any special requirements, reference materials, or questions?"
              disabled={submitting}
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
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceRequestModal;