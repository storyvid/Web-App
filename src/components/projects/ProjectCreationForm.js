import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Chip,
  Stack,
  Alert,
  Autocomplete,
  Box,
  InputAdornment,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Group as TeamIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';
import PermissionGate from '../common/PermissionGate';

const ProjectCreationForm = ({ open, onClose, onSubmit, loading = false }) => {
  const user = useSelector(selectUser);
  const [activeStep, setActiveStep] = useState(0);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectType: '',
    genre: '',
    priority: 'medium',
    clientId: user?.role === 'client' ? user.uid : '',
    assignedStaff: [],
    startDate: '',
    endDate: '',
    estimatedHours: '',
    communicationMethod: 'email',
    tags: []
  });

  const [errors, setErrors] = useState({});

  const steps = [
    'Project Details',
    'Team & Timeline & Settings'
  ];

  const projectTypes = [
    'Corporate Video', 'Commercial Advertising', 'Product Demo',
    'Training Video', 'Event Coverage', 'Documentary',
    'Animation', 'Live Streaming', 'Social Media Content',
    'Music Video', 'Testimonial', 'Explainer Video'
  ];

  const genres = [
    'Brand Story', 'Product Showcase', 'Educational',
    'Entertainment', 'Promotional', 'Instructional',
    'Documentary', 'Commercial', 'Social Impact'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'info' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
    { value: 'urgent', label: 'Urgent', color: 'error' }
  ];

  useEffect(() => {
    if (open && user?.role === 'admin') {
      // Load available staff and clients for admin users
      loadAvailableTeamMembers();
      loadAvailableClients();
    }
  }, [open, user]);

  const loadAvailableTeamMembers = async () => {
    // TODO: Load from API
    setAvailableStaff([
      { uid: 'staff-1', name: 'John Doe', position: 'Video Editor', avatar: 'https://i.pravatar.cc/40?img=1' },
      { uid: 'staff-2', name: 'Sarah Miller', position: 'Motion Graphics', avatar: 'https://i.pravatar.cc/40?img=2' },
      { uid: 'staff-3', name: 'Mike Johnson', position: 'Producer', avatar: 'https://i.pravatar.cc/40?img=3' }
    ]);
  };

  const loadAvailableClients = async () => {
    // TODO: Load from API
    setAvailableClients([
      { uid: 'client-1', name: 'Tech Innovators Inc', contact: 'Alex Johnson' },
      { uid: 'client-2', name: 'StartupCo', contact: 'Maria Garcia' },
      { uid: 'client-3', name: 'HealthCorp', contact: 'David Chen' }
    ]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleTagsChange = (event, newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Project Details
        if (!formData.name.trim()) newErrors.name = 'Project name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.projectType) newErrors.projectType = 'Project type is required';
        break;
      
      case 1: // Team & Timeline & Settings
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (user?.role === 'admin' && !formData.clientId) {
          newErrors.clientId = 'Client selection is required';
        }
        if (!formData.estimatedHours || formData.estimatedHours <= 0) newErrors.estimatedHours = 'Estimated hours is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      const projectData = {
        ...formData,
        timeline: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          estimatedHours: parseFloat(formData.estimatedHours)
        },
        communications: {
          preferredContactMethod: formData.communicationMethod
        }
      };

      onSubmit(projectData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      projectType: '',
      genre: '',
      priority: 'medium',
      clientId: user?.role === 'client' ? user.uid : '',
      assignedStaff: [],
      startDate: '',
      endDate: '',
      estimatedHours: '',
      communicationMethod: 'email',
      tags: []
    });
    setActiveStep(0);
    setErrors({});
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Project Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.projectType}>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={formData.projectType}
                  label="Project Type"
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                >
                  {projectTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={formData.genre}
                  label="Genre"
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Chip 
                        label={priority.label} 
                        color={priority.color} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.tags}
                onChange={handleTagsChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={index} label={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags..."
                    helperText="Press Enter to add tags"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <PermissionGate allowedRoles={['admin']}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!errors.clientId}>
                  <InputLabel>Client</InputLabel>
                  <Select
                    value={formData.clientId}
                    label="Client"
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                  >
                    {availableClients.map((client) => (
                      <MenuItem key={client.uid} value={client.uid}>
                        <Box>
                          <Typography variant="body1">{client.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Contact: {client.contact}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </PermissionGate>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  )
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  )
                }}
                required
              />
            </Grid>
            
            <PermissionGate allowedRoles={['admin']}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <TeamIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Assign Team Members
                </Typography>
                <Autocomplete
                  multiple
                  options={availableStaff}
                  getOptionLabel={(option) => option.name}
                  value={availableStaff.filter(staff => formData.assignedStaff.includes(staff.uid))}
                  onChange={(event, newValue) => {
                    handleInputChange('assignedStaff', newValue.map(staff => staff.uid));
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <img
                        src={option.avatar}
                        alt={option.name}
                        style={{ width: 32, height: 32, borderRadius: '50%' }}
                      />
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.position}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={index}
                        label={option.name}
                        avatar={<img src={option.avatar} alt={option.name} style={{ width: 24, height: 24 }} />}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select team members..."
                      helperText="Choose staff members to assign to this project"
                    />
                  )}
                />
              </Grid>
            </PermissionGate>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Hours"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                error={!!errors.estimatedHours}
                helperText={errors.estimatedHours}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Communication Method</InputLabel>
                <Select
                  value={formData.communicationMethod}
                  label="Preferred Communication Method"
                  onChange={(e) => handleInputChange('communicationMethod', e.target.value)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="video">Video Calls</MenuItem>
                  <MenuItem value="platform">StoryVid Platform</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {user?.role === 'client' ? 'Request New Project' : 'Create New Project'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {user?.role === 'client' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Submit your project request and our team will review it and get back to you within 24 hours.
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Creating...' : user?.role === 'client' ? 'Submit Request' : 'Create Project'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectCreationForm;