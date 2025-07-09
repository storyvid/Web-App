// Firebase Service Layer
// This provides an abstraction layer between the app and Firebase
// Making it easy to swap mock data for real Firebase calls

import { 
  createDocumentWithTimestamps, 
  updateDocumentWithTimestamp,
  validateSchema,
  UserSchema,
  ProjectSchema,
  MilestoneSchema,
  NotificationSchema,
  ActivitySchema
} from './schemas';

// Mock data import (will be replaced with Firebase imports)
import { getRoleBasedData } from '../../data/mockData';

class FirebaseService {
  constructor() {
    this.useMockData = true; // Toggle this to switch between mock and Firebase
    this.currentUser = null;
  }

  // Initialize Firebase (placeholder for actual Firebase config)
  async initialize(config = null) {
    if (this.useMockData) {
      console.log('Using mock data - Firebase not initialized');
      return;
    }
    
    // TODO: Replace with actual Firebase initialization
    // import { initializeApp } from 'firebase/app';
    // import { getFirestore } from 'firebase/firestore';
    // import { getAuth } from 'firebase/auth';
    // import { getStorage } from 'firebase/storage';
    
    // this.app = initializeApp(config);
    // this.db = getFirestore(this.app);
    // this.auth = getAuth(this.app);
    // this.storage = getStorage(this.app);
    
    console.log('Firebase initialized');
  }

