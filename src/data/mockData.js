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
        myProjects: 4,
        pendingApprovals: 2,
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
          client: "Tech Innovators Inc",
          nextMilestone: "December 18th, 2023",
          nextMilestoneDetails: {
            id: "milestone-1",
            title: "Final Cut Review",
            status: "pending_approval",
            dueDate: "2023-12-18",
            type: "review"
          },
          team: [
            { id: 1, avatar: "https://i.pravatar.cc/150?img=2" },
            { id: 2, avatar: "https://i.pravatar.cc/150?img=3" }
          ],
          action: "Review",
          fileActivity: {
            recentCount: 12,
            lastUpload: "15 minutes ago",
            hasNewUploads: true,
            types: ["video", "pdf", "image"]
          }
        },
        {
          id: 2,
          name: "Product Demo Series",
          client: "My Company Project",
          progress: 40,
          status: "in-production",
          statusLabel: "In Production",
          nextMilestone: "January 15th, 2024",
          nextMilestoneDetails: {
            id: "milestone-2",
            title: "Script Approval",
            status: "in_progress",
            dueDate: "2024-01-15",
            type: "draft"
          },
          team: [
            { id: 4, avatar: "https://i.pravatar.cc/150?img=5" },
            { id: 5, avatar: "https://i.pravatar.cc/150?img=6" }
          ],
          action: "View Progress",
          fileActivity: {
            recentCount: 6,
            lastUpload: "2 days ago",
            hasNewUploads: false,
            types: ["video", "pdf"]
          }
        },
        {
          id: 3,
          name: "Holiday Marketing Campaign",
          client: "Tech Innovators Inc",
          progress: 85,
          status: "in-review",
          statusLabel: "Client Review",
          nextMilestone: "December 20th, 2023",
          nextMilestoneDetails: {
            id: "milestone-3",
            title: "Final Approval",
            status: "pending_approval",
            dueDate: "2023-12-20",
            type: "final"
          },
          team: [
            { id: 6, avatar: "https://i.pravatar.cc/150?img=7" },
            { id: 7, avatar: "https://i.pravatar.cc/150?img=8" }
          ],
          action: "Review",
          fileActivity: {
            recentCount: 24,
            lastUpload: "3 hours ago",
            hasNewUploads: true,
            types: ["video", "image"]
          }
        },
        {
          id: 4,
          name: "Training Video Series",
          client: "My Company Project",
          progress: 20,
          status: "in-production",
          statusLabel: "In Production",
          nextMilestone: "January 30th, 2024",
          nextMilestoneDetails: {
            id: "milestone-4",
            title: "First Draft Complete",
            status: "not_started",
            dueDate: "2024-01-30",
            type: "draft"
          },
          team: [
            { id: 8, avatar: "https://i.pravatar.cc/150?img=9" }
          ],
          action: "View Progress",
          fileActivity: {
            recentCount: 4,
            lastUpload: "1 week ago",
            hasNewUploads: false,
            types: ["pdf"]
          }
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
        assignedTasks: 12,
        completedToday: 4,
        upcomingDeadlines: 6
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
          nextMilestoneDetails: {
            id: "milestone-staff-1",
            title: "Complete Final Edit",
            status: "in_progress",
            dueDate: "2023-12-18",
            type: "production"
          },
          team: [
            { id: 1, avatar: "https://i.pravatar.cc/150?img=2" },
            { id: 2, avatar: "https://i.pravatar.cc/150?img=3" }
          ],
          action: "Continue Edit",
          fileActivity: {
            recentCount: 18,
            lastUpload: "5 minutes ago",
            hasNewUploads: true,
            types: ["video", "pdf", "image"]
          }
        },
        {
          id: 2,
          name: "Product Demo Series",
          client: "StartupBoost",
          progress: 40,
          status: "in-production",
          statusLabel: "Color Grading",
          nextMilestone: "January 15th, 2024",
          nextMilestoneDetails: {
            id: "milestone-staff-2",
            title: "Color Grading Complete",
            status: "not_started",
            dueDate: "2024-01-15",
            type: "production"
          },
          team: [
            { id: 4, avatar: "https://i.pravatar.cc/150?img=5" },
            { id: 5, avatar: "https://i.pravatar.cc/150?img=6" }
          ],
          action: "Start Grading",
          fileActivity: {
            recentCount: 9,
            lastUpload: "1 hour ago",
            hasNewUploads: true,
            types: ["video", "image"]
          }
        },
        {
          id: 3,
          name: "Corporate Training Module",
          client: "Enterprise Corp",
          progress: 60,
          status: "in-production",
          statusLabel: "Sound Design",
          nextMilestone: "December 22nd, 2023",
          nextMilestoneDetails: {
            id: "milestone-staff-3",
            title: "Audio Post Production",
            status: "in_progress",
            dueDate: "2023-12-22",
            type: "production"
          },
          team: [
            { id: 9, avatar: "https://i.pravatar.cc/150?img=10" },
            { id: 10, avatar: "https://i.pravatar.cc/150?img=11" }
          ],
          action: "Continue Audio",
          fileActivity: {
            recentCount: 31,
            lastUpload: "2 hours ago",
            hasNewUploads: true,
            types: ["video", "pdf"]
          }
        },
        {
          id: 4,
          name: "Social Media Content Pack",
          client: "Marketing Agency",
          progress: 25,
          status: "in-production",
          statusLabel: "Scripting",
          nextMilestone: "January 8th, 2024",
          nextMilestoneDetails: {
            id: "milestone-staff-4",
            title: "Script Review",
            status: "not_started",
            dueDate: "2024-01-08",
            type: "draft"
          },
          team: [
            { id: 11, avatar: "https://i.pravatar.cc/150?img=12" }
          ],
          action: "Write Scripts",
          fileActivity: {
            recentCount: 2,
            lastUpload: "3 days ago",
            hasNewUploads: false,
            types: ["pdf"]
          }
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
        totalClients: 15,
        activeProjects: 23,
        pendingApprovals: 8,
        upcomingDeadlines: 12
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
          nextMilestoneDetails: {
            id: "milestone-admin-1",
            title: "Client Review Meeting",
            status: "scheduled",
            dueDate: "2023-12-18",
            type: "review"
          },
          team: [
            { id: 1, avatar: "https://i.pravatar.cc/150?img=2" },
            { id: 2, avatar: "https://i.pravatar.cc/150?img=3" }
          ],
          action: "Monitor",
          fileActivity: {
            recentCount: 28,
            lastUpload: "10 minutes ago",
            hasNewUploads: true,
            types: ["video", "pdf", "image"]
          }
        },
        {
          id: 2,
          name: "Product Demo Series",
          client: "StartupBoost",
          progress: 40,
          status: "in-production",
          statusLabel: "Needs Attention",
          nextMilestone: "January 15th, 2024",
          nextMilestoneDetails: {
            id: "milestone-admin-2",
            title: "Project Deadline Review",
            status: "overdue",
            dueDate: "2024-01-10",
            type: "review"
          },
          team: [
            { id: 4, avatar: "https://i.pravatar.cc/150?img=5" },
            { id: 5, avatar: "https://i.pravatar.cc/150?img=6" }
          ],
          action: "Review",
          fileActivity: {
            recentCount: 14,
            lastUpload: "6 hours ago",
            hasNewUploads: false,
            types: ["video", "pdf"]
          }
        },
        {
          id: 3,
          name: "Multi-Client Campaign Hub",
          client: "Various Clients",
          progress: 90,
          status: "in-review",
          statusLabel: "Final Review",
          nextMilestone: "December 19th, 2023",
          nextMilestoneDetails: {
            id: "milestone-admin-3",
            title: "Campaign Launch Approval",
            status: "pending_approval",
            dueDate: "2023-12-19",
            type: "final"
          },
          team: [
            { id: 12, avatar: "https://i.pravatar.cc/150?img=13" },
            { id: 13, avatar: "https://i.pravatar.cc/150?img=14" },
            { id: 14, avatar: "https://i.pravatar.cc/150?img=15" }
          ],
          action: "Review",
          fileActivity: {
            recentCount: 45,
            lastUpload: "30 minutes ago",
            hasNewUploads: true,
            types: ["video", "image"]
          }
        },
        {
          id: 4,
          name: "Quarterly Reports Archive",
          client: "Internal",
          progress: 50,
          status: "in-production",
          statusLabel: "Data Collection",
          nextMilestone: "January 5th, 2024",
          nextMilestoneDetails: {
            id: "milestone-admin-4",
            title: "Q4 Report Compilation",
            status: "in_progress",
            dueDate: "2024-01-05",
            type: "production"
          },
          team: [
            { id: 15, avatar: "https://i.pravatar.cc/150?img=16" }
          ],
          action: "Monitor",
          fileActivity: {
            recentCount: 8,
            lastUpload: "2 days ago",
            hasNewUploads: false,
            types: ["pdf"]
          }
        },
        {
          id: 5,
          name: "Emergency Response Training",
          client: "Government Agency",
          progress: 65,
          status: "in-production",
          statusLabel: "Post Production",
          nextMilestone: "December 28th, 2023",
          nextMilestoneDetails: {
            id: "milestone-admin-5",
            title: "Security Review",
            status: "scheduled",
            dueDate: "2023-12-28",
            type: "review"
          },
          team: [
            { id: 16, avatar: "https://i.pravatar.cc/150?img=17" },
            { id: 17, avatar: "https://i.pravatar.cc/150?img=18" }
          ],
          action: "Monitor",
          fileActivity: {
            recentCount: 19,
            lastUpload: "4 hours ago",
            hasNewUploads: true,
            types: ["video", "pdf", "image"]
          }
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