import React from 'react';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';

const LoadingSpinner = ({ 
  size = 40, 
  message = 'Loading...', 
  fullScreen = false,
  minimal = false 
}) => {
  if (minimal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={size} />
      </Box>
    );
  }

  const containerSx = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    p: 3
  };

  return (
    <Box sx={containerSx}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress 
          size={size} 
          sx={{ color: 'primary.main' }}
        />
        {message && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            textAlign="center"
          >
            {message}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default LoadingSpinner;