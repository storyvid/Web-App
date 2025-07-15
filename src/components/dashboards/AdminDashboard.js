import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  Business as BusinessIcon,
  Group as TeamIcon,
  Assignment as ProjectIcon,
  AttachMoney as RevenueIcon,
  TrendingUp as AnalyticsIcon,
  PersonAdd as InviteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);
  const [companyStats, setCompanyStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load admin-specific data
    setTimeout(() => {
      setCompanyStats({
        totalProjects: 12,
        activeProjects: 8,
        totalTeamMembers: 15,
        totalClients: 25,
        monthlyRevenue: 125000,
        teamUtilization: 85
      });
      
      setProjects([
        {
          id: 1,
          name: 'Corporate Brand Video',
          client: 'Tech Innovators Inc',
          status: 'in_progress',
          progress: 65,
          assignedStaff: ['John D.', 'Sarah M.'],
          budget: 15000,
          dueDate: '2024-08-15'
        },
        {
          id: 2,
          name: 'Product Demo Series',
          client: 'StartupCo',
          status: 'review',
          progress: 90,
          assignedStaff: ['Mike R.', 'Lisa K.'],
          budget: 8000,
          dueDate: '2024-08-10'
        }
      ]);
      
      setTeamMembers([
        {
          id: 1,
          name: 'John Doe',
          position: 'Video Editor',
          status: 'active',
          currentProjects: 2,
          utilization: 90
        },
        {
          id: 2,
          name: 'Sarah Miller',
          position: 'Motion Graphics Designer',
          status: 'active',
          currentProjects: 1,
          utilization: 70
        }
      ]);
      
      setClients([
        {
          id: 1,
          name: 'Tech Innovators Inc',
          contact: 'Alex Johnson',
          activeProjects: 2,
          totalValue: 25000,
          lastContact: '2024-08-08'
        },
        {
          id: 2,
          name: 'StartupCo',
          contact: 'Maria Garcia',
          activeProjects: 1,
          totalValue: 8000,
          lastContact: '2024-08-07'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'primary';
      case 'review': return 'warning';
      case 'completed': return 'success';
      case 'planning': return 'info';
      case 'active': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading company dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {user?.adminProfile?.company?.name || 'Company'} Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Production Management Overview
        </Typography>
      </Box>

      {/* Company Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ProjectIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {companyStats.activeProjects}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TeamIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {companyStats.totalTeamMembers}
                  </Typography>
                  <Typography color="text.secondary">
                    Team Members
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {companyStats.totalClients}
                  </Typography>
                  <Typography color="text.secondary">
                    Clients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RevenueIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    ${(companyStats.monthlyRevenue / 1000).toFixed(0)}k
                  </Typography>
                  <Typography color="text.secondary">
                    Monthly Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {companyStats.teamUtilization}%
                  </Typography>
                  <Typography color="text.secondary">
                    Team Utilization
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Management Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Projects" />
          <Tab label="Team" />
          <Tab label="Clients" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Project Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
              >
                New Project
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell>
                        <Chip 
                          label={project.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress} 
                            sx={{ width: 60 }}
                          />
                          <Typography variant="body2">{project.progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{project.assignedStaff.join(', ')}</TableCell>
                      <TableCell>${project.budget.toLocaleString()}</TableCell>
                      <TableCell>{new Date(project.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button startIcon={<ViewIcon />} size="small">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Team Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<InviteIcon />}
                size="small"
              >
                Invite Member
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Current Projects</TableCell>
                    <TableCell>Utilization</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>
                        <Chip 
                          label={member.status.toUpperCase()}
                          color={getStatusColor(member.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{member.currentProjects}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={member.utilization} 
                            sx={{ width: 60 }}
                          />
                          <Typography variant="body2">{member.utilization}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button startIcon={<ViewIcon />} size="small">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Client Management
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Active Projects</TableCell>
                    <TableCell>Total Value</TableCell>
                    <TableCell>Last Contact</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>{client.activeProjects}</TableCell>
                      <TableCell>${client.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{new Date(client.lastContact).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button startIcon={<ViewIcon />} size="small">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Company Profile Info */}
      {user?.adminProfile?.company && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Company Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Company:</strong> {user.adminProfile.company.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Location:</strong> {user.adminProfile.company.location}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Team Size:</strong> {user.adminProfile.teamSize}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Services:</strong> {user.adminProfile.services?.slice(0, 2).join(', ')}
                {user.adminProfile.services?.length > 2 && ` +${user.adminProfile.services.length - 2} more`}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default AdminDashboard;