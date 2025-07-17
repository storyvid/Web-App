import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Alert,
  Box
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { StatsCard, ProjectCard, MilestoneCard, TeamSection, ActivityItem } from '../../components/DashboardComponents';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getRoleBasedData } from '../../data/mockData';

const ProjectsListContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
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
      setProjects(finalData.projects || []);
      
    } catch (error) {
      console.error('Error loading projects data:', error);
      
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

  useEffect(() => {
    loadDashboardData();
  }, [user?.role, user?.name, user?.company, user?.email, user?.avatar, user?.uid]);

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleSeeAllClick = (section) => {
    console.log('See all clicked for:', section);
  };

  if (loading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  if (!data) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load projects data. Please refresh the page.
      </Alert>
    );
  }

  return (
    <>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {data.user.role === 'admin' ? 'All Projects' : 
           data.user.role === 'staff' ? 'Your Projects' : 
           'Your Projects'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.user.role === 'admin' ? 'View and manage all projects across the organization' : 
           data.user.role === 'staff' ? 'Projects assigned to you and deadlines to track' : 
           `Track the progress of your current video projects.`}
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

      {/* Projects Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {data.user.role === 'admin' ? 'All Projects' : 
             data.user.role === 'staff' ? 'Assigned Projects' : 
             'Your Projects'}
          </Typography>
          
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={project.id} sx={{ width: { md: '30%', lg: '30%', xl: '30%' } }}>
                <ProjectCard 
                  project={project} 
                  onClick={() => handleProjectClick(project)}
                />
              </Grid>
            ))}
          </Grid>
          
          {projects.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.user.role === 'admin' 
                  ? 'Create your first project to get started.'
                  : 'You haven\'t been assigned to any projects yet.'
                }
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectsListContent;