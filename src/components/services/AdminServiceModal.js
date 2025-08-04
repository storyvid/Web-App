import React, { useState, useEffect } from 'react';
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
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import firebaseService from '../../services/firebase/firebaseService';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: 600,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFC535 0%, #FF8C42 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: theme.spacing(1),
  textTransform: 'capitalize',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFB020 0%, #FF7A30 100%)',
  },
  '&:disabled': {
    background: '#ccc',
    color: '#666',
  },
}));

const AdminServiceModal = ({ open, onClose, service, onSubmit }) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    timeline: '', 
    budget: '',
    clientId: '',
    additionalRequirements: ''
  });
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadClients();
      if (service) {
        setFormData({
          projectTitle: `${service.title} Project`,
          description: '',
          timeline: '',
          budget: '',
          clientId: '',
          additionalRequirements: ''
        });
      }
      setError('');
    }
  }, [open, service]);

  const loadClients = async () => {
    try {
      const clientsData = await firebaseService.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.projectTitle || !formData.description || !formData.timeline || !formData.clientId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        ...formData,
        serviceType: service.type,
        serviceTitle: service.title,
        servicePricing: service.price
      });
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const timelineOptions = [
    { value: 'asap', label: 'ASAP (1 week)' },
    { value: '1-2weeks', label: '1-2 weeks' },
    { value: '1month', label: '1 month' },
    { value: '2-3months', label: '2-3 months' },  
    { value: 'flexible', label: 'Flexible timeline' }
  ];

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight={700}>
          Create {service?.title} Project
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create a new project directly for a client
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Select Client</InputLabel>
            <Select
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              label="Select Client"
            >
              {clients.map(client => (
                <MenuItem key={client.uid} value={client.uid}>
                  {client.name} ({client.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Project Title"
            value={formData.projectTitle}
            onChange={(e) => handleInputChange('projectTitle', e.target.value)}
            fullWidth
            required
          />
          
          <TextField
            label="Project Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
            placeholder="Describe the project goals, target audience, key messages, etc."
          />
          
          <FormControl fullWidth required>
            <InputLabel>Timeline</InputLabel>
            <Select
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              label="Timeline"
            >
              {timelineOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Budget"
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            fullWidth
            placeholder="Project budget amount"
          />
          
          <TextField
            label="Additional Requirements"
            value={formData.additionalRequirements}
            onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Any specific requirements, style preferences, or additional details"
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <GradientButton
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </GradientButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default AdminServiceModal;