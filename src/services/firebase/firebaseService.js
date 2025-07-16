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
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
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
    this.useMockData = false; // Always use real Firebase - no more mock mode
    this.currentUser = null;
    this.app = null;
    this.db = null;
    this.auth = null;
    this.storage = null;
    this.analytics = null;
  }

  // Initialize Firebase
  async initialize() {
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
      throw new Error('Firebase initialization failed. Please check your configuration.');
    }
  }

  // Authentication Methods
  async signIn(email, password) {
    if (!this.auth) {
      throw new Error('Authentication service not initialized');
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
      throw error; // Pass through the original Firebase error with code
    }
  }

  // Google Sign-In
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(this.auth, provider);
      
      // Check if user exists in our database
      let userDoc = await this.getUser(result.user.uid);
      
      if (!userDoc) {
        // New user - create basic profile
        const newUserData = {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL,
          role: null,
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
          authProvider: 'google'
        };
        
        // Save to Firestore using updateUser (simpler, no strict validation)
        userDoc = await this.updateUser(result.user.uid, newUserData);
      }
      
      this.currentUser = { 
        uid: result.user.uid,
        email: result.user.email,
        ...userDoc 
      };
      
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error; // Pass through the original Firebase error with code
    }
  }

  // Create User Account
  async createUserWithEmailAndPassword(name, email, password) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Create user profile in Firestore
      const userDoc = {
        name: name,
        email: email,
        role: null,
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
        authProvider: 'email'
      };
      
      // Save to Firestore using updateUser (simpler, no strict validation)
      const savedUser = await this.updateUser(credential.user.uid, userDoc);
      
      this.currentUser = { 
        uid: credential.user.uid,
        email: credential.user.email,
        ...savedUser 
      };
      
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('User creation error:', error);
      throw error; // Pass through the original Firebase error with code
    }
  }

  // Password Reset
  async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error; // Pass through the original Firebase error with code
    }
  }

  async signOut() {
    await signOut(this.auth);
    this.currentUser = null;
  }

  // Set up auth state listener
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userDoc = await this.getUser(user.uid);
        this.currentUser = { 
          uid: user.uid,
          email: user.email,
          ...userDoc 
        };
        // Ensure all timestamps are serialized before calling callback
        callback(this.currentUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  // User Methods
  async getUser(uid) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Convert Firebase Timestamps to strings for Redux serialization
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      }
      return null;
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
    
    try {
      const userDocData = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(this.db, 'users', userData.uid || userData.id), userDocData);
      
      // Return the user data with serialized timestamps
      return {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(uid, updates) {
    console.log('📝 updateUser called with:', { uid, updates });

    try {
      const userRef = doc(this.db, 'users', uid);
      
      console.log('📝 Using setDoc with merge for user:', uid);
      // Use setDoc with merge to create or update the document
      await setDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ setDoc completed successfully');
      
      // Return updated user data with serialized timestamps
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data();
        // Convert Firebase Timestamps to strings for Redux serialization
        return {
          id: updatedDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('❌ updateUser error details:', error);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`[updateUser] Failed to update user: ${error.message}`);
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
  async getDashboardData(userRole, userId) {
    try {
      console.log(`📊 Loading dashboard data for user ${userId} with role ${userRole}`);
      
      // Get user-specific data from Firestore
      const [projects, notifications, activities] = await Promise.all([
        this.getUserProjects(userId),
        this.getUserNotifications(userId),
        this.getUserActivities(userId)
      ]);

      console.log(`📈 Dashboard data loaded:`, {
        projects: projects.length,
        notifications: notifications.length,
        activities: activities.length
      });

      // Calculate stats based on real data
      const stats = this.calculateUserStats(projects, notifications, userRole);

      return {
        user: this.currentUser,
        projects: projects || [],
        notifications: notifications || [],
        activities: activities || [],
        stats: stats
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Return empty data structure if Firebase fails
      return {
        user: this.currentUser,
        projects: [],
        notifications: [],
        activities: [],
        stats: this.calculateUserStats([], [], userRole)
      };
    }
  }

  // Get user-specific projects
  async getUserProjects(userId) {
    try {
      console.log(`🗂️ Getting projects for user ${userId} with role ${this.currentUser?.role}`);
      
      let projectsQuery;
      const userRole = this.currentUser?.role;
      
      if (userRole === 'admin') {
        // Admin sees all projects in their company
        projectsQuery = query(
          collection(this.db, 'projects'),
          where('companyId', '==', this.currentUser?.companyId || 'storyvid-productions')
        );
      } else if (userRole === 'staff') {
        // Staff sees projects they're assigned to
        projectsQuery = query(
          collection(this.db, 'projects'),
          where('assignedStaff', 'array-contains', userId)
        );
      } else {
        // Clients see their own projects
        projectsQuery = query(
          collection(this.db, 'projects'),
          where('createdBy', '==', userId)
        );
      }

      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to strings for serialization
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
      
      console.log(`📋 Found ${projects.length} projects for user ${userId}`);
      return projects;
    } catch (error) {
      console.error('Error getting user projects:', error);
      return [];
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limitCount = 20) {
    try {
      console.log(`🔔 Getting notifications for user ${userId}`);
      console.log(`🔧 Using database instance:`, this.db ? 'Available' : 'Missing');
      
      const notificationsQuery = query(
        collection(this.db, 'notifications'),
        where('userId', '==', userId),
        limit(limitCount)
      );

      console.log(`🔍 Executing query for notifications...`);
      const snapshot = await getDocs(notificationsQuery);
      console.log(`📊 Query executed, found ${snapshot.size} documents`);
      
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      }));
      
      console.log(`📬 Found ${notifications.length} notifications for user ${userId}`);
      
      // Debug: log first notification if exists
      if (notifications.length > 0) {
        console.log(`📄 Sample notification:`, {
          id: notifications[0].id,
          title: notifications[0].title,
          userId: notifications[0].userId
        });
      } else {
        console.log(`❌ No notifications found for userId: ${userId}`);
        
        // Debug: Check if any notifications exist at all
        const allNotificationsSnapshot = await getDocs(collection(this.db, 'notifications'));
        console.log(`🔍 Total notifications in database: ${allNotificationsSnapshot.size}`);
        
        if (allNotificationsSnapshot.size > 0) {
          const sampleDoc = allNotificationsSnapshot.docs[0];
          console.log(`📄 Sample notification in DB:`, {
            id: sampleDoc.id,
            userId: sampleDoc.data().userId,
            title: sampleDoc.data().title
          });
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      console.error('Error details:', error.message);
      return [];
    }
  }

  // Get user activities
  async getUserActivities(userId, limitCount = 10) {
    try {
      console.log(`📊 Getting activities for user ${userId}`);
      
      const activitiesQuery = query(
        collection(this.db, 'activities'),
        where('userId', '==', userId),
        limit(limitCount)
      );

      const snapshot = await getDocs(activitiesQuery);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      }));
      
      console.log(`📈 Found ${activities.length} activities for user ${userId}`);
      return activities;
    } catch (error) {
      console.error('Error getting user activities:', error);
      return [];
    }
  }

  // Calculate user stats from real data
  calculateUserStats(projects, notifications, userRole) {
    const stats = {};

    switch (userRole) {
      case 'admin':
        stats.totalClients = new Set(projects.map(p => p.client)).size;
        stats.activeProjects = projects.filter(p => p.status === 'in-production').length;
        stats.teamMembers = 5; // TODO: Calculate from company staff
        break;
      
      case 'staff':
        stats.assignedTasks = projects.length;
        stats.completedToday = projects.filter(p => p.progress === 100).length;
        stats.upcomingDeadlines = projects.filter(p => {
          // Simple deadline check - in real app would parse dates
          return p.nextMilestone?.includes('Jan');
        }).length;
        break;
      
      case 'client':
      default:
        stats.myProjects = projects.length;
        stats.pendingApprovals = projects.filter(p => p.status === 'in-review').length;
        stats.deliveredVideos = projects.filter(p => p.progress === 100).length;
        break;
    }

    return stats;
  }

  // Project Methods
  async getProjects(filters = {}) {
    if (this.useMockData) {
      const data = getRoleBasedData(this.currentUser?.role || 'client');
      let projects = data.projects;
      
      // Apply filters to mock data
      if (filters.clientId) {
        projects = projects.filter(p => p.clientId === filters.clientId);
      }
      if (filters.assignedStaff) {
        projects = projects.filter(p => p.assignedStaff?.includes(filters.assignedStaff));
      }
      if (filters.companyId) {
        projects = projects.filter(p => p.companyId === filters.companyId);
      }
      if (filters.status) {
        projects = projects.filter(p => p.status === filters.status);
      }
      
      return projects;
    }
    
    try {
      let q = collection(this.db, 'projects');
      
      // Apply filters
      if (filters.clientId) {
        q = query(q, where('clientId', '==', filters.clientId));
      }
      if (filters.assignedStaff) {
        q = query(q, where('assignedStaff', 'array-contains', filters.assignedStaff));
      }
      if (filters.companyId) {
        q = query(q, where('companyId', '==', filters.companyId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  async getProject(projectId) {
    if (this.useMockData) {
      const data = getRoleBasedData(this.currentUser?.role || 'client');
      return data.projects.find(p => p.id === projectId) || null;
    }

    try {
      const projectDoc = await getDoc(doc(this.db, 'projects', projectId));
      return projectDoc.exists() ? { id: projectDoc.id, ...projectDoc.data() } : null;
    } catch (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  async createProject(projectData) {
    if (this.useMockData) {
      console.log('Mock: Creating project', projectData);
      return { id: `mock-project-${Date.now()}`, ...projectData };
    }
    
    try {
      const docRef = doc(collection(this.db, 'projects'));
      await setDoc(docRef, {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...projectData };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async updateProject(projectId, updates) {
    if (this.useMockData) {
      console.log('Mock: Updating project', projectId, updates);
      return { id: projectId, ...updates };
    }
    
    try {
      const projectRef = doc(this.db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Return updated project data
      const updatedDoc = await getDoc(projectRef);
      return updatedDoc.exists() ? { id: updatedDoc.id, ...updatedDoc.data() } : null;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  // Milestone Methods
  async getMilestones(projectId = null) {
    try {
      let milestonesQuery;
      
      if (projectId) {
        milestonesQuery = query(
          collection(this.db, 'milestones'),
          where('projectId', '==', projectId),
          orderBy('order', 'asc')
        );
      } else {
        milestonesQuery = query(
          collection(this.db, 'milestones'),
          orderBy('dueDate', 'asc')
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
      console.error('Error getting milestones:', error);
      return [];
    }
  }

  async createMilestone(projectId, milestoneData) {
    try {
      const docRef = doc(collection(this.db, 'milestones'));
      const milestone = {
        ...milestoneData,
        projectId,
        createdBy: this.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: milestoneData.status || 'pending',
        revisionCount: 0,
        maxRevisions: 2
      };

      await setDoc(docRef, milestone);
      
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

  async updateMilestone(milestoneId, updates) {
    try {
      const milestoneRef = doc(this.db, 'milestones', milestoneId);
      
      await updateDoc(milestoneRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Return updated milestone
      const updatedDoc = await getDoc(milestoneRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data();
        return {
          id: updatedDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          dueDate: data.dueDate?.toDate?.()?.toISOString() || data.dueDate
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw new Error(`Failed to update milestone: ${error.message}`);
    }
  }

  async deleteMilestone(milestoneId) {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(this.db, 'milestones', milestoneId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw new Error(`Failed to delete milestone: ${error.message}`);
    }
  }

  async reorderMilestones(projectId, milestoneOrders) {
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(this.db);

      for (const { id, order } of milestoneOrders) {
        const milestoneRef = doc(this.db, 'milestones', id);
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
  async uploadFile(file, options = {}) {
    try {
      const {
        projectId = null,
        milestoneId = null,
        category = 'general',
        onProgress = null
      } = options;

      if (!this.currentUser) {
        throw new Error('User must be authenticated to upload files');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `files/${this.currentUser.uid}/${timestamp}-${sanitizedFileName}`;
      
      // Create storage reference
      const { ref, uploadBytes, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      const storageRef = ref(this.storage, storagePath);

      // Upload file with progress tracking
      let uploadTask;
      if (onProgress) {
        uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            throw error;
          }
        );
        
        await uploadTask;
      } else {
        await uploadBytes(storageRef, file);
      }

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Determine file type
      const extension = file.name.split('.').pop().toLowerCase();
      const typeMap = {
        video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        document: ['pdf', 'doc', 'docx', 'txt'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        audio: ['mp3', 'wav', 'aac', 'm4a']
      };
      
      let fileType = 'other';
      for (const [type, extensions] of Object.entries(typeMap)) {
        if (extensions.includes(extension)) {
          fileType = type;
          break;
        }
      }

      // Create file document in Firestore
      const fileData = {
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: fileType,
        mimeType: file.type,
        downloadURL,
        storagePath,
        projectId,
        milestoneId,
        category,
        uploadedBy: this.currentUser.uid,
        uploadedByName: this.currentUser.name || this.currentUser.email,
        isPublic: false,
        downloadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = doc(collection(this.db, 'files'));
      await setDoc(docRef, fileData);

      return {
        id: docRef.id,
        ...fileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getProjectFiles(projectId, options = {}) {
    try {
      const { category = null, type = null, limitCount = 100 } = options;

      let filesQuery = query(
        collection(this.db, 'files'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      if (category) {
        filesQuery = query(filesQuery, where('category', '==', category));
      }

      if (type) {
        filesQuery = query(filesQuery, where('type', '==', type));
      }

      if (limitCount) {
        filesQuery = query(filesQuery, limit(limitCount));
      }

      const snapshot = await getDocs(filesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
    } catch (error) {
      console.error('Error getting project files:', error);
      return [];
    }
  }

  async getMilestoneFiles(milestoneId, options = {}) {
    try {
      const { type = null, limitCount = 50 } = options;

      let filesQuery = query(
        collection(this.db, 'files'),
        where('milestoneId', '==', milestoneId),
        orderBy('createdAt', 'desc')
      );

      if (type) {
        filesQuery = query(filesQuery, where('type', '==', type));
      }

      if (limitCount) {
        filesQuery = query(filesQuery, limit(limitCount));
      }

      const snapshot = await getDocs(filesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
    } catch (error) {
      console.error('Error getting milestone files:', error);
      return [];
    }
  }

  async downloadFile(fileId) {
    try {
      const fileDoc = await getDoc(doc(this.db, 'files', fileId));
      
      if (!fileDoc.exists()) {
        throw new Error('File not found');
      }

      const fileData = fileDoc.data();
      
      // Track the download
      await updateDoc(doc(this.db, 'files', fileId), {
        downloadCount: (fileData.downloadCount || 0) + 1,
        lastDownloadAt: serverTimestamp(),
        lastDownloadBy: this.currentUser?.uid
      });

      return {
        downloadURL: fileData.downloadURL,
        fileName: fileData.name,
        size: fileData.size,
        type: fileData.type
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async deleteFile(fileId) {
    try {
      // Get file document first
      const fileDoc = await getDoc(doc(this.db, 'files', fileId));
      
      if (!fileDoc.exists()) {
        throw new Error('File not found');
      }

      const fileData = fileDoc.data();

      // Check permissions - only uploader or admin can delete
      if (fileData.uploadedBy !== this.currentUser?.uid && this.currentUser?.role !== 'admin') {
        throw new Error('Permission denied: You can only delete your own files');
      }

      // Delete from Firebase Storage
      const { ref, deleteObject } = await import('firebase/storage');
      const storageRef = ref(this.storage, fileData.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(this.db, 'files', fileId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Profile picture upload
  async uploadProfilePicture(uid, file) {

    try {
      // TODO: Implement Firebase Storage upload for profile pictures
      // const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      // const storageRef = ref(this.storage, `profile-pictures/${uid}/${Date.now()}-${file.name}`);
      // const snapshot = await uploadBytes(storageRef, file);
      // const downloadURL = await getDownloadURL(snapshot.ref);
      // 
      // // Update user profile with new avatar URL
      // await this.updateUser(uid, { avatar: downloadURL });
      // 
      // return {
      //   downloadURL,
      //   fileName: file.name,
      //   size: file.size,
      //   storagePath: snapshot.ref.fullPath
      // };
      
      // For now, return a mock implementation
      console.log('Profile picture upload not implemented yet, using mock');
      const mockUrl = URL.createObjectURL(file);
      await this.updateUser(uid, { avatar: mockUrl });
      
      return {
        downloadURL: mockUrl,
        fileName: file.name,
        size: file.size
      };
    } catch (error) {
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }
  }

  // Change user password
  async changePassword(currentPassword, newPassword) {

    try {
      const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = await import('firebase/auth');
      
      if (!this.auth.currentUser) {
        throw new Error('No authenticated user');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        this.auth.currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(this.auth.currentUser, credential);
      
      // Update to new password
      await updatePassword(this.auth.currentUser, newPassword);
      
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      throw error; // Pass through the original Firebase error with code
    }
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