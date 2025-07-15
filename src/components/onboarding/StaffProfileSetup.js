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
  FormLabel,
  InputAdornment
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const StaffProfileSetup = ({ onComplete, onBack, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    position: '',
    skills: [],
    experience: '',
    availability: {
      type: 'fulltime',
      hoursPerWeek: 40
    },
    hourlyRate: '',
    portfolio: '',
    companyCode: '',
    bio: '',
    location: '',
    timezone: ''
  });

  const positions = [
    'Video Editor', 'Motion Graphics Designer', 'Colorist', 'Sound Engineer',
    'Producer', 'Director', 'Camera Operator', 'Scriptwriter',
    'Project Manager', 'Creative Director', 'VFX Artist', 'Other'
  ];

  const skillOptions = [
    'Adobe Premiere Pro', 'Final Cut Pro', 'After Effects', 'DaVinci Resolve',
    'Avid Media Composer', 'Cinema 4D', 'Blender', 'Photoshop',
    'Illustrator', 'Pro Tools', 'Logic Pro', 'Color Grading',
    'Motion Graphics', 'VFX', 'Animation', '3D Modeling',
    'Scriptwriting', 'Storyboarding', 'Project Management', 'Client Relations'
  ];

  const experienceLevels = [
    'Entry Level (0-2 years)', 'Mid-Level (3-5 years)', 
    'Senior (6-10 years)', 'Expert (10+ years)'
  ];

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Tokyo', 'Asia/Hong_Kong', 'Australia/Sydney', 'Other'
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

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = () => {
    onComplete({
      role: 'staff',
      staffProfile: formData
    });
  };

  const isFormValid = () => {
    return formData.position && 
           formData.skills.length > 0 &&
           formData.experience &&
           formData.companyCode.trim();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Team Member Profile Setup
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Tell us about your skills and experience
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
              Professional Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Position/Role</InputLabel>
              <Select
                value={formData.position}
                label="Position/Role"
                onChange={(e) => handleInputChange('position', e.target.value)}
              >
                {positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={formData.experience}
                label="Experience Level"
                onChange={(e) => handleInputChange('experience', e.target.value)}
              >
                {experienceLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Skills & Software (Select all that apply)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {skillOptions.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onClick={() => handleSkillToggle(skill)}
                  color={formData.skills.includes(skill) ? 'primary' : 'default'}
                  variant={formData.skills.includes(skill) ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Company & Availability
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Code"
              value={formData.companyCode}
              onChange={(e) => handleInputChange('companyCode', e.target.value)}
              required
              helperText="Enter the company code provided by your employer"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Availability Type</FormLabel>
              <RadioGroup
                value={formData.availability.type}
                onChange={(e) => handleInputChange('availability.type', e.target.value)}
              >
                <FormControlLabel value="fulltime" control={<Radio />} label="Full-time" />
                <FormControlLabel value="parttime" control={<Radio />} label="Part-time" />
                <FormControlLabel value="freelance" control={<Radio />} label="Freelance/Contract" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hours per Week"
              type="number"
              value={formData.availability.hoursPerWeek}
              onChange={(e) => handleInputChange('availability.hoursPerWeek', parseInt(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">hours</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hourly Rate (Optional)"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/hour</InputAdornment>,
              }}
              helperText="This helps with project budgeting"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, State/Country"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={formData.timezone}
                label="Timezone"
                onChange={(e) => handleInputChange('timezone', e.target.value)}
              >
                {timezones.map((timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone.replace('_', ' ').replace('/', ' / ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Portfolio & Bio
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Portfolio URL (Optional)"
              value={formData.portfolio}
              onChange={(e) => handleInputChange('portfolio', e.target.value)}
              placeholder="https://your-portfolio.com"
              helperText="Link to your reel, website, or portfolio"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Professional Bio"
              placeholder="Tell us about your experience, specialties, and what makes you passionate about video production..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
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

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Need a company code?</strong> Contact your production company manager 
          or HR department for your unique company code to join the team.
        </Typography>
      </Alert>
    </Container>
  );
};

export default StaffProfileSetup;