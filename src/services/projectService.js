import firebaseService from './firebase/firebaseService';
import { ProjectSchema } from './firebase/roleSchemas';

/**
 * Project Service
 * Handles all project-related operations with role-based access control
 */
class ProjectService {
  constructor() {
    this.firebaseService = firebaseService;
  }

  /**
   * Create a new project with role-based validation
   */
  async createProject(projectData, creatorUser) {
    try {
      // Validate creator permissions
      if (!this.canCreateProject(creatorUser)) {
        throw new Error('You do not have permission to create projects');
      }

      // Create project with role-based data
      const newProject = {
        ...ProjectSchema,
        ...projectData,
        // Set role-based access control
        clientId: projectData.clientId || (creatorUser.role === 'client' ? creatorUser.uid : ''),
        companyId: this.getCompanyId(creatorUser),
        projectManager: creatorUser.role === 'admin' ? creatorUser.uid : '',
        assignedStaff: projectData.assignedStaff || [],
        
        // Set initial project state
        status: 'planning',
        priority: projectData.priority || 'medium',
        
        // Initialize timeline
        timeline: {
          startDate: projectData.startDate || null,
          endDate: projectData.endDate || null,
          estimatedHours: projectData.estimatedHours || 0,
          actualHours: 0
        },
        
        // Set permissions
        permissions: {
          viewAccess: this.getInitialViewAccess(projectData, creatorUser),
          editAccess: this.getInitialEditAccess(projectData, creatorUser),
          commentAccess: this.getInitialCommentAccess(projectData, creatorUser),
          approvalRequired: creatorUser.role === 'client'
        },
        
        // Project metadata
        projectType: projectData.projectType || '',
        genre: projectData.genre || '',
        tags: projectData.tags || [],
        
        // Communication settings
        communications: {
          lastClientContact: null,
          nextScheduledCall: null,
          preferredContactMethod: projectData.communicationMethod || 'email',
          clientFeedbackStatus: 'pending'
        }
      };

      // Create project in Firebase
      const result = await this.firebaseService.createProject(newProject);
      
      // Log activity
      await this.firebaseService.logActivity({
        userId: creatorUser.uid,
        action: 'project_created',
        projectId: result.id,
        details: {
          projectName: newProject.name,
          projectType: newProject.projectType,
          clientId: newProject.clientId
        }
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Get projects based on user role and permissions
   */
  async getProjects(user, filters = {}) {
    try {
      let projects = [];

      switch (user.role) {
        case 'client':
          // Clients see only their projects
          projects = await this.firebaseService.getProjects({
            clientId: user.uid,
            ...filters
          });
          break;

        case 'staff':
          // Staff see projects they're assigned to
          projects = await this.firebaseService.getProjects({
            assignedStaff: user.uid,
            ...filters
          });
          break;

        case 'admin':
          // Admins see all company projects
          const companyId = this.getCompanyId(user);
          projects = await this.firebaseService.getProjects({
            companyId: companyId,
            ...filters
          });
          break;

        default:
          throw new Error('Invalid user role');
      }

      return projects;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Update project with role-based permissions
   */
  async updateProject(projectId, updates, user) {
    try {
      // Get existing project
      const project = await this.firebaseService.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Check permissions
      if (!this.canEditProject(project, user)) {
        throw new Error('You do not have permission to edit this project');
      }

      // Apply role-based update restrictions
      const allowedUpdates = this.filterAllowedUpdates(updates, user, project);

      // Update project
      const result = await this.firebaseService.updateProject(projectId, allowedUpdates);

      // Log activity
      await this.firebaseService.logActivity({
        userId: user.uid,
        action: 'project_updated',
        projectId: projectId,
        details: {
          updatedFields: Object.keys(allowedUpdates),
          projectName: project.name
        }
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Assign staff members to project
   */
  async assignStaffToProject(projectId, staffIds, assignedBy) {
    try {
      // Check permissions - only admins can assign staff
      if (assignedBy.role !== 'admin') {
        throw new Error('Only administrators can assign staff to projects');
      }

      const project = await this.firebaseService.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Verify company access
      const companyId = this.getCompanyId(assignedBy);
      if (project.companyId !== companyId) {
        throw new Error('Project does not belong to your company');
      }

      // Update assigned staff
      const updatedStaff = [...new Set([...project.assignedStaff, ...staffIds])];
      
      await this.firebaseService.updateProject(projectId, {
        assignedStaff: updatedStaff,
        permissions: {
          ...project.permissions,
          viewAccess: [...new Set([...project.permissions.viewAccess, ...staffIds])],
          editAccess: [...new Set([...project.permissions.editAccess, ...staffIds])],
          commentAccess: [...new Set([...project.permissions.commentAccess, ...staffIds])]
        }
      });

      // Notify assigned staff
      for (const staffId of staffIds) {
        if (!project.assignedStaff.includes(staffId)) {
          await this.firebaseService.createNotification({
            userId: staffId,
            type: 'project_assignment',
            title: 'New Project Assignment',
            message: `You have been assigned to project: ${project.name}`,
            projectId: projectId,
            actionUrl: `/projects/${projectId}`
          });
        }
      }

      // Log activity
      await this.firebaseService.logActivity({
        userId: assignedBy.uid,
        action: 'staff_assigned',
        projectId: projectId,
        details: {
          assignedStaff: staffIds,
          projectName: project.name
        }
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to assign staff: ${error.message}`);
    }
  }

  /**
   * Get project team members
   */
  async getProjectTeam(projectId, user) {
    try {
      const project = await this.firebaseService.getProject(projectId);
      if (!project || !this.canViewProject(project, user)) {
        throw new Error('Project not found or access denied');
      }

      const teamMembers = [];

      // Add client
      if (project.clientId) {
        const client = await this.firebaseService.getUser(project.clientId);
        if (client) {
          teamMembers.push({
            ...client,
            projectRole: 'client',
            permissions: ['view', 'comment']
          });
        }
      }

      // Add project manager
      if (project.projectManager) {
        const manager = await this.firebaseService.getUser(project.projectManager);
        if (manager) {
          teamMembers.push({
            ...manager,
            projectRole: 'manager',
            permissions: ['view', 'edit', 'delete', 'assign']
          });
        }
      }

      // Add assigned staff
      for (const staffId of project.assignedStaff) {
        const staff = await this.firebaseService.getUser(staffId);
        if (staff) {
          teamMembers.push({
            ...staff,
            projectRole: 'staff',
            permissions: ['view', 'edit', 'comment']
          });
        }
      }

      return teamMembers;
    } catch (error) {
      throw new Error(`Failed to get project team: ${error.message}`);
    }
  }

  /**
   * Change project status with workflow validation
   */
  async changeProjectStatus(projectId, newStatus, user, comment = '') {
    try {
      const project = await this.firebaseService.getProject(projectId);
      if (!project || !this.canEditProject(project, user)) {
        throw new Error('Project not found or access denied');
      }

      // Validate status transition
      if (!this.isValidStatusTransition(project.status, newStatus, user.role)) {
        throw new Error(`Invalid status transition from ${project.status} to ${newStatus}`);
      }

      const updates = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Handle completion
      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
        updates.timeline = {
          ...project.timeline,
          actualHours: project.timeline.actualHours || 0
        };
      }

      await this.firebaseService.updateProject(projectId, updates);

      // Log status change
      await this.firebaseService.logActivity({
        userId: user.uid,
        action: 'status_changed',
        projectId: projectId,
        details: {
          fromStatus: project.status,
          toStatus: newStatus,
          comment: comment,
          projectName: project.name
        }
      });

      // Notify stakeholders
      await this.notifyStatusChange(project, newStatus, user, comment);

      return true;
    } catch (error) {
      throw new Error(`Failed to change project status: ${error.message}`);
    }
  }

  // Helper methods
  canCreateProject(user) {
    return ['client', 'admin'].includes(user.role);
  }

  canViewProject(project, user) {
    return project.permissions.viewAccess.includes(user.uid) ||
           project.clientId === user.uid ||
           project.projectManager === user.uid ||
           project.assignedStaff.includes(user.uid);
  }

  canEditProject(project, user) {
    return project.permissions.editAccess.includes(user.uid) ||
           project.projectManager === user.uid ||
           (user.role === 'admin' && project.companyId === this.getCompanyId(user));
  }

  getCompanyId(user) {
    switch (user.role) {
      case 'admin':
        return user.adminProfile?.companyId;
      case 'staff':
        return user.staffProfile?.companyId;
      default:
        return null;
    }
  }

  getInitialViewAccess(projectData, creator) {
    const access = [creator.uid];
    if (projectData.clientId && projectData.clientId !== creator.uid) {
      access.push(projectData.clientId);
    }
    if (projectData.assignedStaff) {
      access.push(...projectData.assignedStaff);
    }
    return [...new Set(access)];
  }

  getInitialEditAccess(projectData, creator) {
    const access = [];
    if (creator.role === 'admin') {
      access.push(creator.uid);
    }
    if (projectData.assignedStaff) {
      access.push(...projectData.assignedStaff);
    }
    return [...new Set(access)];
  }

  getInitialCommentAccess(projectData, creator) {
    return this.getInitialViewAccess(projectData, creator);
  }

  filterAllowedUpdates(updates, user, project) {
    const allowed = { ...updates };
    
    // Clients can only update certain fields
    if (user.role === 'client') {
      const clientAllowedFields = ['description', 'communications'];
      Object.keys(allowed).forEach(key => {
        if (!clientAllowedFields.includes(key)) {
          delete allowed[key];
        }
      });
    }

    // Staff cannot change project assignment
    if (user.role === 'staff') {
      delete allowed.assignedStaff;
      delete allowed.clientId;
      delete allowed.companyId;
    }

    return allowed;
  }

  isValidStatusTransition(currentStatus, newStatus, userRole) {
    const transitions = {
      'planning': ['in_progress', 'cancelled'],
      'in_progress': ['review', 'completed', 'cancelled'],
      'review': ['in_progress', 'completed'],
      'completed': [], // No transitions from completed
      'cancelled': ['planning'] // Can restart cancelled projects
    };

    // Only admins can cancel projects
    if (newStatus === 'cancelled' && userRole !== 'admin') {
      return false;
    }

    return transitions[currentStatus]?.includes(newStatus) || false;
  }

  async notifyStatusChange(project, newStatus, changedBy, comment) {
    const stakeholders = [
      project.clientId,
      project.projectManager,
      ...project.assignedStaff
    ].filter(id => id && id !== changedBy.uid);

    const notification = {
      type: 'status_change',
      title: `Project Status Updated`,
      message: `${project.name} status changed to ${newStatus.replace('_', ' ')}`,
      projectId: project.id,
      actionUrl: `/projects/${project.id}`
    };

    for (const userId of stakeholders) {
      await this.firebaseService.createNotification({
        ...notification,
        userId
      });
    }
  }

  // Get project collaboration data
  async getProjectCollaboration(projectId, user) {
    try {
      const project = await this.firebaseService.getProject(projectId);
      if (!project || !this.canViewProject(project, user)) {
        throw new Error('Project not found or access denied');
      }

      // TODO: Implement real collaboration data loading from Firebase
      // For now, return mock data
      return {
        comments: [
          {
            id: 'comment-1',
            content: 'The initial rough cut looks great! I love the opening sequence. Can we adjust the color temperature in the middle section to be slightly warmer?',
            authorId: 'client-1',
            authorName: 'Alex Johnson',
            authorAvatar: 'https://i.pravatar.cc/40?img=1',
            authorRole: 'client',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            replies: [
              {
                id: 'reply-1',
                content: 'Absolutely! I\'ll adjust the color grading in that section. Should have an updated version ready by tomorrow.',
                authorId: 'staff-1',
                authorName: 'John Doe',
                authorAvatar: 'https://i.pravatar.cc/40?img=2',
                authorRole: 'staff',
                timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
              }
            ],
            attachments: [],
            tags: ['feedback', 'color-grading']
          }
        ],
        activities: [
          {
            id: 'activity-1',
            type: 'status_change',
            description: 'Project status changed to "In Review"',
            authorId: 'staff-1',
            authorName: 'John Doe',
            authorAvatar: 'https://i.pravatar.cc/40?img=2',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            metadata: { oldStatus: 'in_progress', newStatus: 'review' }
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get collaboration data: ${error.message}`);
    }
  }

  // Add comment to project
  async addProjectComment(projectId, commentData, user) {
    try {
      const project = await this.firebaseService.getProject(projectId);
      if (!project || !this.canViewProject(project, user)) {
        throw new Error('Project not found or access denied');
      }

      const comment = {
        id: `comment-${Date.now()}`,
        content: commentData.content,
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorRole: user.role,
        timestamp: new Date().toISOString(),
        replies: [],
        attachments: commentData.attachments || [],
        tags: commentData.tags || []
      };

      // TODO: Save to Firebase
      console.log('Adding comment to project:', { projectId, comment });

      // Log activity
      await this.firebaseService.logActivity({
        userId: user.uid,
        action: 'comment_added',
        projectId: projectId,
        details: {
          commentId: comment.id,
          projectName: project.name
        }
      });

      return comment;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  // Reply to a comment
  async replyToComment(projectId, commentId, replyData, user) {
    try {
      const project = await this.firebaseService.getProject(projectId);
      if (!project || !this.canViewProject(project, user)) {
        throw new Error('Project not found or access denied');
      }

      const reply = {
        id: `reply-${Date.now()}`,
        content: replyData.content,
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorRole: user.role,
        timestamp: new Date().toISOString()
      };

      // TODO: Save to Firebase
      console.log('Adding reply to comment:', { projectId, commentId, reply });

      // Log activity
      await this.firebaseService.logActivity({
        userId: user.uid,
        action: 'comment_reply',
        projectId: projectId,
        details: {
          commentId: commentId,
          replyId: reply.id,
          projectName: project.name
        }
      });

      return reply;
    } catch (error) {
      throw new Error(`Failed to add reply: ${error.message}`);
    }
  }

  // Delete project
  async deleteProject(projectId, user) {
    try {
      const project = await this.firebaseService.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Only admins can delete projects
      if (user.role !== 'admin') {
        throw new Error('Only administrators can delete projects');
      }

      // Verify company access
      const companyId = this.getCompanyId(user);
      if (project.companyId !== companyId) {
        throw new Error('Project does not belong to your company');
      }

      // TODO: Implement real deletion with Firebase
      console.log('Deleting project:', { projectId, deletedBy: user.uid });

      // Log activity
      await this.firebaseService.logActivity({
        userId: user.uid,
        action: 'project_deleted',
        projectId: projectId,
        details: {
          projectName: project.name
        }
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // Helper method to check if user can delete projects
  canDeleteProject(user) {
    return user.role === 'admin';
  }
}

// Export singleton instance
const projectService = new ProjectService();
export default projectService;