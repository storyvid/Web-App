import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import RoleSelection from './RoleSelection';

import { completeOnboarding } from '../../store/slices/authSlice';
import { setError } from '../../store/slices/uiSlice';
import { useAuth } from '../../contexts/AuthContext';

const OnboardingFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const user = useSelector(state => state.auth.user);
  const error = useSelector(state => state.ui.errors.global);

  const steps = ['Choose Your Role'];

  const handleRoleSelect = async (role, companyName) => {
    if (!user?.uid) {
      dispatch(setError({ section: 'global', error: 'User authentication required' }));
      return;
    }

    setLoading(true);
    setSelectedRole(role);
    
    try {
      // Complete onboarding with role and company information
      const result = await dispatch(completeOnboarding({
        uid: user.uid,
        profileData: {
          role: role,
          email: user.email,
          name: user.name || user.displayName || '',
          company: companyName || '',
          onboardingComplete: true,
          onboardedAt: new Date().toISOString()
        }
      })).unwrap();

      console.log('Onboarding completed, result:', result);

      // Navigate to the main dashboard (no role-specific routing)
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding completion error:', err);
      dispatch(setError({ 
        section: 'global', 
        error: err.message || 'Failed to complete onboarding. Please try again.' 
      }));
    } finally {
      setLoading(false);
    }
  };


  const handleSkipOnboarding = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Skip onboarding error:', error);
      // Force navigate even if logout fails
      navigate('/login');
    }
  };


  const renderStepContent = () => {
    return (
      <RoleSelection
        onRoleSelect={handleRoleSelect}
        onSkip={handleSkipOnboarding}
        loading={loading}
        error={error}
      />
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      {/* Progress Stepper */}
      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4, px: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" color="text.primary">
              Account Setup
            </Typography>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleSkipOnboarding}
              sx={{ color: '#666' }}
            >
              Back to Login
            </Button>
          </Box>
          <Typography variant="h5" align="center" sx={{ fontWeight: 500 }}>
            {steps[0]}
          </Typography>
        </Paper>
      </Box>

      {/* Step Content */}
      <Box>
        {renderStepContent()}
      </Box>
    </Box>
  );
};

export default OnboardingFlow;