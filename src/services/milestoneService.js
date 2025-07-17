// Milestone and Timeline Management Service
// Handles milestone creation, tracking, and timeline management

import firebaseService from './firebase/firebaseService';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch,
  arrayUnion 
} from 'firebase/firestore';

class MilestoneService {
  constructor() {
    this.firebaseService = firebaseService;
  }

  // Helper method to get current user with admin check
  getCurrentUser() {
    const user = this.firebaseService.currentUser || this.firebaseService.getCurrentUser();
    return user;
  }

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

  /**
   * Create a new milestone for a project
   * @param {string} projectId - Project ID
   * @param {Object} milestoneData - Milestone data
   * @returns {Object} Created milestone
   */
  async createMilestone(projectId, milestoneData) {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated. Please log in.');
    }

    try {
      // Validate project exists and user has access
      const projectDoc = await getDoc(doc(this.firebaseService.db, 'projects', projectId));
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const project = projectDoc.data();
      
      // Check if user is admin OR assigned to this project
      const hasAccess = currentUser.role === 'admin' || 
                       project.assignedTo === currentUser.uid ||
                       project.createdBy === currentUser.uid;
      
      if (!hasAccess) {
        throw new Error('Access denied. You can only create milestones for projects you are assigned to.');
      }

      // Generate milestone ID
      const milestoneRef = doc(collection(this.firebaseService.db, 'milestones'));
      
      // Prepare milestone data
      const milestone = {
        ...milestoneData,
        id: milestoneRef.id,
        projectId,
        status: milestoneData.status || 'pending',
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(milestoneRef, milestone);

      console.log('🔍 DEBUG: Milestone created successfully:', milestone.id);

      // Return milestone with serialized timestamps
      return {
        ...milestone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw new Error(`Failed to create milestone: ${error.message}`);
    }
  }

  /**
   * Get all milestones for a project
   * @param {string} projectId - Project ID
   * @returns {Array} Project milestones
   */
  async getProjectMilestones(projectId) {
    try {
      // Use simple query without orderBy to avoid composite index requirement
      const milestonesQuery = query(
        collection(this.firebaseService.db, 'milestones'),
        where('projectId', '==', projectId)
      );

      const snapshot = await getDocs(milestonesQuery);
      const milestones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || doc.data().dueDate,
        completedDate: doc.data().completedDate?.toDate?.()?.toISOString() || doc.data().completedDate
      }));

      // Sort by due date client-side
      return milestones.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } catch (error) {
      console.error('Error getting project milestones:', error);
      throw new Error(`Failed to get milestones: ${error.message}`);
    }
  }

  /**
   * Update milestone status
   * @param {string} milestoneId - Milestone ID
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {Object} Updated milestone
   */
  async updateMilestoneStatus(milestoneId, status, notes = '') {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const milestoneRef = doc(this.firebaseService.db, 'milestones', milestoneId);
      const updates = {
        status,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: currentUser.uid
      };

      if (notes) {
        updates.notes = notes;
      }

      if (status === 'completed') {
        updates.completedDate = serverTimestamp();
      }

      await updateDoc(milestoneRef, updates);

      // Get updated milestone
      const updatedDoc = await getDoc(milestoneRef);
      return updatedDoc.exists() ? {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate?.()?.toISOString() || updatedDoc.data().createdAt,
        updatedAt: updatedDoc.data().updatedAt?.toDate?.()?.toISOString() || updatedDoc.data().updatedAt,
        dueDate: updatedDoc.data().dueDate?.toDate?.()?.toISOString() || updatedDoc.data().dueDate,
        completedDate: updatedDoc.data().completedDate?.toDate?.()?.toISOString() || updatedDoc.data().completedDate
      } : null;
    } catch (error) {
      console.error('Error updating milestone status:', error);
      throw new Error(`Failed to update milestone: ${error.message}`);
    }
  }

  /**
   * Get upcoming deadlines across all projects
   * @param {number} daysAhead - Number of days to look ahead
   * @returns {Array} Upcoming milestones
   */
  async getUpcomingDeadlines(daysAhead = 7) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const milestonesQuery = query(
        collection(this.firebaseService.db, 'milestones'),
        where('status', '!=', 'completed'),
        orderBy('dueDate', 'asc')
      );

      const snapshot = await getDocs(milestonesQuery);
      const allMilestones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || doc.data().dueDate,
        completedDate: doc.data().completedDate?.toDate?.()?.toISOString() || doc.data().completedDate
      }));

      // Filter by date range on client side
      return allMilestones.filter(milestone => {
        if (!milestone.dueDate) return false;
        const dueDate = new Date(milestone.dueDate);
        return dueDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error);
      throw new Error(`Failed to get upcoming deadlines: ${error.message}`);
    }
  }

  /**
   * Get overdue milestones
   * @returns {Array} Overdue milestones
   */
  async getOverdueMilestones() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const milestonesQuery = query(
        collection(this.firebaseService.db, 'milestones'),
        where('status', '!=', 'completed'),
        orderBy('dueDate', 'asc')
      );

      const snapshot = await getDocs(milestonesQuery);
      const allMilestones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || doc.data().dueDate,
        completedDate: doc.data().completedDate?.toDate?.()?.toISOString() || doc.data().completedDate
      }));

      // Filter overdue on client side
      return allMilestones.filter(milestone => {
        if (!milestone.dueDate) return false;
        const dueDate = new Date(milestone.dueDate);
        return dueDate < today;
      });
    } catch (error) {
      console.error('Error getting overdue milestones:', error);
      throw new Error(`Failed to get overdue milestones: ${error.message}`);
    }
  }

  /**
   * Generate project timeline data
   * @param {string} projectId - Project ID
   * @returns {Object} Timeline data with milestones and progress
   */
  async getProjectTimeline(projectId) {
    try {
      const [projectDoc, milestones] = await Promise.all([
        getDoc(doc(this.firebaseService.db, 'projects', projectId)),
        this.getProjectMilestones(projectId)
      ]);

      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const project = {
        id: projectDoc.id,
        ...projectDoc.data(),
        createdAt: projectDoc.data().createdAt?.toDate?.()?.toISOString() || projectDoc.data().createdAt,
        updatedAt: projectDoc.data().updatedAt?.toDate?.()?.toISOString() || projectDoc.data().updatedAt
      };

      // Calculate timeline statistics
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(m => m.status === 'completed').length;
      const overdueMilestones = milestones.filter(m => {
        if (!m.dueDate || m.status === 'completed') return false;
        return new Date(m.dueDate) < new Date();
      }).length;

      const upcomingMilestones = milestones.filter(m => {
        if (!m.dueDate || m.status === 'completed') return false;
        const dueDate = new Date(m.dueDate);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return dueDate <= weekFromNow;
      }).length;

      return {
        project,
        milestones,
        timeline: {
          totalMilestones,
          completedMilestones,
          overdueMilestones,
          upcomingMilestones,
          completionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Error getting project timeline:', error);
      throw new Error(`Failed to get project timeline: ${error.message}`);
    }
  }

  /**
   * Delete milestone
   * @param {string} milestoneId - Milestone ID
   * @returns {boolean} Success
   */
  async deleteMilestone(milestoneId) {
    const currentUser = this.checkAdminPermission();

    try {
      await deleteDoc(doc(this.firebaseService.db, 'milestones', milestoneId));
      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw new Error(`Failed to delete milestone: ${error.message}`);
    }
  }

  /**
   * Bulk update milestone statuses
   * @param {Array} milestoneIds - Array of milestone IDs
   * @param {string} status - New status
   * @returns {boolean} Success
   */
  async bulkUpdateMilestones(milestoneIds, status) {
    const currentUser = this.checkAdminPermission();

    try {
      const batch = writeBatch(this.firebaseService.db);
      const updateTime = serverTimestamp();

      milestoneIds.forEach(milestoneId => {
        const milestoneRef = doc(this.firebaseService.db, 'milestones', milestoneId);
        const updates = {
          status,
          updatedAt: updateTime,
          lastUpdatedBy: currentUser.uid
        };

        if (status === 'completed') {
          updates.completedDate = updateTime;
        }

        batch.update(milestoneRef, updates);
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error bulk updating milestones:', error);
      throw new Error(`Failed to bulk update milestones: ${error.message}`);
    }
  }
}

// Singleton instance
const milestoneService = new MilestoneService();
export default milestoneService;