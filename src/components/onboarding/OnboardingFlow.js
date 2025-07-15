import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Stepper, Step, StepLabel, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import RoleSelection from './RoleSelection';
import ClientProfileSetup from './ClientProfileSetup';
import StaffProfileSetup from './StaffProfileSetup';
import AdminProfileSetup from './AdminProfileSetup';

import { completeOnboarding } from '../../store/slices/authSlice';
import { setError } from '../../store/slices/uiSlice';

const OnboardingFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const user = useSelector(state => state.auth.user);
  const error = useSelector(state => state.ui.errors.global);

  const steps = ['Choose Role', 'Profile Setup', 'Complete'];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProfileComplete = async (profileData) => {
    if (!user?.uid) {
      dispatch(setError({ section: 'global', error: 'User authentication required' }));
      return;
    }

    setLoading(true);
    
    try {
      // Complete onboarding with role-specific profile data
      await dispatch(completeOnboarding({
        uid: user.uid,
        profileData: {
          ...profileData,
          onboardingComplete: true,
          onboardedAt: new Date().toISOString()
        }
      })).unwrap();

      // Navigate to appropriate dashboard based on role
      switch (profileData.role) {
        case 'client':
          navigate('/dashboard?view=client');
          break;
        case 'staff':
          navigate('/dashboard?view=staff');
          break;
        case 'admin':
          navigate('/dashboard?view=admin');
          break;
        default:
          navigate('/dashboard');
      }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <RoleSelection
            onRoleSelect={handleRoleSelect}
            loading={loading}
            error={error}
          />
        );
      case 1:
        switch (selectedRole) {
          case 'client':
            return (
              <ClientProfileSetup
                onComplete={handleProfileComplete}
                onBack={handleBack}
                loading={loading}
                error={error}
              />
            );
          case 'staff':
            return (
              <StaffProfileSetup
                onComplete={handleProfileComplete}
                onBack={handleBack}
                loading={loading}
                error={error}
              />
            );
          case 'admin':
            return (
              <AdminProfileSetup
                onComplete={handleProfileComplete}
                onBack={handleBack}
                loading={loading}
                error={error}
              />
            );
          default:
            return (
              <RoleSelection
                onRoleSelect={handleRoleSelect}
                loading={loading}
                error={error}
              />
            );
        }
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      {/* Progress Stepper */}
      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4, px: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
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