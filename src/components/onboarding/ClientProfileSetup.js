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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const ClientProfileSetup = ({ onComplete, onBack, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    company: '',
    industry: '',
    companySize: '',
    projectTypes: [],
    budget: '',
    timeline: '',
    communicationPrefs: {
      preferredMethod: 'email',
      frequency: 'weekly'
    },
    description: ''
  });

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Manufacturing', 'Real Estate', 'Non-Profit', 'Entertainment',
    'Marketing/Advertising', 'Hospitality', 'Other'
  ];

  const projectTypeOptions = [
    'Corporate Videos', 'Product Demos', 'Training Videos', 'Marketing Content',
    'Event Coverage', 'Testimonials', 'Explainer Videos', 'Social Media Content',
    'Documentary', 'Commercial Ads', 'Internal Communications', 'Other'
  ];

  const budgetRanges = [
    'Under $5,000', '$5,000 - $15,000', '$15,000 - $30,000',
    '$30,000 - $50,000', '$50,000 - $100,000', 'Over $100,000'
  ];

  const timelineOptions = [
    'Rush (1-2 weeks)', 'Standard (3-4 weeks)', 'Extended (1-2 months)',
    'Long-term (3+ months)', 'Ongoing relationship'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleProjectTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type]
    }));
  };

  const handleSubmit = () => {
    onComplete({
      role: 'client',
      clientProfile: formData
    });
  };

  const isFormValid = () => {
    return formData.company.trim() && 
           formData.industry && 
           formData.projectTypes.length > 0 &&
           formData.budget &&
           formData.timeline;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Client Profile Setup
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Tell us about your company and video production needs
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
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Industry</InputLabel>
              <Select
                value={formData.industry}
                label="Industry"
                onChange={(e) => handleInputChange('industry', e.target.value)}
              >
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Company Size</InputLabel>
              <Select
                value={formData.companySize}
                label="Company Size"
                onChange={(e) => handleInputChange('companySize', e.target.value)}
              >
                <MenuItem value="1-10">1-10 employees</MenuItem>
                <MenuItem value="11-50">11-50 employees</MenuItem>
                <MenuItem value="51-200">51-200 employees</MenuItem>
                <MenuItem value="201-1000">201-1000 employees</MenuItem>
                <MenuItem value="1000+">1000+ employees</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Project Requirements
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              What types of videos do you need? (Select all that apply)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {projectTypeOptions.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleProjectTypeToggle(type)}
                  color={formData.projectTypes.includes(type) ? 'primary' : 'default'}
                  variant={formData.projectTypes.includes(type) ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Budget Range</InputLabel>
              <Select
                value={formData.budget}
                label="Budget Range"
                onChange={(e) => handleInputChange('budget', e.target.value)}
              >
                {budgetRanges.map((range) => (
                  <MenuItem key={range} value={range}>
                    {range}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Timeline</InputLabel>
              <Select
                value={formData.timeline}
                label="Timeline"
                onChange={(e) => handleInputChange('timeline', e.target.value)}
              >
                {timelineOptions.map((timeline) => (
                  <MenuItem key={timeline} value={timeline}>
                    {timeline}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Communication Preferences
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Preferred Communication Method</FormLabel>
              <RadioGroup
                value={formData.communicationPrefs.preferredMethod}
                onChange={(e) => handleInputChange('communicationPrefs.preferredMethod', e.target.value)}
              >
                <FormControlLabel value="email" control={<Radio />} label="Email" />
                <FormControlLabel value="phone" control={<Radio />} label="Phone" />
                <FormControlLabel value="video" control={<Radio />} label="Video Calls" />
                <FormControlLabel value="platform" control={<Radio />} label="StoryVid Platform" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Update Frequency</FormLabel>
              <RadioGroup
                value={formData.communicationPrefs.frequency}
                onChange={(e) => handleInputChange('communicationPrefs.frequency', e.target.value)}
              >
                <FormControlLabel value="daily" control={<Radio />} label="Daily updates" />
                <FormControlLabel value="weekly" control={<Radio />} label="Weekly updates" />
                <FormControlLabel value="milestone" control={<Radio />} label="Milestone updates" />
                <FormControlLabel value="asneeded" control={<Radio />} label="As needed" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Information"
              placeholder="Tell us more about your video production goals, specific requirements, or anything else we should know..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
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
            {loading ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ClientProfileSetup;