import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Alert, Box } from "@mui/material";
import {
  Folder as FolderIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import {
  StatsCard,
  ProjectCard,
  MilestoneCard,
  TeamSection,
} from "../../components/DashboardComponents";
import LoadingSpinner from "../../components/LoadingSpinner";
import projectManagementService from "../../services/projectManagementService";
import { testProjectAssignment } from "../../utils/debugProjectAssignment";

const DashboardContent = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    // Don't load data if user authentication is not ready
    if (!user || !user.uid || !user.role) {
      console.log('⏳ Waiting for user authentication to complete before loading dashboard content...');
      return;
    }

    try {
      setLoading(true);
      console.log(`📊 Loading dashboard content for authenticated user: ${user.email} (${user.role})`);

      // Ensure projectManagementService has the current user context
      projectManagementService.setCurrentUser(user);

      // For admins, use project management service to get all projects
      // For clients/staff, fetch their actual assigned projects
      let userProjects = [];
      let totalUsers = 0;

      if (user.role === "admin") {
        // Admins see all projects from project management service
        try {
          userProjects = await projectManagementService.getAllProjects();
          // Also get all users for admin stats
          const allUsers = await projectManagementService.getAllUsers();
          totalUsers = allUsers.filter(
            (u) => u.role === "client" || u.role === "staff"
          ).length;
        } catch (error) {
          console.warn("Admin projects unavailable, showing empty:", error);
          userProjects = [];
        }
      } else if (user?.uid) {
        // Clients/staff only see their assigned projects
        try {
          console.log("🔍 DEBUG: Dashboard fetching projects for user:", {
            uid: user.uid,
            email: user.email,
            role: user.role,
            name: user.name,
          });
          userProjects = await projectManagementService.getProjectsByUser(
            user.uid
          );
          console.log(
            "🔍 DEBUG: Dashboard found projects for user:",
            userProjects
          );

          // If no projects found, run comprehensive debug test
          if (userProjects.length === 0 && user.email) {
            console.log(
              "🔍 DEBUG: No projects found, running comprehensive test..."
            );
            try {
              await testProjectAssignment(user.email);
            } catch (debugError) {
              console.error("Debug test failed:", debugError);
            }
          }
        } catch (error) {
          console.warn("User projects unavailable, showing empty:", error);
          userProjects = [];
        }
      }

      // Calculate real stats from user's actual projects
      const realStats = [];

      if (user?.role === "admin") {
        // Admin sees all projects
        realStats.push(
          {
            icon: GroupIcon,
            title: "Total Clients",
            value: totalUsers,
            subtitle: "Active accounts",
            seeAll: true,
            section: "totalClients",
            statKey: "totalClients",
          },
          {
            icon: FolderIcon,
            title: "Active Projects",
            value: userProjects.filter((p) => p.status === "in-progress")
              .length,
            subtitle: "In progress",
            seeAll: true,
            section: "activeProjects",
            statKey: "activeProjects",
          },
          {
            icon: ScheduleIcon,
            title: "Pending Approvals",
            value: userProjects.filter(
              (p) => p.status === "awaiting-feedback" || p.status === "review"
            ).length,
            subtitle: "Awaiting review",
            seeAll: true,
            section: "pendingApprovals",
            statKey: "pendingApprovals",
          }
        );
      } else {
        // Client/staff sees only their assigned projects
        realStats.push(
          {
            icon: FolderIcon,
            title: "My Projects",
            value: userProjects.length,
            subtitle: "Assigned to you",
            seeAll: true,
            section: "myProjects",
            statKey: "myProjects",
          },
          {
            icon: AssignmentIcon,
            title: "In Progress",
            value: userProjects.filter((p) => p.status === "in-progress")
              .length,
            subtitle: "Active work",
            seeAll: true,
            section: "inProgress",
            statKey: "inProgress",
          },
          {
            icon: CheckCircleIcon,
            title: "Completed",
            value: userProjects.filter((p) => p.status === "completed").length,
            subtitle: "Finished projects",
            seeAll: false,
            section: "completed",
            statKey: "completed",
          }
        );
      }

      // Merge with real user data
      const finalData = {
        user: {
          name: user?.name || "User",
          company: user?.company || "",
          email: user?.email || "",
          avatar: user?.avatar || "",
          role: user?.role || "client",
        },
        projects: userProjects, // Use actual user projects
        stats: realStats, // Use calculated stats from real data
        todaysMilestones: [], // No mock milestones for real accounts
        milestones: [], // No mock milestones for real accounts
        team: [], // No mock team for real accounts
        teamMembers: { projects: [], crew: [] }, // No mock team members
        recentActivity: [], // No mock activity
        activities: [], // No mock activities
        notifications: [], // No mock notifications
      };

      setData(finalData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);

      // Fallback to minimal data with real user info - no mock data
      const fallbackData = {
        user: {
          name: user?.name || "User",
          company: user?.company || "",
          email: user?.email || "",
          avatar: user?.avatar || "",
          role: user?.role || "client",
        },
        projects: [], // Show empty projects on error
        stats: [
          {
            icon: null,
            title: "My Projects",
            value: 0,
            subtitle: "No projects available",
            seeAll: false,
            section: "myProjects",
            statKey: "myProjects",
          },
        ],
        todaysMilestones: [],
        milestones: [],
        team: [],
        teamMembers: { projects: [], crew: [] },
        recentActivity: [],
        activities: [],
        notifications: [],
      };

      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.role, user?.uid]); // Only depend on essential authentication fields

  const navigate = useNavigate();

  const handleSeeAllClick = (section) => {
    console.log("See all clicked for:", section);

    // Navigate to appropriate pages based on section
    switch (section) {
      case "current-productions":
      case "myProjects":
      case "assignedTasks":
      case "activeProjects":
        navigate("/projects");
        break;
      case "pendingApprovals":
        // TODO: Navigate to approvals page or filter projects by pending approvals
        navigate("/projects?filter=pending-approvals");
        break;
      case "upcomingDeadlines":
        // TODO: Navigate to deadlines page or filter projects by upcoming deadlines
        navigate("/projects?filter=upcoming-deadlines");
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
          {data.user.role === "admin"
            ? `Hi, ${data.user.name || "Admin"}!`
            : data.user.role === "staff"
            ? `Hi, ${data.user.name || "there"}!`
            : `Hi, ${data.user.name || "there"}!`}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.user.role === "admin"
            ? "Manage projects and oversee team performance"
            : data.user.role === "staff"
            ? "Track your assigned projects and deadlines"
            : `Here's what's happening with your projects today.`}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {data.stats &&
          data.stats.map((stat, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              key={index}
              sx={{ width: { md: "30%", lg: "30%", xl: "30%" } }}
            >
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
        <Grid item>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {data.user.role === "admin"
              ? "Recent Projects"
              : data.user.role === "staff"
              ? "Your Assigned Projects"
              : "Current Productions"}
          </Typography>

          <Grid container spacing={2}>
            {data.projects &&
              data.projects.map((project) => (
                <Grid item key={project.id} style={{ width: "400px" }}>
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
          {/* Today's Milestones - Only show if there are real milestones */}
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

          {/* Team Section - Only show if there are real team members */}
          {data.team && data.team.length > 0 && (
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
