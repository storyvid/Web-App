import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Avatar,
  Stack,
  Button,
  Alert,
  ThemeProvider,
  CssBaseline,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  AssignmentInd as RoleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { Sidebar, Header } from '../components/DashboardComponents';
import projectManagementService from '../services/projectManagementService';
import { theme, styles } from './dashboardStyles';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Layout state
  const [activeMenuItem, setActiveMenuItem] = useState('admin-users');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Data state
  const [users, setUsers] = useState([]);
  const [userProjects, setUserProjects] = useState({});
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data for header
  const [data] = useState({
    user: user || {},
    notifications: []
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const usersData = await projectManagementService.getAllUsers();
      setUsers(usersData);
      
      // Load project counts for each user
      const projectCounts = {};
      await Promise.all(
        usersData.map(async (userData) => {
          try {
            const projects = await projectManagementService.getProjectsByUser(userData.uid);
            projectCounts[userData.uid] = {
              total: projects.length,
              active: projects.filter(p => p.status === 'in-progress').length,
              completed: projects.filter(p => p.status === 'completed').length
            };
          } catch (err) {
            console.error(`Error loading projects for user ${userData.uid}:`, err);
            projectCounts[userData.uid] = { total: 0, active: 0, completed: 0 };
          }
        })
      );
      
      setUserProjects(projectCounts);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemClick = (menuId) => {
    setActiveMenuItem(menuId);
    
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'admin-projects':
        navigate('/admin/projects');
        break;
      case 'admin-users':
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const handleMobileMenuClick = () => setMobileOpen(true);
  const handleMobileClose = () => setMobileOpen(false);

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      staff: 'warning',
      client: 'primary'
    };
    return colors[role] || 'default';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Unknown';
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'name' || sortBy === 'email') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  // Calculate user statistics
  const userStats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    clients: users.filter(u => u.role === 'client').length
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading users..." />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={styles.dashboardContainer}>
        <Sidebar 
          activeItem={activeMenuItem} 
          onMenuItemClick={handleMenuItemClick}
          userRole={user?.role || 'admin'}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
          user={user}
        />
        
        <Box sx={styles.mainContent}>
          <Header 
            user={data.user} 
            notifications={data.notifications}
            onMobileMenuClick={handleMobileMenuClick}
          />
          
          <Box sx={styles.contentWrapper}>
            <Box sx={styles.leftContent}>
              {/* Page Header */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h4" fontWeight={700}>
                    User Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={loadData}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  View and manage all users in your organization
                </Typography>
              </Box>

              {/* Alerts */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        {userStats.totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" fontWeight={700}>
                        {userStats.clients}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Clients
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" fontWeight={700}>
                        {userStats.staff}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Staff Members
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main" fontWeight={700}>
                        {userStats.admins}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administrators
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Users Table */}
              <Card>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} mb={3}>
                    All Users
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'name'}
                              direction={sortOrder}
                              onClick={() => {
                                setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                                setSortBy('name');
                              }}
                            >
                              User
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'email'}
                              direction={sortOrder}
                              onClick={() => {
                                setSortOrder(sortBy === 'email' && sortOrder === 'asc' ? 'desc' : 'asc');
                                setSortBy('email');
                              }}
                            >
                              Email
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'role'}
                              direction={sortOrder}
                              onClick={() => {
                                setSortOrder(sortBy === 'role' && sortOrder === 'asc' ? 'desc' : 'asc');
                                setSortBy('role');
                              }}
                            >
                              Role
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>Company</TableCell>
                          <TableCell>Projects</TableCell>
                          <TableCell>Joined</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedUsers.map((userData) => (
                          <TableRow key={userData.uid} hover>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar src={userData.avatar} sx={{ width: 40, height: 40 }}>
                                  <PersonIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {userData.name || 'Unknown'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ID: {userData.uid?.slice(0, 8)}...
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {userData.email || 'No email'}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={userData.role?.toUpperCase() || 'UNKNOWN'}
                                color={getRoleColor(userData.role)}
                                size="small"
                                icon={<RoleIcon />}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <BusinessIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {userData.company || 'Not specified'}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {userProjects[userData.uid]?.total || 0} total
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {userProjects[userData.uid]?.active || 0} active, {userProjects[userData.uid]?.completed || 0} completed
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(userData.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={userData.onboardingComplete ? 'Active' : 'Pending'}
                                color={userData.onboardingComplete ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {users.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        No users found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Users will appear here as they join your organization.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminUsers;