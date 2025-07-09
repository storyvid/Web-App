import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

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
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'error.50',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ErrorIcon sx={{ fontSize: 32, color: 'error.main' }} />
              </Box>
              
              <Stack spacing={1} textAlign="center">
                <Typography variant="h6" fontWeight={600}>
                  Something went wrong
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  sx={{ bgcolor: 'primary.main' }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </Stack>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    maxWidth: '100%',
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="caption" fontWeight={600} display="block" mb={1}>
                    Error Details (Development Mode):
                  </Typography>
                  <Typography variant="caption" display="block" color="error.main">
                    {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;