import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TimelineManager from '../components/Admin/TimelineManager';
import projectManagementService from '../services/projectManagementService';
import LoadingSpinner from '../components/LoadingSpinner';

const MilestoneDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await projectManagementService.getProject(projectId);
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return <LoadingSpinner message="Loading project timeline..." />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Back Navigation */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={600}>
          {project?.name ? `${project.name} - Timeline` : 'Project Timeline'}
        </Typography>
      </Stack>

      {/* Timeline Manager Component */}
      <TimelineManager 
        projectId={projectId}
        projectName={project?.name || 'Project'}
        onClose={handleBack}
      />
    </Box>
  );
};

export default MilestoneDetail;