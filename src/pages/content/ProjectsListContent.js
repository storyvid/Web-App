import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Alert, Box } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { ProjectCard } from "../../components/DashboardComponents";
import LoadingSpinner from "../../components/LoadingSpinner";
import firebaseService from "../../services/firebase/firebaseService";

const ProjectsListContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    // Don't load data if user authentication is not ready
    if (!user || !user.uid || !user.role) {
      console.log('⏳ Waiting for user authentication to complete before loading projects...');
      return;
    }

    try {
      setLoading(true);
      console.log(`📋 Loading projects for authenticated user: ${user.email} (${user.role})`);

      // For admins, use project management service to get all projects
      // For clients/staff, fetch their actual assigned projects
      let userProjects = [];

      // FirebaseService doesn't need user context setup

      console.log("🔍 DEBUG: ProjectsList fetching projects for user:", {
        uid: user.uid,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      // Get all projects and filter based on role
      try {
        const allProjects = await firebaseService.getProjects();
        
        if (user.role === "admin") {
          userProjects = allProjects;
          console.log(`📊 Admin found ${userProjects.length} total projects`);
        } else if (user.role === 'client') {
          userProjects = allProjects.filter(project => project.clientId === user.uid);
          console.log(`👤 Client found ${userProjects.length} assigned projects`);
        } else if (user.role === 'staff') {
          // Staff ONLY see projects they are assigned to - NO fallback for security
          userProjects = allProjects.filter(project => 
            project.assignedStaff?.includes(user.uid) || 
            project.projectManager === user.uid
          );
          console.log(`👥 Staff found ${userProjects.length} assigned projects (out of ${allProjects.length} total)`);
        } else {
          userProjects = [];
        }
        
        console.log(
          "🔍 DEBUG: ProjectsList found projects for user:",
          userProjects
        );
      } catch (error) {
        console.warn("User projects unavailable, showing empty:", error);
        userProjects = [];
      }

      // Merge with real user data - no mock data
      const finalData = {
        user: {
          name: user?.name || "User",
          company: user?.company || "",
          email: user?.email || "",
          avatar: user?.avatar || "",
          role: user?.role || "client",
        },
      };

      setData(finalData);
      setProjects(userProjects); // Use actual user projects
    } catch (error) {
      console.error("Error loading projects data:", error);

      // Fallback to minimal data with real user info - no mock data
      const fallbackData = {
        user: {
          name: user?.name || "User",
          company: user?.company || "",
          email: user?.email || "",
          avatar: user?.avatar || "",
          role: user?.role || "client",
        },
      };

      setData(fallbackData);
      setProjects([]); // Show empty projects on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.role, user?.uid]); // Only depend on essential authentication fields

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleSeeAllClick = (section) => {
    console.log("See all clicked for:", section);
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
        <Grid item>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {data.user.role === "admin"
              ? "All Projects"
              : data.user.role === "staff"
              ? "Assigned Projects"
              : "Your Projects"}
          </Typography>

          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item key={project.id} style={{ width: "400px" }}>
                <ProjectCard
                  project={project}
                  onClick={() => handleProjectClick(project)}
                />
              </Grid>
            ))}
          </Grid>

          {projects.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.user.role === "admin"
                  ? "Create your first project to get started."
                  : "You haven't been assigned to any projects yet."}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectsListContent;
