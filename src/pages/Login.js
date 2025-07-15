import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Link, Divider, Alert, Fade, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';

// Superside-inspired theme
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signInWithGoogle, resetPassword, authLoading, error, clearError } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/dashboard';

  // Email validation
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

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
      if (emailError) setEmailError('');
    } else if (field === 'password') {
      setPassword(value);
      if (passwordError) setPasswordError('');
    }
    
    // Clear global errors when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Check if user needs onboarding
        if (!result.user?.onboardingComplete) {
          navigate('/onboarding');
        } else {
          navigate(from, { replace: true });
        }
      }
      // If result.success is false, error should already be in Redux state
    } catch (err) {
      console.error('Login error:', err);
      // Error handling is managed by Redux and AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google SSO
  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      clearError();
      
      const result = await signInWithGoogle();
      if (result.success) {
        // Check if user needs onboarding
        if (!result.user?.onboardingComplete) {
          navigate('/onboarding');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        // Handle failed Google login - error should already be in Redux state
        console.error('Google login failed:', result.error);
      }
    } catch (err) {
      console.error('Google login error:', err);
      // Error handling is managed by Redux and AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      const result = await resetPassword(email);
      if (result.success) {
        setResetEmailSent(true);
        setShowForgotPassword(false);
      } else {
        // Handle failed password reset - error should be in Redux state
        console.error('Password reset failed:', result.error);
      }
    } catch (err) {
      console.error('Password reset error:', err);
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
      case 'auth/user-not-found':
        return 'No account found with this email. Would you like to create one?';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a few minutes before trying again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method.';
      default:
        // Handle generic error messages
        if (error.message) {
          // Clean up Firebase error messages for better UX
          const message = error.message.toLowerCase();
          if (message.includes('password')) {
            return 'Invalid email or password. Please try again.';
          }
          if (message.includes('email')) {
            return 'Please enter a valid email address.';
          }
          if (message.includes('network')) {
            return 'Network error. Please check your connection and try again.';
          }
        }
        return 'Sign-in failed. Please check your credentials and try again.';
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072")', // Placeholder astronaut/space image
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
            backgroundColor: 'rgba(0, 0, 0, 0.3)', // Subtle overlay for better contrast
          },
        }}
      >

        {/* Login Card */}
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
                // Fallback to text logo if image fails
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
          
          {/* Debug error display */}
          {process.env.NODE_ENV === 'development' && error && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
              Debug: {JSON.stringify(error)}
            </Alert>
          )}

          {/* Success Alert for Password Reset */}
          {resetEmailSent && (
            <Fade in={resetEmailSent}>
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                onClose={() => setResetEmailSent(false)}
              >
                Password reset email sent! Check your inbox and follow the instructions.
              </Alert>
            </Fade>
          )}

          {!showForgotPassword && (
            <>
              {/* Google SSO Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
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
            </>
          )}

          {!showForgotPassword && (
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>
          )}

          {showForgotPassword ? (
            /* Password Reset Form */
            <Box>
              <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!emailError}
                helperText={emailError}
                disabled={isSubmitting}
                sx={{ mb: 3 }}
                size="small"
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handlePasswordReset}
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  backgroundColor: '#4A7C59',
                  '&:hover': {
                    backgroundColor: '#3D6A4A',
                  },
                  mb: 2
                }}
              >
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Email'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                  setEmailError('');
                }}
                disabled={isSubmitting}
                sx={{ color: '#4A7C59' }}
              >
                Back to Sign In
              </Button>
            </Box>
          ) : (
            /* Email/Password Form */
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!emailError}
                helperText={emailError}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                disabled={isSubmitting || authLoading}
                sx={{ mb: 2 }}
                size="small"
              />

              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}
                  disabled={isSubmitting}
                  sx={{
                    fontSize: '14px',
                    color: '#4A7C59',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Forgot your password?
                </Link>
              </Box>

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
                  'Log in'
                )}
              </Button>
            </Box>
          )}

          {!showForgotPassword && (
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 3, color: 'text.secondary' }}
            >
              No account?{' '}
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/signup');
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
                Create one
              </Link>
            </Typography>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;