import React from 'react';
import { Box, Paper, Typography, TextField, Button, Container, Alert, CircularProgress, ThemeProvider, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTheme } from '@mui/material/styles';

// Login-specific theme with StoryVid yellow as primary
const loginTheme = createTheme({
  palette: {
    primary: {
      main: '#FFC535', // StoryVid yellow as primary
      light: '#FFF4D6',
      dark: '#E6B030',
      contrastText: '#000000', // Black text on yellow
    },
    secondary: {
      main: '#6B7280', // Neutral gray
      light: '#F3F4F6',
      dark: '#374151',
    },
    error: {
      main: '#EF4444',
      light: '#FEF2F2',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h5: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        contained: {
          backgroundColor: '#FFC535',
          color: '#000000',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#E6B030',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
          '&:disabled': {
            backgroundColor: '#F3F4F6',
            color: '#9CA3AF',
          }
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused fieldset': {
              borderColor: '#FFC535',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#FFC535',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
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

  return (
    <ThemeProvider theme={loginTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            StoryVid Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              disabled={authLoading}
              onChange={(e) => {
                setEmail(e.target.value);
                handleInputChange();
              }}
              error={error && !email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              disabled={authLoading}
              onChange={(e) => {
                setPassword(e.target.value);
                handleInputChange();
              }}
              error={error && !password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={authLoading}
              sx={{ mt: 3, mb: 2, position: 'relative' }}
            >
              {authLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Demo accounts: client@test.com, staff@test.com, admin@test.com
          </Typography>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;