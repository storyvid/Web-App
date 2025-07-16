// Milestone Service - Handles milestone-related operations
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseService from './firebaseService';

class MilestoneService {
  constructor() {
    this.collectionName = 'milestones';
  }

  // Create a new milestone
  async createMilestone(projectId, milestoneData) {
    try {
      const docRef = doc(collection(firebaseService.db, this.collectionName));
      const milestone = {
        ...milestoneData,
        projectId,
        createdBy: firebaseService.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Default status if not provided
        status: milestoneData.status || 'pending',
        // Default order based on existing milestones
        order: milestoneData.order || await this.getNextOrder(projectId),
        // Track revisions
        revisionCount: 0,
        maxRevisions: 2
      };

      await setDoc(docRef, milestone);
      
      // Return milestone with generated ID
      return {
        id: docRef.id,
        ...milestone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw new Error(`Failed to create milestone: ${error.message}`);
    }
  }

  // Get milestones for a project
  async getProjectMilestones(projectId) {
    try {
      const milestonesQuery = query(
        collection(firebaseService.db, this.collectionName),
        where('projectId', '==', projectId),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(milestonesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || doc.data().dueDate
      }));
    } catch (error) {
      console.error('Error getting project milestones:', error);
      throw new Error(`Failed to get milestones: ${error.message}`);
    }
  }

  // Get single milestone
  async getMilestone(milestoneId) {
    try {
      const milestoneDoc = await getDoc(doc(firebaseService.db, this.collectionName, milestoneId));
      
      if (!milestoneDoc.exists()) {
        return null;
      }

      const data = milestoneDoc.data();
      return {
        id: milestoneDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        dueDate: data.dueDate?.toDate?.()?.toISOString() || data.dueDate
      };
    } catch (error) {
      console.error('Error getting milestone:', error);
      throw new Error(`Failed to get milestone: ${error.message}`);
    }
  }

  // Update milestone
  async updateMilestone(milestoneId, updates) {
    try {
      const milestoneRef = doc(firebaseService.db, this.collectionName, milestoneId);
      
      // Convert date strings back to timestamps if needed
      const processedUpdates = { ...updates };
      if (processedUpdates.dueDate && typeof processedUpdates.dueDate === 'string') {
        processedUpdates.dueDate = new Date(processedUpdates.dueDate);
      }

      await updateDoc(milestoneRef, {
        ...processedUpdates,
        updatedAt: serverTimestamp()
      });

      // Return updated milestone
      return await this.getMilestone(milestoneId);
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw new Error(`Failed to update milestone: ${error.message}`);
    }
  }

  // Update milestone status (for client approvals)
  async updateMilestoneStatus(milestoneId, status, feedback = null) {
    try {
      const updates = {
        status,
        updatedAt: serverTimestamp()
      };

      // Add feedback if provided
      if (feedback) {
        updates.feedback = feedback;
        updates.feedbackAt = serverTimestamp();
      }

      // Track revision requests
      if (status === 'revision_requested') {
        const milestone = await this.getMilestone(milestoneId);
        updates.revisionCount = (milestone.revisionCount || 0) + 1;
        
        // Check if max revisions exceeded
        if (updates.revisionCount > (milestone.maxRevisions || 2)) {
          throw new Error(`Maximum revisions (${milestone.maxRevisions || 2}) exceeded for this milestone`);
        }
      }

      await this.updateMilestone(milestoneId, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating milestone status:', error);
      throw error;
    }
  }

  // Reorder milestones (drag and drop)
  async reorderMilestones(projectId, milestoneOrders) {
    try {
      // milestoneOrders is an array of { id, order } objects
      const batch = firebaseService.db._delegate ? 
        (await import('firebase/firestore')).writeBatch(firebaseService.db) :
        null;

      if (!batch) {
        throw new Error('Batch operations not supported');
      }

      for (const { id, order } of milestoneOrders) {
        const milestoneRef = doc(firebaseService.db, this.collectionName, id);
        batch.update(milestoneRef, {
          order,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error reordering milestones:', error);
      throw new Error(`Failed to reorder milestones: ${error.message}`);
    }
  }

  // Delete milestone
  async deleteMilestone(milestoneId) {
    try {
      await deleteDoc(doc(firebaseService.db, this.collectionName, milestoneId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw new Error(`Failed to delete milestone: ${error.message}`);
    }
  }

  // Get next order number for new milestone
  async getNextOrder(projectId) {
    try {
      const milestonesQuery = query(
        collection(firebaseService.db, this.collectionName),
        where('projectId', '==', projectId),
        orderBy('order', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(milestonesQuery);
      
      if (snapshot.empty) {
        return 0;
      }

      const lastMilestone = snapshot.docs[0].data();
      return (lastMilestone.order || 0) + 1;
    } catch (error) {
      console.error('Error getting next order:', error);
      return 0;
    }
  }

  // Get milestones by status
  async getMilestonesByStatus(projectId, status) {
    try {
      const milestonesQuery = query(
        collection(firebaseService.db, this.collectionName),
        where('projectId', '==', projectId),
        where('status', '==', status),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(milestonesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || doc.data().dueDate
      }));
    } catch (error) {
      console.error('Error getting milestones by status:', error);
      throw new Error(`Failed to get milestones by status: ${error.message}`);
    }
  }

  // Get milestones for a user (based on role)
  async getUserMilestones(userId, userRole) {
    try {
      let milestonesQuery;

      if (userRole === 'client') {
        // Clients see milestones from their projects
        const userProjects = await firebaseService.getUserProjects(userId);
        const projectIds = userProjects.map(p => p.id);
        
        if (projectIds.length === 0) {
          return [];
        }

        // Note: Firestore doesn't support array-contains with multiple values
        // We'll need to make separate queries or restructure data
        milestonesQuery = query(
          collection(firebaseService.db, this.collectionName),
          where('projectId', 'in', projectIds.slice(0, 10)), // Firestore limit
          orderBy('dueDate', 'asc')
        );
      } else {
        // Staff and admin see all milestones they have access to
        milestonesQuery = query(
          collection(firebaseService.db, this.collectionName),
          orderBy('dueDate', 'asc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(milestonesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || doc.data().dueDate
      }));
    } catch (error) {
      console.error('Error getting user milestones:', error);
      throw new Error(`Failed to get user milestones: ${error.message}`);
    }
  }
}

// Export singleton instance
const milestoneService = new MilestoneService();
export default milestoneService;