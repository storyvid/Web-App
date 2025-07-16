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
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Welcome to StoryVid
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Choose your role to get started
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          We'll customize your dashboard and features based on how you plan to use StoryVid
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 }, flexGrow: 1, alignItems: 'stretch' }}>
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.id} sx={{ display: 'flex' }}>
            <Card
              sx={{
                width: '100%',
                border: selectedRole === role.id ? 2 : 1,
                borderColor: selectedRole === role.id ? `${role.color}.main` : 'divider',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                  borderColor: `${role.color}.main`
                }
              }}
            >
              <CardActionArea
                onClick={() => handleRoleSelect(role.id)}
                sx={{ height: '100%', p: 0 }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    {role.icon}
                    <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 1, fontWeight: 600 }}>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {role.subtitle}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.4 }}>
                    {role.description}
                  </Typography>

                  <Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                      {role.features.slice(0, 2).map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          variant="outlined"
                          color={selectedRole === role.id ? role.color : 'default'}
                        />
                      ))}
                      <Chip
                        label={`+${role.features.length - 2} more`}
                        size="small"
                        variant="outlined"
                        color={selectedRole === role.id ? role.color : 'default'}
                      />
                    </Stack>
                  </Box>

                  {selectedRole === role.id && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Chip
                        label="✓ Selected"
                        color={role.color}
                        variant="filled"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 'auto' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
          <Button
            variant="outlined"
            size="large"
            onClick={onSkip}
            disabled={loading}
            sx={{ minWidth: 140, py: 1.2, color: '#666', borderColor: '#E0E0E0' }}
          >
            Skip for Now
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            sx={{ minWidth: 180, py: 1.2 }}
          >
            {loading ? 'Setting up...' : 'Continue'}
          </Button>
        </Stack>

        {selectedRole && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>{roles.find(r => r.id === selectedRole)?.title}</strong> selected • You can change this later
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          Need help choosing?
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 3 }} justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            <strong>Client:</strong> Hire video services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Team Member:</strong> Work for production company
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Production Company:</strong> Own/manage business
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
};

export default RoleSelection;