  // Authentication Methods
  async signIn(email, password) {
    if (this.useMockData) {
      // Simulate the mock authentication
      const mockUsers = {
        'client@test.com': { 
          uid: 'client-uid-1',
          email: 'client@test.com',
          name: 'Alex',
          role: 'client',
          company: 'Tech Innovators Inc',
          accountType: 'Premium Client'
        },
        'staff@test.com': { 
          uid: 'staff-uid-1',
          email: 'staff@test.com',
          name: 'Jordan',
          role: 'staff',
          company: 'StoryVid Team',
          accountType: 'Video Editor'
        },
        'admin@test.com': { 
          uid: 'admin-uid-1',
          email: 'admin@test.com',
          name: 'Sam',
          role: 'admin',
          company: 'StoryVid',
          accountType: 'Production Manager'
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      const user = mockUsers[email];
      if (user && password) {
        this.currentUser = user;
        return { success: true, user };
      }
      throw new Error('Invalid credentials');
    }
    
    // TODO: Replace with actual Firebase Auth
    // try {
    //   const credential = await signInWithEmailAndPassword(this.auth, email, password);
    //   const userDoc = await this.getUser(credential.user.uid);
    //   this.currentUser = { ...credential.user, ...userDoc };
    //   return { success: true, user: this.currentUser };
    // } catch (error) {
    //   throw new Error(error.message);
    // }
  }

  async signOut() {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.currentUser = null;
      return;
    }
    
    // TODO: Replace with actual Firebase Auth
    // await signOut(this.auth);
    // this.currentUser = null;
  }

  // User Methods
  async getUser(uid) {
    if (this.useMockData) {
      // Return mock user data
      return this.currentUser;
    }
    
    // TODO: Replace with Firestore call
    // const userDoc = await getDoc(doc(this.db, 'users', uid));
    // return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  }

  async createUser(userData) {
    const validation = validateSchema(userData, UserSchema);
    if (!validation.isValid) {
      throw new Error(`Invalid user data: ${validation.errors.join(', ')}`);
    }

    if (this.useMockData) {
      console.log('Mock: Creating user', userData);
      return { id: 'mock-user-id', ...userData };
    }
    
    // TODO: Replace with Firestore call
    // const docRef = await addDoc(collection(this.db, 'users'), 
    //   createDocumentWithTimestamps(userData)
    // );
    // return { id: docRef.id, ...userData };
  }

  // Dashboard Data Methods
  async getDashboardData(userRole) {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      return getRoleBasedData(userRole);
    }
    
    // TODO: Replace with actual Firestore queries
    // This would involve multiple queries to get user-specific data
    // const projects = await this.getUserProjects(this.currentUser.uid);
    // const milestones = await this.getUserMilestones(this.currentUser.uid);
    // const notifications = await this.getUserNotifications(this.currentUser.uid);
    // const activities = await this.getUserActivities(this.currentUser.uid);
    // 
    // return {
    //   user: this.currentUser,
    //   projects,
    //   milestones,
    //   notifications,
    //   activities,
    //   stats: await this.getUserStats(this.currentUser.uid)
    // };
  }

  // Project Methods
  async getProjects(filters = {}) {
    if (this.useMockData) {
      const data = getRoleBasedData(this.currentUser?.role || 'client');
      return data.projects;
    }
    
    // TODO: Replace with Firestore query
    // let query = collection(this.db, 'projects');
    // 
    // if (filters.clientId) {
    //   query = query(query, where('clientId', '==', filters.clientId));
    // }
    // if (filters.status) {
    //   query = query(query, where('status', '==', filters.status));
    // }
    // 
    // const snapshot = await getDocs(query);
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createProject(projectData) {
    const validation = validateSchema(projectData, ProjectSchema);
    if (!validation.isValid) {
      throw new Error(`Invalid project data: ${validation.errors.join(', ')}`);
    }

    if (this.useMockData) {
      console.log('Mock: Creating project', projectData);
      return { id: 'mock-project-id', ...projectData };
    }
    
    // TODO: Replace with Firestore call
    // const docRef = await addDoc(collection(this.db, 'projects'), 
    //   createDocumentWithTimestamps(projectData)
    // );
    // return { id: docRef.id, ...projectData };
  }

  async updateProject(projectId, updates) {
    if (this.useMockData) {
      console.log('Mock: Updating project', projectId, updates);
      return { id: projectId, ...updates };
    }
    
    // TODO: Replace with Firestore call
    // await updateDoc(doc(this.db, 'projects', projectId), 
    //   updateDocumentWithTimestamp(updates)
    // );
    // return { id: projectId, ...updates };
  }

  // Milestone Methods
  async getMilestones(projectId = null) {
    if (this.useMockData) {
      const data = getRoleBasedData(this.currentUser?.role || 'client');
      return projectId ? 
        data.milestones.filter(m => m.projectId === projectId) : 
        data.milestones;
    }
    
    // TODO: Replace with Firestore query
    // let query = collection(this.db, 'milestones');
    // 
    // if (projectId) {
    //   query = query(query, where('projectId', '==', projectId));
    // }
    // 
    // const snapshot = await getDocs(query);
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createMilestone(milestoneData) {
    const validation = validateSchema(milestoneData, MilestoneSchema);
    if (!validation.isValid) {
      throw new Error(`Invalid milestone data: ${validation.errors.join(', ')}`);
    }

    if (this.useMockData) {
      console.log('Mock: Creating milestone', milestoneData);
      return { id: 'mock-milestone-id', ...milestoneData };
    }
    
    // TODO: Replace with Firestore call
  }

  // Notification Methods
  async getNotifications(userId) {
    if (this.useMockData) {
      const data = getRoleBasedData(this.currentUser?.role || 'client');
      return data.notifications;
    }
    
    // TODO: Replace with Firestore query
    // const q = query(
    //   collection(this.db, 'notifications'),
    //   where('userId', '==', userId),
    //   orderBy('createdAt', 'desc'),
    //   limit(50)
    // );
    // const snapshot = await getDocs(q);
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createNotification(notificationData) {
    const validation = validateSchema(notificationData, NotificationSchema);
    if (!validation.isValid) {
      throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
    }

    if (this.useMockData) {
      console.log('Mock: Creating notification', notificationData);
      return { id: 'mock-notification-id', ...notificationData };
    }
    
    // TODO: Replace with Firestore call
  }

  async markNotificationAsRead(notificationId) {
    if (this.useMockData) {
      console.log('Mock: Marking notification as read', notificationId);
      return;
    }
    
    // TODO: Replace with Firestore call
    // await updateDoc(doc(this.db, 'notifications', notificationId), {
    //   read: true,
    //   readAt: new Date()
    // });
  }

  // Activity Methods
  async logActivity(activityData) {
    const validation = validateSchema(activityData, ActivitySchema);
    if (!validation.isValid) {
      throw new Error(`Invalid activity data: ${validation.errors.join(', ')}`);
    }

    if (this.useMockData) {
      console.log('Mock: Logging activity', activityData);
      return;
    }
    
    // TODO: Replace with Firestore call
    // await addDoc(collection(this.db, 'activities'), 
    //   createDocumentWithTimestamps(activityData)
    // );
  }

  async getActivities(filters = {}) {
    if (this.useMockData) {
      const data = getRoleBasedData(this.currentUser?.role || 'client');
      return data.activities;
    }
    
    // TODO: Replace with Firestore query with filters
  }

  // File/Asset Methods
  async uploadFile(file, projectId = null, milestoneId = null) {
    if (this.useMockData) {
      console.log('Mock: Uploading file', file.name);
      return {
        id: 'mock-file-id',
        name: file.name,
        url: 'https://mock-url.com',
        type: file.type,
        size: file.size
      };
    }
    
    // TODO: Replace with Firebase Storage upload
    // const storageRef = ref(this.storage, `files/${Date.now()}-${file.name}`);
    // const snapshot = await uploadBytes(storageRef, file);
    // const downloadUrl = await getDownloadURL(snapshot.ref);
    // 
    // const assetData = {
    //   name: file.name,
    //   originalName: file.name,
    //   type: file.type.split('/')[0],
    //   mimeType: file.type,
    //   size: file.size,
    //   storageUrl: downloadUrl,
    //   storagePath: snapshot.ref.fullPath,
    //   uploadedBy: this.currentUser.uid,
    //   projectId,
    //   milestoneId
    // };
    // 
    // const docRef = await addDoc(collection(this.db, 'assets'), 
    //   createDocumentWithTimestamps(assetData)
    // );
    // 
    // return { id: docRef.id, ...assetData };
  }

  // Utility Methods
  setMockMode(useMock) {
    this.useMockData = useMock;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Real-time subscriptions (for Firebase)
  subscribeToProject(projectId, callback) {
    if (this.useMockData) {
      console.log('Mock: Subscribing to project', projectId);
      return () => console.log('Mock: Unsubscribed from project');
    }
    
    // TODO: Replace with Firestore real-time listener
    // return onSnapshot(doc(this.db, 'projects', projectId), callback);
  }

  subscribeToNotifications(userId, callback) {
    if (this.useMockData) {
      console.log('Mock: Subscribing to notifications for user', userId);
      return () => console.log('Mock: Unsubscribed from notifications');
    }
    
    // TODO: Replace with Firestore real-time listener
    // const q = query(
    //   collection(this.db, 'notifications'),
    //   where('userId', '==', userId),
    //   where('read', '==', false)
    // );
    // return onSnapshot(q, callback);
  }
}

// Singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;