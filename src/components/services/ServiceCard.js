import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';

const ServiceCard = ({ service, onClick }) => {
  const IconComponent = service.icon;

  return (
    <Card 
      onClick={() => onClick(service)}
      sx={{
        width: 350,
        height: 380,
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.12)',
        borderRadius: 1,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        backgroundColor: 'white',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#FFC535',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <IconComponent sx={{ fontSize: 30, color: 'white' }} />
        </Box>
        
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {service.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            flexGrow: 1, 
            mb: 2,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {service.description}
        </Typography>
        
        <Typography 
          variant="h6" 
          fontWeight={600} 
          sx={{ 
            color: '#FFC535',
            mb: 2
          }}
        >
          {service.price}
        </Typography>
        
        <Button
          variant="contained"
          fullWidth
          sx={{ 
            mt: 'auto',
            backgroundColor: '#FFC535',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#FFB020',
            }
          }}
        >
          Request Service
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;