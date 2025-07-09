import React, { useState, useEffect } from 'react';
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
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { theme, styles } from './dashboardStyles';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedData } from '../data/mockData';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Sidebar, 
  Header, 
  StatsCard, 
  ProjectCard, 
  MilestoneCard, 
  TeamSection, 
  ActivityItem 
} from '../components/DashboardComponents';


// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const roleData = getRoleBasedData(user?.role || 'client');
        setData(roleData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.role]);

  const handleMenuItemClick = (menuId) => {
    setActiveMenuItem(menuId);
    console.log('Navigation to:', menuId);
    // Add navigation logic here - could use React Router
  };

  const handleSeeAllClick = (section) => {
    console.log('See all clicked for:', section);
    // Add navigation logic to detailed view
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
        { key: 'deliveredVideos', title: 'Delivered Videos', subtitle: 'completed' }
      ],
      staff: [
        { key: 'assignedTasks', title: 'Assigned Tasks', subtitle: 'active' },
        { key: 'completedToday', title: 'Completed Today', subtitle: 'tasks' },
        { key: 'upcomingDeadlines', title: 'Upcoming Deadlines', subtitle: 'this week' }
      ],
      admin: [
        { key: 'totalClients', title: 'Total Clients', subtitle: 'active' },
        { key: 'activeProjects', title: 'Active Projects', subtitle: 'in progress' },
        { key: 'teamMembers', title: 'Team Members', subtitle: 'available' }
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
        mainSection: "My Productions",
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
        />
        
        <Box sx={styles.mainContent}>
          <Header 
            user={data.user} 
            notifications={data.notifications}
            onMobileMenuClick={handleMobileMenuClick}
          />
          
          <Box sx={styles.contentWrapper}>
            <Box sx={styles.leftContent}>
              <Box mb={4}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Hi, {data.user.name}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {roleContent.welcome}
                </Typography>
              </Box>
              
              <Box sx={styles.statsGrid}>
                {statsConfig.map((stat, index) => (
                  <StatsCard
                    key={stat.key}
                    icon={index === 0 ? FolderIcon : index === 1 ? CheckCircleIcon : FolderIcon}
                    title={stat.title}
                    value={data.stats[stat.key]}
                    subtitle={stat.subtitle}
                    seeAll
                    onSeeAllClick={() => handleSeeAllClick(stat.key)}
                  />
                ))}
              </Box>
              
              <Box mb={4}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
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
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </Box>
              </Box>
              
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    {roleContent.milestonesSection}
                  </Typography>
                  <Button 
                    size="small" 
                    sx={styles.seeAllButton}
                    onClick={() => handleSeeAllClick('milestones')}
                  >
                    See all
                  </Button>
                </Stack>
                
                <Box sx={styles.milestonesGrid}>
                  {data.milestones.slice(0, 6).map(milestone => (
                    <MilestoneCard key={milestone.id} milestone={milestone} />
                  ))}
                </Box>
              </Box>
            </Box>
            
            <Box sx={styles.rightPanel}>
              <TeamSection 
                title={roleContent.teamTitle} 
                items={data.teamMembers.projects} 
                type="projects" 
              />
              
              <TeamSection 
                title={roleContent.crewTitle} 
                items={data.teamMembers.crew} 
                type="crew" 
              />
              
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Recent Activity
                </Typography>
                <Stack spacing={0.5}>
                  {data.activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Export the styles separately
export { theme, styles };

export default Dashboard;