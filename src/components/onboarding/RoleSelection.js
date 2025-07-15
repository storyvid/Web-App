import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Container,
  Grid,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  Business as BusinessIcon,
  Group as TeamIcon,
  Person as ClientIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const RoleSelection = ({ onRoleSelect, onSkip, loading = false, error = null }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'client',
      title: 'Client Portal',
      subtitle: 'I need video production services',
      description: 'Perfect for businesses and individuals who want to commission video content. Get matched with production teams, track project progress, and manage deliverables.',
      icon: <ClientIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      features: [
        'Project commissioning',
        'Team collaboration',
        'Asset management',
        'Progress tracking',
        'Billing & invoicing'
      ],
      color: 'primary'
    },
    {
      id: 'staff',
      title: 'Team Member',
      subtitle: 'I work for a video production company',
      description: 'For video editors, producers, and production team members. Collaborate on projects, manage assets, track time, and communicate with clients.',
      icon: <TeamIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      features: [
        'Project assignments',
        'Time tracking',
        'Asset collaboration',
        'Client communication',
        'Team coordination'
      ],
      color: 'secondary'
    },
    {
      id: 'admin',
      title: 'Production Company',
      subtitle: 'I run a video production business',
      description: 'For production company owners and managers. Oversee all projects, manage teams, handle client relationships, and analyze business performance.',
      icon: <BusinessIcon sx={{ fontSize: 48, color: 'error.main' }} />,
      features: [
        'Company management',
        'Team oversight',
        'Client relationships',
        'Business analytics',
        'Project coordination'
      ],
      color: 'error'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to StoryVid
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Choose your role to get started with the right experience
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We'll customize your dashboard and features based on how you plan to use StoryVid
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.id}>
            <Card
              sx={{
                height: '100%',
                border: selectedRole === role.id ? 2 : 1,
                borderColor: selectedRole === role.id ? `${role.color}.main` : 'divider',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardActionArea
                onClick={() => handleRoleSelect(role.id)}
                sx={{ height: '100%', p: 0 }}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    {role.icon}
                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 1 }}>
                      {role.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {role.subtitle}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {role.description}
                  </Typography>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Features:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {role.features.slice(0, 3).map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          variant="outlined"
                          color={selectedRole === role.id ? role.color : 'default'}
                        />
                      ))}
                      {role.features.length > 3 && (
                        <Chip
                          label={`+${role.features.length - 3} more`}
                          size="small"
                          variant="outlined"
                          color={selectedRole === role.id ? role.color : 'default'}
                        />
                      )}
                    </Stack>
                  </Box>

                  {selectedRole === role.id && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Chip
                        label="Selected"
                        color={role.color}
                        variant="filled"
                        size="small"
                      />
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={onSkip}
            disabled={loading}
            sx={{ minWidth: 150, py: 1.5, color: '#666', borderColor: '#E0E0E0' }}
          >
            Skip for Now
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            sx={{ minWidth: 200, py: 1.5 }}
          >
            {loading ? 'Setting up...' : 'Continue'}
          </Button>
        </Stack>

        {selectedRole && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You selected: <strong>{roles.find(r => r.id === selectedRole)?.title}</strong>
            <br />
            You can change this later in your profile settings.
          </Typography>
        )}
      </Box>

      <Paper sx={{ mt: 4, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Need help choosing?
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">
              <strong>Choose Client</strong> if you're looking to hire video production services for your business or personal projects.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">
              <strong>Choose Team Member</strong> if you're a video editor, producer, or work for a production company.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">
              <strong>Choose Production Company</strong> if you own or manage a video production business.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default RoleSelection;