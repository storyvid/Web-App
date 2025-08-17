import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientCard = styled(Card)(({ theme }) => ({
  width: 350, // FIXED WIDTH FOR ALL CARDS
  height: 380, // FIXED HEIGHT FOR ALL CARDS
  border: '2px solid',
  borderColor: 'rgba(255, 197, 53, 0.2)', // Subtle brand color border
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, rgba(255, 197, 53, 0.05) 0%, rgba(255, 140, 66, 0.05) 100%)',
  '&:hover': {
    borderColor: '#FFC535',
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 25px rgba(255, 197, 53, 0.2)`,
  },
}));

const IconContainer = styled(Box)({
  width: 60,
  height: 60,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #FFC535 0%, #FF8C42 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
  '& svg': {
    fontSize: 30,
    color: 'white',
  },
});

const ServiceButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFC535 0%, #FF8C42 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: theme.spacing(1),
  textTransform: 'capitalize',
  fontSize: '1rem',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFB020 0%, #FF7A30 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(255, 197, 53, 0.3)',
  },
}));

const ServiceCard = ({ service, onClick }) => {
  const IconComponent = service.icon;

  return (
    <GradientCard onClick={() => onClick(service)}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <IconContainer>
          <IconComponent />
        </IconContainer>
        
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#333' }}>
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
          fontWeight={700} 
          sx={{ 
            color: '#FF8C42',
            mb: 2
          }}
        >
          {service.price}
        </Typography>
        
        <ServiceButton
          variant="contained"
          fullWidth
          sx={{ mt: 'auto' }}
        >
          Request Service
        </ServiceButton>
      </CardContent>
    </GradientCard>
  );
};

export default ServiceCard;