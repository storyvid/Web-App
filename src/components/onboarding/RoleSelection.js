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
  Alert,
  TextField
} from '@mui/material';
import {
  Building as BusinessIcon,
  Users as TeamIcon,
  User as ClientIcon,
  ArrowRight as ArrowIcon
} from 'lucide-react';

const RoleSelection = ({ onRoleSelect, onSkip, loading = false, error = null }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const roles = [
    {
      id: 'client',
      title: 'Client Portal',
      subtitle: 'I need video production services',
      description: 'Commission video content, track project progress, and manage deliverables',
      icon: <ClientIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      color: 'primary'
    },
    {
      id: 'staff',
      title: 'Team Member', 
      subtitle: 'I work for a video production company',
      description: 'Collaborate on projects, manage assets, and communicate with clients',
      icon: <TeamIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      color: 'secondary'
    },
    {
      id: 'admin',
      title: 'Production Company',
      subtitle: 'I run a video production business',
      description: 'Oversee projects, manage teams, and handle client relationships',
      icon: <BusinessIcon sx={{ fontSize: 48, color: 'error.main' }} />,
      color: 'error'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setShowCompanyForm(true);
  };

  const handleCompanySubmit = () => {
    if (selectedRole && companyName.trim()) {
      onRoleSelect(selectedRole, companyName.trim());
    }
  };

  const handleBackToRoles = () => {
    setShowCompanyForm(false);
    setSelectedRole(null);
    setCompanyName('');
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>


      {!showCompanyForm ? (
        // Role Selection Step
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'stretch' }}>
            {roles.map((role) => (
              <Card
                key={role.id}
                sx={{
                  flex: 1,
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
                  <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {role.icon}
                    <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {role.subtitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mt: 1 }}>
                      {role.description}
                    </Typography>
                    {selectedRole === role.id && (
                      <Box sx={{ mt: 2 }}>
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
            ))}
          </Stack>
        </Box>
      ) : (
        // Company Form Step
        <Box sx={{ maxWidth: 400, mx: 'auto', flexGrow: 1 }}>
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              {roles.find(r => r.id === selectedRole)?.icon}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Company Name
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Company Name"
              placeholder="Enter your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={handleBackToRoles}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleCompanySubmit}
                disabled={!companyName.trim() || loading}
                sx={{ minWidth: 160 }}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {!showCompanyForm && (
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
          </Stack>
        </Box>
      )}

    </Container>
  );
};

export default RoleSelection;