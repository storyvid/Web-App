import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Alert,
  Box
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectCard } from '../../components/DashboardComponents';
import LoadingSpinner from '../../components/LoadingSpinner';
import projectManagementService from '../../services/projectManagementService';

const ProjectsListContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // For admins, use project management service to get all projects
      // For clients/staff, fetch their actual assigned projects
      let userProjects = [];
      
      if (user?.role === 'admin') {
        // Admins see all projects from project management service
        try {
          userProjects = await projectManagementService.getAllProjects();
        } catch (error) {
          console.warn('Admin projects unavailable, showing empty:', error);
          userProjects = [];
        }
      } else if (user?.uid) {
        // Clients/staff only see their assigned projects
        try {
          console.log('🔍 DEBUG: ProjectsList fetching projects for user:', {
            uid: user.uid,
            email: user.email,
            role: user.role,
            name: user.name
          });
          userProjects = await projectManagementService.getProjectsByUser(user.uid);
          console.log('🔍 DEBUG: ProjectsList found projects for user:', userProjects);
        } catch (error) {
          console.warn('User projects unavailable, showing empty:', error);
          userProjects = [];
        }
      }
      
      // Merge with real user data - no mock data
      const finalData = {
        user: {
          name: user?.name || 'User',
          company: user?.company || '',
          email: user?.email || '',
          avatar: user?.avatar || '',
          role: user?.role || 'client'
        }
      };
      
      setData(finalData);
      setProjects(userProjects); // Use actual user projects
      
    } catch (error) {
      console.error('Error loading projects data:', error);
      
      // Fallback to minimal data with real user info - no mock data
      const fallbackData = {
        user: {
          name: user?.name || 'User',
          company: user?.company || '',
          email: user?.email || '',
          avatar: user?.avatar || '',
          role: user?.role || 'client'
        }
      };
      
      setData(fallbackData);
      setProjects([]); // Show empty projects on error
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