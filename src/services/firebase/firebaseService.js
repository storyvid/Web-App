// Firebase Service Layer
// This provides an abstraction layer between the app and Firebase
// Making it easy to swap mock data for real Firebase calls

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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

import {
  validateUserRole,
  validateClientProfile,
  validateStaffProfile,
  validateAdminProfile,
  createRoleBasedUserDocument,
  CompanySchema
} from './roleSchemas';

// Mock data import (will be replaced with Firebase imports)
import { getRoleBasedData } from '../../data/mockData';
import getFirebaseConfig from './firebaseConfig';

class FirebaseService {
  constructor() {
    this.useMockData = false; // Switch to Firebase
    this.currentUser = null;
    this.app = null;
    this.db = null;
    this.auth = null;
    this.storage = null;
    this.analytics = null;
  }

  // Initialize Firebase
  async initialize() {
    if (this.useMockData) {
      console.log('Using mock data - Firebase not initialized');
      return;
    }
    
    try {
      const config = getFirebaseConfig();
      this.app = initializeApp(config);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      this.storage = getStorage(this.app);
      this.analytics = getAnalytics(this.app);
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Fallback to mock data if Firebase fails
      this.useMockData = true;
    }
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
    
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDoc = await this.getUser(credential.user.uid);
      this.currentUser = { 
        uid: credential.user.uid,
        email: credential.user.email,
        ...userDoc 
      };
      return { success: true, user: this.currentUser };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signOut() {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.currentUser = null;
      return;
    }
    
    await signOut(this.auth);
    this.currentUser = null;
  }

  // Set up auth state listener
  onAuthStateChanged(callback) {
    if (this.useMockData) {
      return () => {}; // Return empty unsubscribe function
    }
    
    return onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userDoc = await this.getUser(user.uid);
        this.currentUser = { 
          uid: user.uid,
          email: user.email,
          ...userDoc 
        };
        callback(this.currentUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  // User Methods
  async getUser(uid) {
    if (this.useMockData) {
      // Return mock user data
      return this.currentUser;
    }
    
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
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
    
    try {
      await setDoc(doc(this.db, 'users', userData.uid || userData.id), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return userData;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(uid, updates) {
    if (this.useMockData) {
      console.log('Mock: Updating user', uid, updates);
      return { ...this.currentUser, ...updates };
    }

    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Return updated user data
      const updatedDoc = await getDoc(userRef);
      return updatedDoc.exists() ? { id: updatedDoc.id, ...updatedDoc.data() } : null;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Role-based user creation
  async createRoleBasedUser(baseUserData, roleProfileData) {
    // Validate base user data
    const userValidation = validateUserRole(baseUserData);
    if (!userValidation.isValid) {
      throw new Error(`Invalid user data: ${userValidation.errors.join(', ')}`);
    }

    // Validate role-specific profile data
    let profileValidation;
    switch (baseUserData.role) {
      case 'client':
        profileValidation = validateClientProfile(roleProfileData);
        break;
      case 'staff':
        profileValidation = validateStaffProfile(roleProfileData);
        break;
      case 'admin':
        profileValidation = validateAdminProfile(roleProfileData);
        break;
      default:
        throw new Error('Invalid role specified');
    }

    if (!profileValidation.isValid) {
      throw new Error(`Invalid ${baseUserData.role} profile: ${profileValidation.errors.join(', ')}`);
    }

    if (this.useMockData) {
      console.log('Mock: Creating role-based user', baseUserData.role, roleProfileData);
      const mockUser = createRoleBasedUserDocument(baseUserData, roleProfileData);
      return { id: 'mock-user-id', ...mockUser };
    }

    try {
      // Create complete user document with role-specific profile
      const completeUserDoc = createRoleBasedUserDocument(baseUserData, roleProfileData);
      
      // For admin users, also create/update company document
      if (baseUserData.role === 'admin' && roleProfileData.company) {
        const companyId = await this.createOrUpdateCompany(roleProfileData.company, baseUserData.uid);
        completeUserDoc.adminProfile.companyId = companyId;
      }
      
      // For staff users, validate company code and link to company
      if (baseUserData.role === 'staff' && roleProfileData.companyCode) {
        const companyId = await this.validateCompanyCode(roleProfileData.companyCode);
        completeUserDoc.staffProfile.companyId = companyId;
      }

      await setDoc(doc(this.db, 'users', baseUserData.uid), {
        ...completeUserDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return completeUserDoc;
    } catch (error) {
      throw new Error(`Failed to create role-based user: ${error.message}`);
    }
  }

  // Company management methods
  async createOrUpdateCompany(companyData, adminUid) {
    if (this.useMockData) {
      console.log('Mock: Creating/updating company', companyData);
      return 'mock-company-id';
    }

    try {
      // Check if company already exists for this admin
      const existingCompanyQuery = query(
        collection(this.db, 'companies'),
        where('admins', 'array-contains', adminUid)
      );
      const existingCompanies = await getDocs(existingCompanyQuery);
      
      if (!existingCompanies.empty) {
        // Update existing company
        const companyDoc = existingCompanies.docs[0];
        await updateDoc(companyDoc.ref, {
          ...companyData,
          updatedAt: serverTimestamp()
        });
        return companyDoc.id;
      } else {
        // Create new company
        const companyDoc = {
          ...CompanySchema,
          ...companyData,
          admins: [adminUid],
          settings: {
            ...CompanySchema.settings,
            companyCode: this.generateCompanyCode(),
            ...companyData.settings
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = doc(collection(this.db, 'companies'));
        await setDoc(docRef, companyDoc);
        return docRef.id;
      }
    } catch (error) {
      throw new Error(`Failed to create/update company: ${error.message}`);
    }
  }

  async validateCompanyCode(companyCode) {
    if (this.useMockData) {
      console.log('Mock: Validating company code', companyCode);
      return 'mock-company-id';
    }

    try {
      const companyQuery = query(
        collection(this.db, 'companies'),
        where('settings.companyCode', '==', companyCode),
        where('isActive', '==', true)
      );
      const companies = await getDocs(companyQuery);
      
      if (companies.empty) {
        throw new Error('Invalid company code. Please check with your employer.');
      }

      return companies.docs[0].id;
    } catch (error) {
      throw new Error(`Company code validation failed: ${error.message}`);
    }
  }

  generateCompanyCode() {
    // Generate a unique 6-character company code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get user's company information
  async getUserCompany(uid) {
    if (this.useMockData) {
      console.log('Mock: Getting user company', uid);
      return null;
    }

    try {
      const user = await this.getUser(uid);
      if (!user) return null;

      let companyId = null;
      if (user.role === 'admin' && user.adminProfile?.companyId) {
        companyId = user.adminProfile.companyId;
      } else if (user.role === 'staff' && user.staffProfile?.companyId) {
        companyId = user.staffProfile.companyId;
      }

      if (!companyId) return null;

      const companyDoc = await getDoc(doc(this.db, 'companies', companyId));
      return companyDoc.exists() ? { id: companyDoc.id, ...companyDoc.data() } : null;
    } catch (error) {
      console.error('Error getting user company:', error);
      return null;
    }
  }

  async updateUserSettings(uid, settings) {
    if (this.useMockData) {
      console.log('Mock: Updating user settings', uid, settings);
      return settings;
    }

    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        settings: settings,
        updatedAt: serverTimestamp()
      });
      return settings;
    } catch (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  getCurrentUser() {
    return this.currentUser;
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