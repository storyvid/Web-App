// Projects API module
import projectService from '../services/projectService';

export default function createProjectsAPI(firebaseService) {
  return {
    // Get projects based on user role and filters
    async getProjects(user, filters = {}) {
      try {
        const projects = await projectService.getProjects(user, filters);
        return projects;
      } catch (error) {
        throw new Error(error.message || 'Failed to get projects');
      }
    },

    // Get single project by ID
    async getProject(projectId, user) {
      try {
        const project = await firebaseService.getProject(projectId);
        if (!project) {
          throw new Error('Project not found');
        }

        // Check if user has access to this project
        if (!projectService.canViewProject(project, user)) {
          throw new Error('Access denied');
        }

        return project;
      } catch (error) {
        throw new Error(error.message || 'Failed to get project');
      }
    },

    // Create new project
    async createProject(projectData, user) {
      try {
        const project = await projectService.createProject(projectData, user);
        return {
          success: true,
          project,
          message: 'Project created successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to create project');
      }
    },

    // Update existing project
    async updateProject(projectId, updates, user) {
      try {
        const project = await projectService.updateProject(projectId, updates, user);
        return {
          success: true,
          project,
          message: 'Project updated successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to update project');
      }
    },

    // Assign staff to project
    async assignStaff(projectId, staffIds, user) {
      try {
        await projectService.assignStaffToProject(projectId, staffIds, user);
        return {
          success: true,
          message: 'Staff assigned successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to assign staff');
      }
    },

    // Get project team members
    async getProjectTeam(projectId, user) {
      try {
        const team = await projectService.getProjectTeam(projectId, user);
        return team;
      } catch (error) {
        throw new Error(error.message || 'Failed to get project team');
      }
    },

    // Change project status
    async changeStatus(projectId, newStatus, user, comment = '') {
      try {
        await projectService.changeProjectStatus(projectId, newStatus, user, comment);
        return {
          success: true,
          message: `Project status changed to ${newStatus}`
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to change project status');
      }
    },

    // Get project collaboration data (comments, activities)
    async getCollaboration(projectId, user) {
      try {
        const collaboration = await projectService.getProjectCollaboration(projectId, user);
        return collaboration;
      } catch (error) {
        throw new Error(error.message || 'Failed to get collaboration data');
      }
    },

    // Add comment to project
    async addComment(projectId, commentData, user) {
      try {
        const comment = await projectService.addProjectComment(projectId, commentData, user);
        return {
          success: true,
          comment,
          message: 'Comment added successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to add comment');
      }
    },

    // Reply to a comment
    async replyToComment(projectId, commentId, replyData, user) {
      try {
        const reply = await projectService.replyToComment(projectId, commentId, replyData, user);
        return {
          success: true,
          reply,
          message: 'Reply added successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to add reply');
      }
    },

    // Delete project
    async deleteProject(projectId, user) {
      try {
        await projectService.deleteProject(projectId, user);
        return {
          success: true,
          message: 'Project deleted successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to delete project');
      }
    }
  };
}