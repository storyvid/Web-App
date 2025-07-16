import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { useAuth } from '../contexts/AuthContext';

// Same theme as Login/Signup pages for consistency
const onboardingTheme = createTheme({
  palette: {
    primary: {
      main: '#4A7C59',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '24px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#F5F5F5',
            '& fieldset': {
              border: '1px solid #E0E0E0',
            },
            '&:hover fieldset': {
              borderColor: '#CCCCCC',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4A7C59',
              borderWidth: '1px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': {
              color: '#4A7C59',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleExitOnboarding = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigate even if logout fails
      navigate('/login');
    }
  };

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: { pathname: '/onboarding' } }
      });
      return;
    }

    // Redirect if user has already completed onboarding
    if (user?.onboardingComplete) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render anything if user is not authenticated or onboarding is complete
  if (!isAuthenticated || user?.onboardingComplete) {
    return null;
  }

  return (
    <ThemeProvider theme={onboardingTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
            {/* Exit Button */}
            <Button
              variant="outlined"
              startIcon={<ExitToAppIcon />}
              onClick={handleExitOnboarding}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                borderColor: '#E0E0E0',
                color: '#666',
                '&:hover': {
                  borderColor: '#CCCCCC',
                  backgroundColor: '#F5F5F5',
                },
              }}
            >
              Exit Setup
            </Button>
            <Box
              component="img"
              src="/storyvid_logo.svg"
              alt="StoryVid"
              sx={{
                height: 48,
                mb: 2,
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <Typography
              variant="h4"
              sx={{
                display: 'none',
                fontWeight: 600,
                color: 'primary.main',
                mb: 1
              }}
            >
              StoryVid
            </Typography>
            <Typography
              variant="h5"
              color="text.primary"
              gutterBottom
            >
              Welcome to StoryVid
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Choose your role to get started with the right experience
            </Typography>
          </Box>

          {/* Onboarding Flow */}
          <OnboardingFlow />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Onboarding;