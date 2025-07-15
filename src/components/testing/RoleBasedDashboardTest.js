import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { setUser, clearAuth } from '../../store/slices/authSlice';

// Import all dashboard components
import ClientDashboard from '../dashboards/ClientDashboard';
import StaffDashboard from '../dashboards/StaffDashboard';
import AdminDashboard from '../dashboards/AdminDashboard';

const RoleBasedDashboardTest = () => {
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState('client');
  const [isTestMode, setIsTestMode] = useState(false);

  const testUsers = {
    client: {
      uid: 'test-client-123',
      email: 'client@test.com',
      name: 'Alex Johnson',
      role: 'client',
      onboardingComplete: true,
      clientProfile: {
        company: 'Tech Innovators Inc',
        industry: 'Technology',
        companySize: '51-200',
        projectTypes: ['Corporate Videos', 'Product Demos', 'Training Videos'],
        budget: '$15,000 - $30,000',
        timeline: 'Standard (3-4 weeks)',
        communicationPrefs: {
          preferredMethod: 'email',
          frequency: 'weekly'
        },
        description: 'Looking for high-quality video content for marketing and training purposes.'
      }
    },
    staff: {
      uid: 'test-staff-123',
      email: 'staff@test.com',
      name: 'Jordan Miller',
      role: 'staff',
      onboardingComplete: true,
      staffProfile: {
        position: 'Video Editor',
        skills: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics'],
        experience: 'Mid-Level (3-5 years)',
        availability: {
          type: 'fulltime',
          hoursPerWeek: 40
        },
        hourlyRate: '75',
        companyCode: 'STORYVID123',
        companyId: 'company-123',
        bio: 'Passionate video editor with expertise in corporate and commercial content.',
        location: 'Los Angeles, CA',
        timezone: 'America/Los_Angeles'
      }
    },
    admin: {
      uid: 'test-admin-123',
      email: 'admin@test.com',
      name: 'Sam Rodriguez',
      role: 'admin',
      onboardingComplete: true,
      adminProfile: {
        company: {
          name: 'StoryVid Productions',
          website: 'https://storyvid.com',
          size: '16-50 employees',
          location: 'Los Angeles, CA',
          founded: '2018',
          description: 'Full-service video production company specializing in corporate and commercial content.'
        },
        services: ['Corporate Videos', 'Commercial Advertising', 'Event Coverage', 'Post-Production Services'],
        specialties: ['4K/8K Production', 'Motion Graphics', 'Color Grading', 'Sound Design'],
        teamSize: 25,
        clientTypes: ['Corporations', 'Small Businesses', 'Technology', 'Healthcare'],
        pricing: {
          model: 'Project-based',
          startingRate: '5000'
        },
        permissions: {
          teamManagement: true,
          clientManagement: true,
          billing: true,
          analytics: true,
          systemAdmin: true
        },
        companyId: 'company-123',
        bio: 'Experienced production manager with 10+ years in video production industry.'
      }
    }
  };

  const handleRoleSwitch = (role) => {
    setSelectedRole(role);
    if (isTestMode) {
      dispatch(setUser(testUsers[role]));
    }
  };

  const handleStartTest = () => {
    setIsTestMode(true);
    dispatch(setUser(testUsers[selectedRole]));
  };

  const handleStopTest = () => {
    setIsTestMode(false);
    dispatch(clearAuth());
  };

  const renderDashboard = () => {
    if (!isTestMode) return null;

    switch (selectedRole) {
      case 'client':
        return <ClientDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  if (isTestMode) {
    return (
      <Box>
        {/* Test Controls */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              🧪 Testing Mode: {selectedRole.toUpperCase()} Dashboard
            </Typography>
            <Box>
              {['client', 'staff', 'admin'].map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleRoleSwitch(role)}
                  sx={{ mr: 1 }}
                >
                  {role}
                </Button>
              ))}
              <Button variant="outlined" color="error" onClick={handleStopTest}>
                Stop Test
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Dashboard */}
        {renderDashboard()}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Role-Based Dashboard Testing
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Test the role-based dashboard system by selecting a role and starting the test mode.
        Each role will show different navigation, features, and data based on their permissions.
      </Alert>

      <Grid container spacing={3}>
        {/* Test Configuration */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Configuration
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Select Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="staff">Staff Member</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleStartTest}
              >
                Start Testing
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role Features
              </Typography>
              
              {selectedRole === 'client' && (
                <Box>
                  <Chip label="Project Viewing" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Asset Access" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Team Messaging" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Project Requests" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Billing Info" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                </Box>
              )}
              
              {selectedRole === 'staff' && (
                <Box>
                  <Chip label="Task Management" color="secondary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Time Tracking" color="secondary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Asset Upload" color="secondary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Project Collaboration" color="secondary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Calendar View" color="secondary" size="small" sx={{ mr: 1, mb: 1 }} />
                </Box>
              )}
              
              {selectedRole === 'admin' && (
                <Box>
                  <Chip label="Team Management" color="error" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Client Management" color="error" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Project Oversight" color="error" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Analytics" color="error" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Billing Management" color="error" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="System Admin" color="error" size="small" sx={{ mr: 1, mb: 1 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Role Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Profile
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Test User Data:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(testUsers[selectedRole], null, 2)}
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Testing Features
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Role-Based Navigation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Different menu items and quick actions based on role
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Permission-Based UI
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Buttons and features show/hide based on permissions
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Data Filtering
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Users only see data they have access to
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Role-Specific Dashboards
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customized layout and content for each role
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleBasedDashboardTest;