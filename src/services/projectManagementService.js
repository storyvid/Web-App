// Project Management Service
// Enhanced service layer for admin project creation and management

import firebaseService from './firebase/firebaseService';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';

class ProjectManagementService {
  constructor() {
    this.firebaseService = firebaseService;
  }

  // Helper method to get current user with better error handling
  getCurrentUser() {
    const user = this.firebaseService.currentUser || this.firebaseService.getCurrentUser();
    return user;
  }

  // Helper method to check admin permissions
  checkAdminPermission() {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated. Please log in.');
    }
    
    if (currentUser.role !== 'admin') {
      throw new Error(`Access denied. Admin role required. Current user role: ${currentUser.role}`);
    }
    
    return currentUser;
  }

  // ADMIN PROJECT CREATION FUNCTIONS

  /**
   * Create a new project (Admin only)
   * @param {Object} projectData - Project data
   * @param {string} assignedUserId - User ID to assign project to
   * @returns {Object} Created project
   */
  async createProject(projectData, assignedUserId) {
    const currentUser = this.checkAdminPermission();

    try {
      console.log('🔍 DEBUG: Creating project with data:', {
        projectName: projectData.name,
        assignedUserId,
        adminUserId: currentUser.uid
      });

      // Validate assigned user exists
      const assignedUser = await this.firebaseService.getUser(assignedUserId);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }

      console.log('🔍 DEBUG: Found assigned user:', {
        uid: assignedUser.id,
        email: assignedUser.email,
        name: assignedUser.name,
        role: assignedUser.role
      });

      // Generate project ID
      const projectRef = doc(collection(this.firebaseService.db, 'projects'));
      
      // Prepare project data
      const projectDoc = {
        ...projectData,
        id: projectRef.id,
        status: projectData.status || 'planning',
        progress: projectData.progress || 0,
        createdBy: this.firebaseService.currentUser.uid,
        assignedTo: assignedUserId,
        assignedToName: assignedUser.name,
        assignedToEmail: assignedUser.email,
        companyId: this.firebaseService.currentUser.adminProfile?.companyId || 'default-company',
        client: assignedUser.role === 'client' ? assignedUser.name : (projectData.client || assignedUser.name),
        clientId: assignedUserId,
        team: projectData.team || [],
        assignedStaff: projectData.assignedStaff || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Use batch write to create project and update user
      const batch = writeBatch(this.firebaseService.db);
      
      // Create project
      batch.set(projectRef, projectDoc);
      
      // Update user's assignedProjects array
      const userRef = doc(this.firebaseService.db, 'users', assignedUserId);
      batch.update(userRef, {
        assignedProjects: arrayUnion(projectRef.id),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      console.log('🔍 DEBUG: Project created successfully:', {
        projectId: projectRef.id,
        assignedTo: assignedUserId,
        projectName: projectData.name
      });

      // Return project with serialized timestamps
      return {
        ...projectDoc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Get all projects (Admin only)
   * @returns {Array} All projects
   */
  async getAllProjects() {
    const currentUser = this.checkAdminPermission();

    try {
      const companyId = currentUser.adminProfile?.companyId || 'default-company';
      
      // Simple query to avoid index requirement for initial testing
      const projectsQuery = collection(this.firebaseService.db, 'projects');

      const snapshot = await getDocs(projectsQuery);
      const allProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
      
      // Filter by company and sort on client side
      const filteredProjects = allProjects.filter(project => 
        project.companyId === companyId || !project.companyId
      );
      
      // Sort by creation date (newest first)
      return filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Get all users for project assignment (Admin only)
   * @returns {Array} All users that can be assigned projects
   */
  async getAllUsers() {
    const currentUser = this.checkAdminPermission();

    try {
      // For now, get all users. In production, filter by company
      const usersQuery = query(
        collection(this.firebaseService.db, 'users'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      })).filter(user => user.role !== 'admin'); // Exclude other admins
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Update project status (Admin only)
   * @param {string} projectId - Project ID
   * @param {string} status - New status
   * @param {string} comment - Optional comment
   * @returns {Object} Updated project
   */
  async updateProjectStatus(projectId, status, comment = '') {
    if (!this.firebaseService.currentUser || this.firebaseService.currentUser.role !== 'admin') {
      throw new Error('Only admins can update project status');
    }

    try {
      const projectRef = doc(this.firebaseService.db, 'projects', projectId);
      const updates = {
        status,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: this.firebaseService.currentUser.uid
      };

      if (comment) {
        updates.statusComment = comment;
        updates.statusUpdatedAt = serverTimestamp();
      }

      await updateDoc(projectRef, updates);

      // Log activity
      await this.logProjectActivity(projectId, 'status_updated', {
        oldStatus: undefined, // Would need to fetch old status first
        newStatus: status,
        comment
      });

      // Get updated project
      const updatedDoc = await getDoc(projectRef);
      return updatedDoc.exists() ? {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate?.()?.toISOString() || updatedDoc.data().createdAt,
        updatedAt: updatedDoc.data().updatedAt?.toDate?.()?.toISOString() || updatedDoc.data().updatedAt
      } : null;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw new Error(`Failed to update project status: ${error.message}`);
    }
  }

  /**
   * Update project progress (Admin only)
   * @param {string} projectId - Project ID
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Object} Updated project
   */
  async updateProjectProgress(projectId, progress) {
    if (!this.firebaseService.currentUser || this.firebaseService.currentUser.role !== 'admin') {
      throw new Error('Only admins can update project progress');
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    try {
      const projectRef = doc(this.firebaseService.db, 'projects', projectId);
      const updates = {
        progress,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: this.firebaseService.currentUser.uid
      };

      // Auto-update status based on progress
      if (progress === 100) {
        updates.status = 'completed';
      } else if (progress > 0 && updates.status === 'planning') {
        updates.status = 'in-progress';
      }

      await updateDoc(projectRef, updates);

      // Log activity
      await this.logProjectActivity(projectId, 'progress_updated', {
        progress
      });

      // Get updated project
      const updatedDoc = await getDoc(projectRef);
      return updatedDoc.exists() ? {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate?.()?.toISOString() || updatedDoc.data().createdAt,
        updatedAt: updatedDoc.data().updatedAt?.toDate?.()?.toISOString() || updatedDoc.data().updatedAt
      } : null;
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw new Error(`Failed to update project progress: ${error.message}`);
    }
  }

  /**
   * Reassign project to different user (Admin only)
   * @param {string} projectId - Project ID
   * @param {string} newUserId - New user ID to assign to
   * @returns {Object} Updated project
   */
  async reassignProject(projectId, newUserId) {
    if (!this.firebaseService.currentUser || this.firebaseService.currentUser.role !== 'admin') {
      throw new Error('Only admins can reassign projects');
    }

    try {
      // Get project and new user data
      const [projectDoc, newUser] = await Promise.all([
        getDoc(doc(this.firebaseService.db, 'projects', projectId)),
        this.firebaseService.getUser(newUserId)
      ]);

      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      if (!newUser) {
        throw new Error('New user not found');
      }

      const projectData = projectDoc.data();
      const oldUserId = projectData.assignedTo;

      // Use batch to update project and both users
      const batch = writeBatch(this.firebaseService.db);

      // Update project
      const projectRef = doc(this.firebaseService.db, 'projects', projectId);
      batch.update(projectRef, {
        assignedTo: newUserId,
        assignedToName: newUser.name,
        assignedToEmail: newUser.email,
        client: newUser.role === 'client' ? newUser.name : projectData.client,
        clientId: newUser.role === 'client' ? newUserId : newUserId,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: this.firebaseService.currentUser.uid
      });

      // Remove from old user's assignments
      if (oldUserId) {
        const oldUserRef = doc(this.firebaseService.db, 'users', oldUserId);
        batch.update(oldUserRef, {
          assignedProjects: arrayRemove(projectId),
          updatedAt: serverTimestamp()
        });
      }

      // Add to new user's assignments
      const newUserRef = doc(this.firebaseService.db, 'users', newUserId);
      batch.update(newUserRef, {
        assignedProjects: arrayUnion(projectId),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // Log activity
      await this.logProjectActivity(projectId, 'project_reassigned', {
        oldUserId,
        newUserId,
        newUserName: newUser.name
      });

      // Return updated project
      return await this.getProject(projectId);
    } catch (error) {
      console.error('Error reassigning project:', error);
      throw new Error(`Failed to reassign project: ${error.message}`);
    }
  }

  /**
   * Get project by ID
   * @param {string} projectId - Project ID
   * @returns {Object} Project data
   */
  async getProject(projectId) {
    try {
      const projectDoc = await getDoc(doc(this.firebaseService.db, 'projects', projectId));
      
      if (!projectDoc.exists()) {
        return null;
      }

      const data = projectDoc.data();
      return {
        id: projectDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      };
    } catch (error) {
      console.error('Error getting project:', error);
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  /**
   * Get projects by user ID
   * @param {string} userId - User ID
   * @returns {Array} User's projects
   */
  async getProjectsByUser(userId) {
    try {
      console.log('🔍 DEBUG: Fetching projects for user:', userId);
      
      // Use simple query without orderBy to avoid composite index requirement
      const projectsQuery = query(
        collection(this.firebaseService.db, 'projects'),
        where('assignedTo', '==', userId)
      );

      const snapshot = await getDocs(projectsQuery);
      
      console.log('🔍 DEBUG: Found projects:', snapshot.docs.length);
      
      const projects = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔍 DEBUG: Project data:', {
          id: doc.id,
          name: data.name,
          assignedTo: data.assignedTo,
          assignedToEmail: data.assignedToEmail,
          createdAt: data.createdAt
        });
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        };
      });
      
      // Sort client-side by createdAt descending
      projects.sort((a, b) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        return bDate - aDate;
      });
      
      console.log('🔍 DEBUG: Returning projects (sorted):', projects.length);
      return projects;
    } catch (error) {
      console.error('Error getting user projects:', error);
      throw new Error(`Failed to get user projects: ${error.message}`);
    }
  }

  /**
   * Delete project (Admin only)
   * @param {string} projectId - Project ID
   * @returns {boolean} Success
   */
  async deleteProject(projectId) {
    if (!this.firebaseService.currentUser || this.firebaseService.currentUser.role !== 'admin') {
      throw new Error('Only admins can delete projects');
    }

    try {
      // Get project data first
      const projectDoc = await getDoc(doc(this.firebaseService.db, 'projects', projectId));
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      const assignedUserId = projectData.assignedTo;

      // Use batch to delete project and update user
      const batch = writeBatch(this.firebaseService.db);

      // Delete project
      const { deleteDoc } = await import('firebase/firestore');
      batch.delete(doc(this.firebaseService.db, 'projects', projectId));

      // Remove from user's assignments
      if (assignedUserId) {
        const userRef = doc(this.firebaseService.db, 'users', assignedUserId);
        batch.update(userRef, {
          assignedProjects: arrayRemove(projectId),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Log project activity
   * @param {string} projectId - Project ID
   * @param {string} action - Action type
   * @param {Object} details - Action details
   */
  async logProjectActivity(projectId, action, details = {}) {
    try {
      const activityRef = doc(collection(this.firebaseService.db, 'activities'));
      const activityData = {
        projectId,
        action,
        details,
        userId: this.firebaseService.currentUser?.uid,
        userName: this.firebaseService.currentUser?.name,
        userRole: this.firebaseService.currentUser?.role,
        createdAt: serverTimestamp()
      };

      await setDoc(activityRef, activityData);
    } catch (error) {
      console.error('Error logging project activity:', error);
      // Don't throw error for activity logging failures
    }
  }

  /**
   * Get project statistics for admin dashboard
   * @returns {Object} Project statistics
   */
  async getProjectStatistics() {
    const currentUser = this.checkAdminPermission();

    try {
      const projects = await this.getAllProjects();
      
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in-progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        projectsInReview: projects.filter(p => p.status === 'review').length,
        projectsPlanning: projects.filter(p => p.status === 'planning').length,
        averageProgress: projects.length > 0 
          ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
          : 0,
        projectsByStatus: {
          planning: projects.filter(p => p.status === 'planning').length,
          'in-progress': projects.filter(p => p.status === 'in-progress').length,
          review: projects.filter(p => p.status === 'review').length,
          completed: projects.filter(p => p.status === 'completed').length,
          'on-hold': projects.filter(p => p.status === 'on-hold').length
        }
      };

      return stats;
    } catch (error) {
      console.error('Error getting project statistics:', error);
      throw new Error(`Failed to get project statistics: ${error.message}`);
    }
  }

  /**
   * Update user's assignedProjects array
   * @param {string} userId - User ID
   * @returns {Array} Updated assigned projects
   */
  async updateUserAssignedProjects(userId) {
    try {
      const userProjects = await this.getProjectsByUser(userId);
      const projectIds = userProjects.map(p => p.id);
      
      const userRef = doc(this.firebaseService.db, 'users', userId);
      await updateDoc(userRef, {
        assignedProjects: projectIds,
        updatedAt: serverTimestamp()
      });

      return projectIds;
    } catch (error) {
      console.error('Error updating user assigned projects:', error);
      throw new Error(`Failed to update user assigned projects: ${error.message}`);
    }
  }
}

// Singleton instance
const projectManagementService = new ProjectManagementService();
export default projectManagementService;