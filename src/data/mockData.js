// Role-Specific Mock Data for StoryVid Dashboard

export const getRoleBasedData = (userRole) => {
  const baseUser = {
    client: {
      name: "Alex",
      role: "client",
      avatar: "https://i.pravatar.cc/150?img=1",
      company: "Tech Innovators Inc",
      accountType: "Premium Client"
    },
    staff: {
      name: "Jordan",
      role: "staff", 
      avatar: "https://i.pravatar.cc/150?img=2",
      company: "StoryVid Team",
      accountType: "Video Editor"
    },
    admin: {
      name: "Sam",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?img=3", 
      company: "StoryVid",
      accountType: "Production Manager"
    }
  };

  const roleData = {
    client: {
      user: baseUser.client,
      stats: {
        myProjects: 2,
        pendingApprovals: 1,
        deliveredVideos: 8
      },
      projects: [
        {
          id: 'project-client-1',
          name: "Brand Story Video Campaign",
          description: "A comprehensive brand story video to showcase our company values and mission",
          status: "review",
          priority: "high",
          clientId: "client-uid-1",
          companyId: "company-123",
          projectManager: "admin-uid-1",
          assignedStaff: ["staff-uid-1", "staff-uid-2"],
          timeline: {
            startDate: "2023-11-01",
            endDate: "2023-12-18",
            estimatedHours: 120,
            actualHours: 90
          },
          budget: {
            estimated: 15000,
            actual: 11250,
            currency: "USD"
          },
          projectType: "Corporate Video",
          genre: "Brand Story",
          permissions: {
            viewAccess: ["client-uid-1", "admin-uid-1", "staff-uid-1", "staff-uid-2"],
            editAccess: ["admin-uid-1", "staff-uid-1", "staff-uid-2"],
            commentAccess: ["client-uid-1", "admin-uid-1", "staff-uid-1", "staff-uid-2"]
          },
          communications: {
            preferredContactMethod: "email",
            clientFeedbackStatus: "pending"
          },
          progress: 75,
          team: [
            { id: 1, avatar: "https://i.pravatar.cc/150?img=2" },
            { id: 2, avatar: "https://i.pravatar.cc/150?img=3" }
          ]
        },
        {
          id: 2,
          name: "Product Demo Series",
          client: "My Company Project",
          progress: 40,
          status: "in-production",
          statusLabel: "In Production",
          nextMilestone: "January 15th, 2024",
          team: [
            { id: 4, avatar: "https://i.pravatar.cc/150?img=5" },
            { id: 5, avatar: "https://i.pravatar.cc/150?img=6" }
          ],
          action: "View Progress"
        }
      ],
      milestones: [
        {
          id: 1,
          title: "Review Brand Story Cut",
          project: "Brand Story Campaign",
          time: "Today, 2:00pm",
          type: "review"
        },
        {
          id: 2,
          title: "Approve Final Version",
          project: "Brand Story Campaign", 
          time: "Tomorrow, 9:00am",
          type: "final"
        },
        {
          id: 3,
          title: "Product Demo Script Review",
          project: "Product Demo Series",
          time: "Dec 12th, 10:00am",
          type: "draft"
        }
      ],
      teamMembers: {
        projects: [
          { id: 1, name: "My Projects", members: 2, logo: "🎬" }
        ],
        crew: [
          { id: 1, name: "Marcus Chen", role: "Video Editor", avatar: "https://i.pravatar.cc/150?img=8" },
          { id: 2, name: "Sarah Johnson", role: "Motion Graphics", avatar: "https://i.pravatar.cc/150?img=9" }
        ]
      },
      activities: [
        {
          id: 1,
          user: { name: "Marcus Chen", avatar: "https://i.pravatar.cc/150?img=8" },
          action: "Uploaded new cut for",
          target: "Brand Story Campaign",
          time: "15 minutes ago"
        },
        {
          id: 2,
          user: { name: "You", avatar: "https://i.pravatar.cc/150?img=1" },
          action: "Approved milestone for",
          target: "Product Demo Series",
          time: "1 hour ago"
        }
      ],
      notifications: [
        {
          id: 1,
          title: "Ready for Review",
          message: "Your Brand Story Campaign edit is ready for approval",
          time: "5 minutes ago",
          unread: true
        },
        {
          id: 2,
          title: "New Version Available",
          message: "Updated cut uploaded with your feedback implemented",
          time: "1 hour ago",
          unread: true
        }
      ]
    },

    staff: {
      user: baseUser.staff,
      stats: {
        assignedTasks: 8,
        completedToday: 3,
        upcomingDeadlines: 5
      },
      projects: [
        {
          id: 1,
          name: "Brand Story Video Campaign",
          client: "TechFlow Solutions",
          progress: 75,
          status: "in-production",
          statusLabel: "Editing",
          nextMilestone: "December 18th, 2023",
          team: [
            { id: 1, avatar: "https://i.pravatar.cc/150?img=2" },
            { id: 2, avatar: "https://i.pravatar.cc/150?img=3" }
          ],
          action: "Continue Edit"
        },
        {
          id: 2,
          name: "Product Demo Series",
          client: "StartupBoost",
          progress: 40,
          status: "in-production",
          statusLabel: "Color Grading",
          nextMilestone: "January 15th, 2024",
          team: [
            { id: 4, avatar: "https://i.pravatar.cc/150?img=5" },
            { id: 5, avatar: "https://i.pravatar.cc/150?img=6" }
          ],
          action: "Start Grading"
        }
      ],
      milestones: [
        {
          id: 1,
          title: "Complete First Cut",
          project: "Brand Story Campaign",
          time: "Today, 5:00pm",
          type: "draft"
        },
        {
          id: 2,
          title: "Color Grading Review",
          project: "Product Demo Series",
          time: "Tomorrow, 2:00pm",
          type: "review"
        },
        {
          id: 3,
          title: "Sound Design Final",
          project: "Social Media Package",
          time: "Dec 14th, 11:00am",
          type: "final"
        }
      ],
      teamMembers: {
        projects: [
          { id: 1, name: "TechFlow Solutions", members: 4, logo: "🎬" },
          { id: 2, name: "StartupBoost", members: 3, logo: "📱" },
          { id: 3, name: "HealthTech Pro", members: 6, logo: "🏥" }
        ],
        crew: [
          { id: 1, name: "Marcus Chen", role: "Video Editor", avatar: "https://i.pravatar.cc/150?img=8" },
          { id: 2, name: "Sarah Johnson", role: "Motion Graphics", avatar: "https://i.pravatar.cc/150?img=9" },
          { id: 3, name: "David Rodriguez", role: "Producer", avatar: "https://i.pravatar.cc/150?img=10" }
        ]
      },
      activities: [
        {
          id: 1,
          user: { name: "You", avatar: "https://i.pravatar.cc/150?img=2" },
          action: "Completed editing task for",
          target: "Brand Story Campaign",
          time: "30 minutes ago"
        },
        {
          id: 2,
          user: { name: "David Rodriguez", avatar: "https://i.pravatar.cc/150?img=10" },
          action: "Assigned new task for",
          target: "Product Demo Series",
          time: "2 hours ago"
        }
      ],
      notifications: [
        {
          id: 1,
          title: "New Task Assigned",
          message: "Color grading needed for Product Demo Series",
          time: "10 minutes ago",
          unread: true
        },
        {
          id: 2,
          title: "Deadline Reminder",
          message: "Brand Story Campaign first cut due today at 5PM",
          time: "2 hours ago",
          unread: true
        }
      ]
    },

    admin: {
      user: baseUser.admin,
      stats: {
        totalClients: 12,
        activeProjects: 18,
        teamMembers: 15
      },
      projects: [
        {
          id: 1,
          name: "Brand Story Video Campaign",
          client: "TechFlow Solutions",
          progress: 75,
          status: "in-production",
          statusLabel: "On Track",
          nextMilestone: "December 18th, 2023",
          team: [
            { id: 1, avatar: "https://i.pravatar.cc/150?img=2" },
            { id: 2, avatar: "https://i.pravatar.cc/150?img=3" }
          ],
          action: "Monitor"
        },
        {
          id: 2,
          name: "Product Demo Series",
          client: "StartupBoost",
          progress: 40,
          status: "in-production",
          statusLabel: "Needs Attention",
          nextMilestone: "January 15th, 2024",
          team: [
            { id: 4, avatar: "https://i.pravatar.cc/150?img=5" },
            { id: 5, avatar: "https://i.pravatar.cc/150?img=6" }
          ],
          action: "Review"
        }
      ],
      milestones: [
        {
          id: 1,
          title: "Client Review Meeting",
          project: "TechFlow Solutions",
          time: "Today, 3:00pm",
          type: "review"
        },
        {
          id: 2,
          title: "Team Standup",
          project: "All Projects",
          time: "Tomorrow, 9:00am",
          type: "draft"
        },
        {
          id: 3,
          title: "Project Delivery",
          project: "EcoVentures",
          time: "Dec 15th, 2:00pm",
          type: "final"
        }
      ],
      teamMembers: {
        projects: [
          { id: 1, name: "TechFlow Solutions", members: 4, logo: "🎬" },
          { id: 2, name: "StartupBoost", members: 3, logo: "📱" },
          { id: 3, name: "HealthTech Pro", members: 6, logo: "🏥" },
          { id: 4, name: "EcoVentures", members: 5, logo: "🌱" },
          { id: 5, name: "FinanceFirst", members: 7, logo: "💰" }
        ],
        crew: [
          { id: 1, name: "Marcus Chen", role: "Video Editor", avatar: "https://i.pravatar.cc/150?img=8" },
          { id: 2, name: "Sarah Johnson", role: "Motion Graphics", avatar: "https://i.pravatar.cc/150?img=9" },
          { id: 3, name: "David Rodriguez", role: "Producer", avatar: "https://i.pravatar.cc/150?img=10" },
          { id: 4, name: "Lisa Thompson", role: "Colorist", avatar: "https://i.pravatar.cc/150?img=11" },
          { id: 5, name: "Jake Williams", role: "Sound Designer", avatar: "https://i.pravatar.cc/150?img=12" }
        ]
      },
      activities: [
        {
          id: 1,
          user: { name: "TechFlow Solutions", avatar: "https://i.pravatar.cc/150?img=1" },
          action: "Approved milestone for",
          target: "Brand Story Campaign",
          time: "15 minutes ago"
        },
        {
          id: 2,
          user: { name: "Marcus Chen", avatar: "https://i.pravatar.cc/150?img=8" },
          action: "Completed task for",
          target: "Product Demo Series",
          time: "1 hour ago"
        }
      ],
      notifications: [
        {
          id: 1,
          title: "Client Payment Received",
          message: "TechFlow Solutions payment processed successfully",
          time: "5 minutes ago",
          unread: true
        },
        {
          id: 2,
          title: "Team Member Available",
          message: "Lisa Thompson is available for new color grading projects",
          time: "1 hour ago",
          unread: true
        },
        {
          id: 3,
          title: "Project Milestone Due",
          message: "3 projects have milestones due this week",
          time: "2 hours ago",
          unread: false
        }
      ]
    }
  };

  return roleData[userRole] || roleData.client;
};