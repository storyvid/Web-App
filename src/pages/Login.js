import React from 'react';
import { Box, Typography, TextField, Button, Link, Divider, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  const { login, authLoading, error, clearError } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleInputChange = () => {
    if (error) {
      clearError();
    }
  };

  // Placeholder functions for social login
  const handleGoogleLogin = () => {
    console.log('Google login not implemented');
  };

  const handleSSOLogin = () => {
    console.log('SSO login not implemented');
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
        {/* Logo */}
        <Typography
          variant="h4"
          sx={{
            position: 'absolute',
            top: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontWeight: 700,
            zIndex: 2,
          }}
        >
          Superside
        </Typography>

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
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ mb: 4, fontWeight: 600 }}
          >
            Log in
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Social Login Buttons */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              mb: 2,
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

          <Button
            fullWidth
            variant="outlined"
            onClick={handleSSOLogin}
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
            Continue with SSO
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          {/* Email/Password Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                handleInputChange();
              }}
              disabled={authLoading}
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
              onChange={(e) => {
                setPassword(e.target.value);
                handleInputChange();
              }}
              disabled={authLoading}
              sx={{ mb: 2 }}
              size="small"
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                href="#"
                underline="hover"
                sx={{
                  fontSize: '14px',
                  color: '#4A7C59',
                }}
              >
                Forgot your password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={authLoading}
              sx={{
                py: 1.5,
                backgroundColor: '#4A7C59',
                '&:hover': {
                  backgroundColor: '#3D6A4A',
                },
              }}
            >
              {authLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: 'text.secondary' }}
          >
            No account?{' '}
            <Link
              href="#"
              underline="hover"
              sx={{
                color: '#4A7C59',
                fontWeight: 500,
              }}
            >
              Create one
            </Link>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;