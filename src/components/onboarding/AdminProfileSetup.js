import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment,
  Divider
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const AdminProfileSetup = ({ onComplete, onBack, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    company: {
      name: '',
      website: '',
      size: '',
      location: '',
      founded: '',
      description: ''
    },
    services: [],
    specialties: [],
    teamSize: '',
    clientTypes: [],
    pricing: {
      model: '',
      startingRate: ''
    },
    permissions: {
      teamManagement: true,
      clientManagement: true,
      billing: true,
      analytics: true,
      systemAdmin: true
    },
    bio: ''
  });

  const companySizes = [
    'Solo (Just me)', '2-5 employees', '6-15 employees', 
    '16-50 employees', '51-100 employees', '100+ employees'
  ];

  const serviceOptions = [
    'Corporate Videos', 'Commercial Advertising', 'Wedding Videography',
    'Event Coverage', 'Documentary Production', 'Product Videos',
    'Training Videos', 'Live Streaming', 'Animation Services',
    'Post-Production Services', 'Equipment Rental', 'Consultation'
  ];

  const specialtyOptions = [
    'Drone/Aerial Footage', '4K/8K Production', 'VR/360 Video',
    'Live Broadcasting', 'Multi-Camera Setup', 'Studio Production',
    'Motion Graphics', 'Color Grading', 'Sound Design', 'Scriptwriting'
  ];

  const clientTypeOptions = [
    'Small Businesses', 'Corporations', 'Nonprofits', 'Government',
    'Healthcare', 'Education', 'Real Estate', 'Entertainment',
    'Technology', 'Retail', 'Hospitality', 'Individuals'
  ];

  const pricingModels = [
    'Project-based', 'Hourly rate', 'Day rate', 'Package deals',
    'Retainer/Monthly', 'Value-based', 'Custom quote'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayToggle = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handlePermissionChange = (permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleSubmit = () => {
    onComplete({
      role: 'admin',
      adminProfile: formData
    });
  };

  const isFormValid = () => {
    return formData.company.name.trim() && 
           formData.company.size &&
           formData.services.length > 0 &&
           formData.teamSize;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Production Company Setup
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Set up your production company profile and team management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.company.name}
              onChange={(e) => handleInputChange('company.name', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              value={formData.company.website}
              onChange={(e) => handleInputChange('company.website', e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Company Size</InputLabel>
              <Select
                value={formData.company.size}
                label="Company Size"
                onChange={(e) => handleInputChange('company.size', e.target.value)}
              >
                {companySizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={formData.company.location}
              onChange={(e) => handleInputChange('company.location', e.target.value)}
              placeholder="City, State/Country"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Founded Year"
              type="number"
              value={formData.company.founded}
              onChange={(e) => handleInputChange('company.founded', e.target.value)}
              placeholder="2020"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Team Size"
              type="number"
              value={formData.teamSize}
              onChange={(e) => handleInputChange('teamSize', e.target.value)}
              required
              helperText="Number of production team members"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Company Description"
              value={formData.company.description}
              onChange={(e) => handleInputChange('company.description', e.target.value)}
              placeholder="Brief description of your production company..."
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Services & Specialties
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Services Offered (Select all that apply)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {serviceOptions.map((service) => (
                <Chip
                  key={service}
                  label={service}
                  onClick={() => handleArrayToggle('services', service)}
                  color={formData.services.includes(service) ? 'primary' : 'default'}
                  variant={formData.services.includes(service) ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Specialties & Unique Capabilities
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {specialtyOptions.map((specialty) => (
                <Chip
                  key={specialty}
                  label={specialty}
                  onClick={() => handleArrayToggle('specialties', specialty)}
                  color={formData.specialties.includes(specialty) ? 'secondary' : 'default'}
                  variant={formData.specialties.includes(specialty) ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Target Client Types
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {clientTypeOptions.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleArrayToggle('clientTypes', type)}
                  color={formData.clientTypes.includes(type) ? 'success' : 'default'}
                  variant={formData.clientTypes.includes(type) ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Pricing & Business Model
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Pricing Model</InputLabel>
              <Select
                value={formData.pricing.model}
                label="Pricing Model"
                onChange={(e) => handleInputChange('pricing.model', e.target.value)}
              >
                {pricingModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Starting Rate"
              value={formData.pricing.startingRate}
              onChange={(e) => handleInputChange('pricing.startingRate', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              placeholder="e.g., 1000"
              helperText="Optional: helps with client matching"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Admin Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configure your admin access levels (you can modify these later)
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.permissions.teamManagement}
                      onChange={(e) => handlePermissionChange('teamManagement', e.target.checked)}
                    />
                  }
                  label="Team Management"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.permissions.clientManagement}
                      onChange={(e) => handlePermissionChange('clientManagement', e.target.checked)}
                    />
                  }
                  label="Client Management"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.permissions.billing}
                      onChange={(e) => handlePermissionChange('billing', e.target.checked)}
                    />
                  }
                  label="Billing & Invoicing"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.permissions.analytics}
                      onChange={(e) => handlePermissionChange('analytics', e.target.checked)}
                    />
                  }
                  label="Analytics & Reporting"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Personal Bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell clients about your background, experience, and what makes your company unique..."
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onBack}
            disabled={loading}
          >
            Back
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            size="large"
          >
            {loading ? 'Creating Company...' : 'Complete Setup'}
          </Button>
        </Box>
      </Paper>

      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Company Setup Complete!</strong> After completing setup, you'll be able to:
          • Invite team members with company codes
          • Create and manage client projects
          • Access advanced analytics and reporting
          • Configure billing and payment processing
        </Typography>
      </Alert>
    </Container>
  );
};

export default AdminProfileSetup;