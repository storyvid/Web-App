import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';

const ServicesTest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const testUsers = [
    {
      id: 'client1',
      email: 'client@test.com',
      name: 'Test Client',
      role: 'client',
      onboardingComplete: true,
      clientProfile: {
        company: 'Test Company',
        industry: 'Technology'
      }
    },
    {
      id: 'admin1',
      email: 'admin@test.com', 
      name: 'Test Admin',
      role: 'admin',
      onboardingComplete: true
    },
    {
      id: 'staff1',
      email: 'staff@test.com',
      name: 'Test Staff',
      role: 'staff',
      onboardingComplete: true,
      staffProfile: {
        position: 'Video Editor'
      }
    }
  ];

  const loginAs = (testUser) => {
    dispatch(setUser(testUser));
    navigate('/dashboard');
  };

  const testNavigation = () => {
    navigate('/services');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Services Page Test Suite
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current User: {user ? `${user.name} (${user.role})` : 'Not logged in'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Different User Roles
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {testUsers.map(testUser => (
            <Button
              key={testUser.id}
              variant="outlined"
              onClick={() => loginAs(testUser)}
            >
              Login as {testUser.role}
            </Button>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Navigation Tests
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={testNavigation}>
            Go to Services Page
          </Button>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Expected Behavior
        </Typography>
        <Typography variant="body2" component="ul">
          <li>Client users: Should see Services in nav, can request services</li>
          <li>Admin users: Should see Services in nav, can create projects directly</li>
          <li>Staff users: Should NOT see Services in nav, redirected if accessing directly</li>
          <li>Services page should load properly on navigation and refresh</li>
          <li>Modals should open when clicking service cards</li>
        </Typography>
      </Paper>
    </Container>
  );
};

export default ServicesTest;