import React from 'react';
import { Box, Typography, Button, Paper, Stack, Fade, Zoom, keyframes } from '@mui/material';
import { 
  AlertTriangle as ErrorIcon, 
  RefreshCw as RefreshIcon, 
  Home as HomeIcon,
  Frown as SadIcon 
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const isProduction = process.env.NODE_ENV === 'production';
      
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3
          }}
        >
          <Fade in={true} timeout={800}>
            <Paper
              elevation={12}
              sx={{
                p: { xs: 3, sm: 5 },
                textAlign: 'center',
                maxWidth: 600,
                bgcolor: 'background.paper',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative background elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  background: 'linear-gradient(45deg, rgba(103, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '50%',
                  zIndex: 0
                }}
              />
              
              <Stack spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Zoom in={true} timeout={1000}>
                  <Box
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      background: isProduction 
                        ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
                        : 'linear-gradient(135deg, #FFA726 0%, #FFB74D 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: `${keyframes`
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                      `} 2s ease-in-out infinite`,
                      boxShadow: isProduction 
                        ? '0 8px 32px rgba(255, 107, 107, 0.3)'
                        : '0 8px 32px rgba(255, 167, 38, 0.3)'
                    }}
                  >
                    {isProduction ? (
                      <SadIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white' }} />
                    ) : (
                      <ErrorIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white' }} />
                    )}
                  </Box>
                </Zoom>
                
                <Stack spacing={2} textAlign="center">
                  <Typography 
                    variant="h4" 
                    fontWeight={700}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {isProduction ? 'Oops! Something went wrong' : 'Development Error'}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      lineHeight: 1.6,
                      maxWidth: 400,
                      mx: 'auto'
                    }}
                  >
                    {isProduction 
                      ? "We're experiencing some technical difficulties. Don't worry, our team has been notified and we're working to fix this issue."
                      : "An error occurred during development. Check the console for more details."
                    }
                  </Typography>
                  
                  {isProduction && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}
                    >
                      Please try again in a few moments, or contact support if the problem persists.
                    </Typography>
                  )}
                </Stack>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ width: '100%', maxWidth: 400 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                    fullWidth
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      py: 1.5,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Try Again
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={() => window.location.href = '/dashboard'}
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      borderColor: 'rgba(102, 126, 234, 0.5)',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Go Home
                  </Button>
                </Stack>

                {/* Development-only error details */}
                {!isProduction && this.state.error && (
                  <Fade in={true} timeout={1200}>
                    <Box
                      sx={{
                        mt: 3,
                        p: 3,
                        bgcolor: 'rgba(255, 152, 0, 0.05)',
                        border: '1px solid rgba(255, 152, 0, 0.2)',
                        borderRadius: 2,
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        maxWidth: '100%',
                        overflow: 'auto',
                        maxHeight: 200
                      }}
                    >
                      <Typography variant="caption" fontWeight={600} display="block" mb={1} color="warning.main">
                        🔧 Development Error Details:
                      </Typography>
                      <Typography variant="caption" display="block" color="error.main" sx={{ wordBreak: 'break-word' }}>
                        {this.state.error.toString()}
                      </Typography>
                      {this.state.errorInfo && (
                        <Typography variant="caption" display="block" mt={1} color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      )}
                    </Box>
                  </Fade>
                )}
              </Stack>
            </Paper>
          </Fade>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;