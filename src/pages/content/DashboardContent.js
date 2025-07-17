import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Alert,
  Box
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { StatsCard, ProjectCard, MilestoneCard, TeamSection } from '../../components/DashboardComponents';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getRoleBasedData } from '../../data/mockData';

const DashboardContent = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get role-based data
      const roleData = getRoleBasedData(user?.role || 'client');
      
      // Merge with real user data
      const finalData = {
        ...roleData,
        user: {
          ...roleData.user,
          name: user?.name || roleData.user.name,
          company: user?.company || roleData.user.company,
          email: user?.email || roleData.user.email,
          avatar: user?.avatar || roleData.user.avatar,
          role: user?.role || roleData.user.role
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

  useEffect(() => {
    loadDashboardData();
  }, [user?.role, user?.name, user?.company, user?.email, user?.avatar, user?.uid]);

  const navigate = useNavigate();

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
        break;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!data) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load dashboard data. Please refresh the page.
      </Alert>
    );
  }

  return (
    <>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" fontWeight={600} gutterBottom>
          {data.user.role === 'admin' ? `Hi, ${data.user.name || 'Admin'}!` : 
           data.user.role === 'staff' ? `Hi, ${data.user.name || 'there'}!` : 
           `Hi, ${data.user.name || 'there'}!`}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.user.role === 'admin' ? 'Manage projects and oversee team performance' : 
           data.user.role === 'staff' ? 'Track your assigned projects and deadlines' : 
           `Here's what's happening with your projects today.`}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {data.stats && data.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={index} sx={{ width: { md: '30%', lg: '30%', xl: '30%' } }}>
            <StatsCard
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              seeAll={stat.seeAll}
              onSeeAllClick={() => handleSeeAllClick(stat.section)}
              statKey={stat.statKey}
            />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Projects Section */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {data.user.role === 'admin' ? 'Recent Projects' : 
             data.user.role === 'staff' ? 'Your Assigned Projects' : 
             'Current Productions'}
          </Typography>
          
          <Grid container spacing={2}>
            {data.projects && data.projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={project.id} sx={{ width: { md: '30%', lg: '30%', xl: '30%' } }}>
                <ProjectCard 
                  project={project} 
                  onClick={() => navigate(`/project/${project.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Today's Milestones */}
          {data.todaysMilestones && data.todaysMilestones.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Today's Milestones
              </Typography>
              <Grid container spacing={1}>
                {data.todaysMilestones.map((milestone) => (
                  <Grid item xs={12} key={milestone.id}>
                    <MilestoneCard milestone={milestone} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Team Section */}
          {data.team && (
            <TeamSection 
              title="Your Team" 
              items={data.team.members || data.team} 
              type="crew" 
            />
          )}

        </Grid>
      </Grid>
    </>
  );
};

export default DashboardContent;