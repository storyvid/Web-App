import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Stack,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import {
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  PlayCircle as PlayCircleIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { theme, styles } from './dashboardStyles';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedData } from '../data/mockData';
import LoadingSpinner from '../components/LoadingSpinner';
import firebaseService from '../services/firebase/firebaseService';
import { 
  Sidebar, 
  Header, 
  StatsCard, 
  ProjectCard, 
  MilestoneCard, 
  TeamSection, 
  ActivityItem 
} from '../components/DashboardComponents';
import MilestoneWidget from '../components/dashboard/MilestoneWidget';
import RecentFilesWidget from '../components/dashboard/RecentFilesWidget';


// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Don't load data if user authentication is not ready
      if (!user || !user.uid || !user.role) {
        console.log('⏳ Waiting for user authentication to complete before loading dashboard...');
        // Keep loading state true while waiting for auth
        setLoading(true);
        return;
      }
      
      setLoading(true);
      try {
        console.log(`📊 Loading dashboard data for ${user.email} with role ${user.role}`);
        
        // Ensure firebaseService has the current user context
        firebaseService.currentUser = user;
        
        // Try to get real Firebase data first
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
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        
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
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.role, user?.name, user?.company, user?.email, user?.avatar, user?.uid]);

  const handleMenuItemClick = (menuId) => {
    setActiveMenuItem(menuId);
    console.log('Navigation to:', menuId);
    
    // Handle navigation based on menu item
    switch (menuId) {
      case 'settings':
        navigate('/settings');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'admin-projects':
        navigate('/admin/projects');
        break;
      case 'admin-users':
        navigate('/admin/users');
        break;
      case 'assets':
        navigate('/assets');
        break;
      case 'services':
        navigate('/services');
        break;
      case 'dashboard':
      default:
        // Stay on dashboard
        break;
    }
  };

  const handleSeeAllClick = (section) => {
    console.log('See all clicked for:', section);
    
    // Navigate to appropriate pages based on section
    switch (section) {
      case 'current-productions':
      case 'myProjects':
      case 'assignedTasks':
      case 'activeProjects':
        navigate('/projects');
        break;
      case 'pendingApprovals':
        // TODO: Navigate to approvals page or filter projects by pending approvals
        navigate('/projects?filter=pending-approvals');
        break;
      case 'upcomingDeadlines':
        // TODO: Navigate to deadlines page or filter projects by upcoming deadlines
        navigate('/projects?filter=upcoming-deadlines');
        break;
      default:
        navigate('/projects');
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

  // Role-specific stats configuration
  const getStatsConfig = (role) => {
    const configs = {
      client: [
        { key: 'myProjects', title: 'My Projects', subtitle: 'videos' },
        { key: 'pendingApprovals', title: 'Pending Approvals', subtitle: 'reviews' },
        { key: 'deliveredVideos', title: 'Delivered Assets', subtitle: 'completed' }
      ],
      staff: [
        { key: 'assignedTasks', title: 'Assigned Tasks', subtitle: 'active' },
        { key: 'completedToday', title: 'Completed Today', subtitle: 'tasks' },
        { key: 'upcomingDeadlines', title: 'Upcoming Deadlines', subtitle: 'this week' }
      ],
      admin: [
        { key: 'totalClients', title: 'Total Clients', subtitle: 'active' },
        { key: 'activeProjects', title: 'Active Projects', subtitle: 'in progress' },
        { key: 'pendingApprovals', title: 'Pending Approvals', subtitle: 'awaiting review' },
        { key: 'upcomingDeadlines', title: 'Upcoming Deadlines', subtitle: 'this week' }
      ]
    };
    return configs[role] || configs.client;
  };

  const statsConfig = getStatsConfig(user?.role || 'client');

  // Role-specific content
  const getRoleContent = (role) => {
    const content = {
      client: {
        welcome: "Here's your video production overview.",
        mainSection: "Projects",
        milestonesSection: "My Milestones", 
        teamTitle: "My Team",
        crewTitle: "Production Crew"
      },
      staff: {
        welcome: "Here are your assigned tasks and deadlines.",
        mainSection: "Assigned Projects",
        milestonesSection: "My Tasks & Deadlines",
        teamTitle: "Client Projects", 
        crewTitle: "Team Members"
      },
      admin: {
        welcome: "Overview of all clients, projects, and team performance.",
        mainSection: "All Projects",
        milestonesSection: "Upcoming Deadlines",
        teamTitle: "All Clients",
        crewTitle: "Full Team"
      }
    };
    return content[role] || content.client;
  };

  const roleContent = getRoleContent(user?.role || 'client');
  
  if (loading || !data) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
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
              <Box mb={4} sx={{ mt: '-10px' }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  Hi, {data.user.name}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {roleContent.welcome}
                </Typography>
              </Box>
              
              <Box sx={styles.statsGrid}>
                {statsConfig.map((stat, index) => {
                  // Enhanced icon mapping for different stat types
                  const getStatIcon = (statKey) => {
                    const iconMap = {
                      myProjects: FolderIcon,
                      pendingApprovals: NotificationsIcon,
                      deliveredVideos: PlayCircleIcon,
                      assignedTasks: AssignmentIcon,
                      completedToday: CheckCircleIcon,
                      upcomingDeadlines: ScheduleIcon,
                      totalClients: PeopleIcon,
                      activeProjects: FolderIcon,
                      teamMembers: PeopleIcon
                    };
                    return iconMap[statKey] || FolderIcon;
                  };

                  const StatIcon = getStatIcon(stat.key);
                  
                  return (
                    <StatsCard
                      key={stat.key}
                      icon={StatIcon}
                      title={stat.title}
                      value={data.stats[stat.key]}
                      subtitle={stat.subtitle}
                      seeAll
                      onSeeAllClick={() => handleSeeAllClick(stat.key)}
                      statKey={stat.key}
                    />
                  );
                })}
              </Box>
              
              <Box mb={4}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight={600}>
                    {roleContent.mainSection}
                  </Typography>
                  <Button 
                    size="small" 
                    sx={styles.seeAllButton}
                    onClick={() => handleSeeAllClick('current-productions')}
                  >
                    See all
                  </Button>
                </Stack>
                
                <Box sx={styles.projectsGrid}>
                  {data.projects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onClick={handleProjectClick}
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Milestone and Files Widgets */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <MilestoneWidget
                  title="Upcoming Milestones"
                  maxItems={4}
                  showProjectName={true}
                  onMilestoneClick={(milestone) => {
                    navigate(`/project/${milestone.projectId}?tab=1`);
                  }}
                />
                
                <RecentFilesWidget
                  title="Recent Files"
                  maxItems={4}
                  showProjectName={true}
                  onFileClick={(file) => {
                    navigate(`/project/${file.projectId}?tab=2`);
                  }}
                  onViewAll={() => {
                    // Navigate to a general files page or dashboard with files focus
                    console.log('Navigate to all files');
                  }}
                />
              </Box>
            </Box>
            
            {/* Right sidebar hidden */}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Export the styles separately
export { theme, styles };

export default Dashboard;