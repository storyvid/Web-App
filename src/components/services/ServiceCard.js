import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const ServiceCard = ({ service, onActionClick }) => {
  const user = useSelector(selectUser);
  const { name, price, description, icon: Icon } = service;

  const getActionButtonText = () => {
    if (user?.role === 'admin') {
      return 'Create Project';
    }
    return 'Request Service';
  };

  return (
    <Card 
      sx={{ 
        width: 350, // FIXED WIDTH FOR ALL CARDS
        height: 380, // FIXED HEIGHT FOR ALL CARDS
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        border: '2px solid',
        borderColor: 'rgba(255, 197, 53, 0.2)', // Subtle brand color border
        margin: '0 auto', // Center the card in its grid item
        background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(255, 197, 53, 0.15), 0 4px 12px rgba(37, 99, 235, 0.1)',
          borderColor: '#FFC535', // StoryVid yellow on hover
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 3, // Consistent padding
          '&:last-child': {
            paddingBottom: 3 // Override MUI default
          }
        }}
      >
        {/* Icon */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #FFC535 0%, #FF8C42 100%)', // StoryVid gradient
              display: 'inline-flex',
              boxShadow: '0 4px 12px rgba(255, 197, 53, 0.3)',
              '& svg': {
                color: 'white'
              }
            }}
          >
            <Icon size={24} />
          </Box>
        </Box>

        {/* Service Name */}
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          {name}
        </Typography>

        {/* Price Chip */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Chip 
            label={price}
            size="small"
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #FFC535 0%, #FF8C42 100%)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(255, 197, 53, 0.2)',
              '& .MuiChip-label': {
                color: 'white'
              }
            }}
          />
        </Box>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            flex: 1,
            textAlign: 'center',
            lineHeight: 1.5
          }}
        >
          {description}
        </Typography>

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => onActionClick(service)}
          sx={{ 
            mt: 'auto',
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', // Deep blue gradient
            color: 'white',
            fontWeight: 600,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {getActionButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;