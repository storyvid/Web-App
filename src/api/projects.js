// Projects API module
export default function createProjectsAPI(firebaseService) {
  return {
    // Get user's projects
    async getUserProjects(uid) {
      try {
        const projects = await firebaseService.getUserProjects(uid);
        return projects || [];
      } catch (error) {
        throw new Error(error.message || 'Failed to get user projects');
      }
    },

    // Get single project
    async getProject(projectId) {
      try {
        const project = await firebaseService.getProject(projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        return project;
      } catch (error) {
        throw new Error(error.message || 'Failed to get project');
      }
    },

    // Create new project
    async createProject(projectData) {
      try {
        const newProject = await firebaseService.createProject(projectData);
        return newProject;
      } catch (error) {
        throw new Error(error.message || 'Failed to create project');
      }
    },

    // Update project
    async updateProject(projectId, updates) {
      try {
        const updatedProject = await firebaseService.updateProject(projectId, updates);
        return updatedProject;
      } catch (error) {
        throw new Error(error.message || 'Failed to update project');
      }
    },

    // Delete project
    async deleteProject(projectId) {
      try {
        await firebaseService.deleteProject(projectId);
        return { success: true, message: 'Project deleted successfully' };
      } catch (error) {
        throw new Error(error.message || 'Failed to delete project');
      }
    }
  };
}