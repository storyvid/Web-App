import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Link, Divider, Alert, Fade, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';

// Same theme as Login page
const loginTheme = createTheme({
  palette: {
    primary: {
      main: '#4A7C59', // Green similar to the button
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
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
  },
});

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, signInWithGoogle, authLoading, error, clearError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/onboarding';

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global errors when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    
    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    };

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    try {
      const result = await signup(formData.name, formData.email, formData.password);
      if (result.success) {
        setSignupSuccess(true);
        
        // Redirect to onboarding after a brief delay
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);
      } else {
        // Handle failed signup - error should already be in Redux state
        console.error('Signup failed:', result.error);
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Error handling is managed by Redux and AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google SSO
  const handleGoogleSignup = async () => {
    try {
      setIsSubmitting(true);
      clearError();
      
      const result = await signInWithGoogle();
      if (result.success) {
        // Always redirect to onboarding for new users
        navigate('/onboarding');
      } else {
        // Handle failed Google signup - error should already be in Redux state
        console.error('Google signup failed:', result.error);
      }
    } catch (err) {
      console.error('Google signup error:', err);
      // Error handling is managed by Redux and AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // User-friendly error messages
  const getErrorMessage = (error) => {
    if (!error) return '';
    
    const errorCode = error.code || error;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Would you like to sign in instead?';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Account creation is currently disabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-up was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-up method.';
      case 'auth/credential-already-in-use':
        return 'This credential is already associated with a different account.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.';
      default:
        // Handle generic error messages
        if (error.message) {
          // Clean up Firebase error messages for better UX
          const message = error.message.toLowerCase();
          if (message.includes('password')) {
            return 'Password requirements not met. Please use at least 6 characters with uppercase, lowercase, and numbers.';
          }
          if (message.includes('email')) {
            return 'Please enter a valid email address.';
          }
          if (message.includes('network')) {
            return 'Network error. Please check your connection and try again.';
          }
          if (message.includes('already') || message.includes('exists')) {
            return 'An account with this email already exists. Try signing in instead.';
          }
        }
        return 'Account creation failed. Please check your information and try again.';
    }
  };

  if (signupSuccess) {
    return (
      <ThemeProvider theme={loginTheme}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '48px 40px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 1,
              textAlign: 'center'
            }}
          >
            <Box sx={{ mb: 4 }}>
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
                  color: 'primary.main'
                }}
              >
                StoryVid
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              Account created successfully! Redirecting to setup...
            </Alert>

            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        {/* Signup Card */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px 40px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* StoryVid Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/storyvid_logo.svg"
              alt="StoryVid"
              sx={{
                height: 48,
                mb: 1,
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <Typography
              variant="h4"
              align="center"
              sx={{
                display: 'none',
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              StoryVid
            </Typography>
          </Box>

          {error && (
            <Fade in={!!error}>
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => clearError()}>
                {getErrorMessage(error)}
              </Alert>
            </Fade>
          )}

          {/* Google SSO Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            disabled={isSubmitting}
            sx={{
              mb: 3,
              py: 1.5,
              borderColor: '#E0E0E0',
              color: '#333',
              '&:hover': {
                borderColor: '#CCCCCC',
                backgroundColor: '#F5F5F5',
              },
            }}
          >
            Continue with Google
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          {/* Signup Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Full Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isSubmitting || authLoading}
              sx={{ mb: 3 }}
              size="small"
            />

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSubmitting || authLoading}
              sx={{ mb: 3 }}
              size="small"
            />

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isSubmitting || authLoading}
              sx={{ mb: 3 }}
              size="small"
            />

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Confirm Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={isSubmitting || authLoading}
              sx={{ mb: 3 }}
              size="small"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting || authLoading}
              sx={{
                py: 1.5,
                backgroundColor: '#4A7C59',
                '&:hover': {
                  backgroundColor: '#3D6A4A',
                },
              }}
            >
              {isSubmitting || authLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: 'text.secondary' }}
          >
            Already have an account?{' '}
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              disabled={isSubmitting}
              sx={{
                color: '#4A7C59',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Signup;