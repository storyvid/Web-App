import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import firebaseService from '../services/firebase/firebaseService';
import { getRoleBasedData } from '../data/mockData';
import { ProjectCard, Sidebar, Header } from '../components/DashboardComponents';
import LoadingSpinner from '../components/LoadingSpinner';
import { theme, styles } from '../pages/dashboardStyles';

const ProjectsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [activeMenuItem, setActiveMenuItem] = useState('projects');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadProjects();
  }, [user?.role]);

  useEffect(() => {
    // Handle URL parameters for filtering
    const filter = searchParams.get('filter');
    if (filter) {
      setCurrentFilter(filter);
      setFilterOpen(true);
    }
  }, [searchParams]);

  const loadProjects = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      // Get dashboard data (same as dashboard)
      const dashboardData = await firebaseService.getDashboardData(user.role, user.uid);
      
      // Ensure user data is from the authenticated user
      const finalData = {
        ...dashboardData,
        user: {
          ...dashboardData.user,
          name: user.name || dashboardData.user?.name,
          company: user.company || dashboardData.user?.company,
          email: user.email || dashboardData.user?.email,
          avatar: user.avatar || dashboardData.user?.avatar
        }
      };
      
      setData(finalData);
      setProjects(finalData.projects || []);
      
    } catch (error) {
      console.error('Error loading projects:', error);
      
      // Fallback to mock data with real user info
      const roleData = getRoleBasedData(user?.role || 'client');
      const fallbackData = {
        ...roleData,
        user: {
          ...roleData.user,
          name: user?.name || roleData.user.name,
          company: user?.company || roleData.user.company,
          email: user?.email || roleData.user.email,
          avatar: user?.avatar || roleData.user.avatar
        }
      };
      
      setData(fallbackData);
      setProjects(fallbackData.projects || []);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemClick = (menuId) => {
    setActiveMenuItem(menuId);
    
    // Handle navigation based on menu item
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        // Stay on projects page
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'assets':
        // TODO: Add assets page
        console.log('Assets page not implemented yet');
        break;
      case 'services':
        // TODO: Add services page
        console.log('Services page not implemented yet');
        break;
      default:
        break;
    }
  };

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleMobileMenuClick = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter projects based on search term and current filter
  const filteredProjects = projects.filter(project => {
    // Search term filter
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesFilter = true;
    switch (currentFilter) {
      case 'pending-approvals':
        matchesFilter = project.nextMilestoneDetails?.status === 'pending_approval';
        break;
      case 'upcoming-deadlines':
        // Check if project has upcoming deadlines (within next 7 days)
        if (project.nextMilestoneDetails?.dueDate) {
          const dueDate = new Date(project.nextMilestoneDetails.dueDate);
          const now = new Date();
          const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          matchesFilter = daysDiff >= 0 && daysDiff <= 7;
        } else {
          matchesFilter = false;
        }
        break;
      case 'in-production':
        matchesFilter = project.status === 'in-production';
        break;
      case 'in-review':
        matchesFilter = project.status === 'in-review' || project.status === 'review';
        break;
      case 'completed':
        matchesFilter = project.status === 'completed';
        break;
      case 'all':
      default:
        matchesFilter = true;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getRoleTitle = (role) => {
    const titles = {
      client: 'My Projects',
      staff: 'Assigned Projects',
      admin: 'All Projects'
    };
    return titles[role] || 'Projects';
  };

  if (loading || !data) {
    return <LoadingSpinner fullScreen message="Loading projects..." />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={styles.dashboardContainer}>
        <Sidebar 
          activeItem={activeMenuItem} 
          onMenuItemClick={handleMenuItemClick}
          userRole={user?.role || 'client'}
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
              {/* Header */}
              <Box sx={{ mb: 4, mt: '-10px' }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  {getRoleTitle(user?.role)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user?.role === 'client' ? 'Manage and track your video projects' :
                   user?.role === 'staff' ? 'View your assigned projects and tasks' :
                   'Overview of all projects across clients'}
                </Typography>
              </Box>

              {/* Controls - Hidden as requested */}
              {/* <Paper sx={{ p: 2, mb: 3 }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <TextField
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    size="small"
                    sx={{ minWidth: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FilterIcon />}
                      onClick={() => setFilterOpen(!filterOpen)}
                    >
                      Filter
                    </Button>
                    
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={handleViewModeChange}
                      size="small"
                    >
                      <ToggleButton value="grid">
                        <GridIcon />
                      </ToggleButton>
                      <ToggleButton value="list">
                        <ListIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Stack>

                )}
              </Paper> */}

              {/* Projects Grid/List */}
              {filteredProjects.length === 0 ? (
                <Alert severity="info" sx={{ mt: 3 }}>
                  {searchTerm ? 'No projects found matching your search.' : 'No projects found.'}
                </Alert>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                  </Typography>
                  
                  <Box sx={styles.projectsGrid}>
                    {filteredProjects.map(project => (
                      <ProjectCard 
                        key={project.id}
                        project={project} 
                        onClick={handleProjectClick}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ProjectsList;