// Firebase Service Layer
// This provides an abstraction layer between the app and Firebase
// Making it easy to swap mock data for real Firebase calls

import { initializeApp, getApp, deleteApp } from 'firebase/app';
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
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  getBlob
} from 'firebase/storage';
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
import { debugFirebaseConfig } from '../../utils/debugFirebaseConfig';

class FirebaseService {
  constructor() {
    console.log('🔥 FirebaseService constructor called');
    this.useMockData = true; // Temporarily use mock data for debugging
    console.log('🔥 useMockData set to:', this.useMockData);
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
      console.log('🔍 Initializing Firebase with config:');
      console.log('  Project ID:', config.projectId);
      console.log('  Storage Bucket:', config.storageBucket);
      console.log('  Auth Domain:', config.authDomain);
      
      // Debug Firebase configuration
      debugFirebaseConfig();
      
      // Check if Firebase app already exists and force refresh if config changed
      try {
        this.app = initializeApp(config, 'storyvid-main');
      } catch (error) {
        if (error.code === 'app/duplicate-app') {
          console.log('🔄 Firebase app already exists, checking if config changed');
          const existingApp = getApp('storyvid-main');
          
          // Check if storage bucket changed - if so, delete and recreate
          if (existingApp.options.storageBucket !== config.storageBucket) {
            console.log('🔄 Config changed! Deleting existing app and recreating');
            console.log('  Old bucket:', existingApp.options.storageBucket);
            console.log('  New bucket:', config.storageBucket);
            await deleteApp(existingApp);
            this.app = initializeApp(config, 'storyvid-main');
          } else {
            console.log('🔄 Config unchanged, using existing app');
            this.app = existingApp;
          }
        } else {
          throw error;
        }
      }
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      this.storage = getStorage(this.app);
      // this.analytics = getAnalytics(this.app); // Analytics disabled for now
      
      console.log('✅ Firebase initialized successfully');
      console.log('📊 Actual Storage Instance:', this.storage.app.options.storageBucket);
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
        this.getUserProjects(userId, userRole),
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
  async getUserProjects(userId, roleOverride = null) {
    try {
      // Use the provided role or fall back to currentUser role
      const userRole = roleOverride || this.currentUser?.role;
      console.log(`🗂️ Getting projects for user ${userId} with role ${userRole}`);
      
      let projectsQuery;
      
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

  // Enhanced project methods for admin management
  async getAllUsers() {
    if (this.useMockData) {
      console.log('Mock: Getting all users');
      return [];
    }

    try {
      const usersQuery = query(
        collection(this.db, 'users'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to get all users: ${error.message}`);
    }
  }

  async getAllProjects() {
    if (this.useMockData) {
      console.log('Mock: Getting all projects');
      return [];
    }

    try {
      // Simple query without orderBy to avoid index requirement for initial testing
      const projectsQuery = collection(this.db, 'projects');

      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
      
      // Sort on client side
      return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      throw new Error(`Failed to get all projects: ${error.message}`);
    }
  }

  async getProjectsByUser(userId) {
    if (this.useMockData) {
      console.log('Mock: Getting projects by user', userId);
      return [];
    }

    try {
      const projectsQuery = query(
        collection(this.db, 'projects'),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(projectsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
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
    console.log('🔔 createNotification called with:', notificationData);
    
    if (this.useMockData) {
      console.log('Mock: Creating notification (skipping validation)', notificationData);
      return { id: notificationData.id || 'mock-notification-id', ...notificationData };
    }
    
    const validation = validateSchema(notificationData, NotificationSchema);
    if (!validation.isValid) {
      console.error('❌ Notification validation failed:', validation.errors);
      throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
    }
    
    try {
      const docRef = doc(collection(this.db, 'notifications'));
      await setDoc(docRef, {
        ...notificationData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
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

  // Helper function to convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix to get just the base64 data
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // File/Asset Methods
  async uploadFile(file, options = {}) {
    console.log('🚀 uploadFile called');
    console.log('🚀 currentUser:', this.currentUser);
    console.log('🚀 user uid:', this.currentUser?.uid);
    console.log('🚀 user role:', this.currentUser?.role);
    console.log('🚀 file object:', file);
    console.log('🚀 file name:', file?.name);
    console.log('🚀 file type:', file?.type);
    
    try {
      // Validate file object first
      if (!file) {
        throw new Error('No file provided for upload');
      }
      
      if (!file.name) {
        throw new Error('File object is missing name property');
      }
      
      const {
        projectId = null,
        milestoneId = null,
        category = 'files', // Changed default to 'files'
        onProgress = null
      } = options;

      if (!this.currentUser) {
        throw new Error('User must be authenticated to upload files');
      }

      if (!this.storage) {
        throw new Error('Firebase Storage not initialized');
      }

      console.log('📁 Using Firebase Storage for file upload');

      // Determine file type
      const extension = file.name.split('.').pop().toLowerCase();
      const typeMap = {
        video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        document: ['pdf', 'doc', 'docx', 'txt'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        audio: ['mp3', 'wav', 'aac', 'm4a']
      };
      
      let fileType = 'document';
      for (const [type, extensions] of Object.entries(typeMap)) {
        if (extensions.includes(extension)) {
          fileType = type;
          break;
        }
      }

      // Create unique file path in storage
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `files/${this.currentUser.uid}/${timestamp}-${sanitizedFileName}`;
      const storageRef = ref(this.storage, storagePath);

      console.log('📤 Uploading file to Firebase Storage:', storagePath);
      console.log('🔍 Storage bucket being used:', this.storage.app.options.storageBucket);

      // Upload file to Firebase Storage
      if (onProgress) {
        onProgress(10); // Initial progress
      }

      let downloadURL;
      let status = 'uploaded';
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        console.log('✅ File uploaded to Firebase Storage');

        if (onProgress) {
          onProgress(50); // Upload complete, getting URL
        }

        // Get download URL
        downloadURL = await getDownloadURL(snapshot.ref);
        console.log('✅ Download URL obtained:', downloadURL);
      } catch (storageError) {
        console.error('❌ Firebase Storage upload failed:', storageError);
        console.log('🔄 Falling back to base64 storage in Firestore');
        
        // Fallback: convert file to base64 and store in Firestore
        const base64Data = await this.fileToBase64(file);
        downloadURL = `data:${file.type};base64,${base64Data}`;
        status = 'base64-stored';
        
        if (onProgress) {
          onProgress(50);
        }
      }

      if (onProgress) {
        onProgress(80); // URL obtained, saving metadata
      }

      // Create file document in Firestore with actual storage data
      const fileData = {
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: fileType,
        mimeType: file.type,
        downloadURL: downloadURL,
        storagePath: storagePath,
        projectId,
        milestoneId,
        category,
        uploadedBy: this.currentUser.uid,
        uploadedByName: this.currentUser.name || this.currentUser.email,
        isPublic: false,
        downloadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: status // Indicates how file is stored (uploaded, base64-stored, etc.)
      };

      const docRef = doc(collection(this.db, 'files'));
      await setDoc(docRef, fileData);

      console.log('✅ File metadata stored in Firestore:', docRef.id);

      return {
        id: docRef.id,
        ...fileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getProjectFiles(projectId, options = {}) {
    console.log('🔍 getProjectFiles called with:', { projectId, ...options });
    
    try {
      const { category = null, type = null, limitCount = 100 } = options;
      
      // Use simple query with only projectId to avoid composite index issues
      console.log('🔍 Executing simple Firestore query (projectId only)...');
      const filesQuery = query(
        collection(this.db, 'files'),
        where('projectId', '==', projectId)
      );

      const snapshot = await getDocs(filesQuery);
      
      let files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));

      console.log(`✅ Found ${files.length} total files for project ${projectId}`);

      // Filter by category in JavaScript if specified
      if (category) {
        console.log('🔍 Filtering by category in JavaScript:', category);
        files = files.filter(file => file.category === category);
        console.log(`✅ After category filter: ${files.length} files`);
      }

      // Filter by type in JavaScript if specified
      if (type) {
        console.log('🔍 Filtering by type in JavaScript:', type);
        files = files.filter(file => file.type === type);
        console.log(`✅ After type filter: ${files.length} files`);
      }

      // Sort by createdAt in JavaScript (newest first)
      files.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      // Limit results in JavaScript if specified
      if (limitCount && files.length > limitCount) {
        console.log(`🔍 Limiting results to ${limitCount} files`);
        files = files.slice(0, limitCount);
      }

      console.log(`📄 Final files after filter/sort/limit: ${files.length}`);
      return files;
      
    } catch (error) {
      console.error('❌ Error getting project files:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        projectId,
        options
      });
      
      // Return empty array on any error
      return [];
    }
  }

  async getMilestoneFiles(milestoneId, options = {}) {
    try {
      const { type = null, limitCount = 50 } = options;

      // Build query constraints array
      let queryConstraints = [
        where('milestoneId', '==', milestoneId)
      ];

      // Add type filter if provided
      if (type) {
        queryConstraints.push(where('type', '==', type));
      }

      // Only add orderBy if no type filter to avoid composite index requirement
      if (!type) {
        queryConstraints.push(orderBy('createdAt', 'desc'));
        if (limitCount) {
          queryConstraints.push(limit(limitCount));
        }
      }

      // Create the query with all constraints at once
      const filesQuery = query(collection(this.db, 'files'), ...queryConstraints);

      const snapshot = await getDocs(filesQuery);
      let files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));

      // If we have type filter, sort and limit in JavaScript
      if (type) {
        files = files
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limitCount);
      }

      return files;
    } catch (error) {
      console.error('Error getting milestone files:', error);
      return [];
    }
  }

  async downloadFile(fileId) {
    console.log('📥 downloadFile called for:', fileId);
    
    try {
      const fileDoc = await getDoc(doc(this.db, 'files', fileId));
      
      if (!fileDoc.exists()) {
        throw new Error('File not found');
      }

      const fileData = fileDoc.data();
      
      // Check if this is a metadata-only file (no actual storage)
      if (fileData.status === 'metadata-only' || fileData.downloadURL?.startsWith('#file-not-stored')) {
        console.log('⚠️ File is metadata-only - creating downloadable content from metadata');
        
        // Create a downloadable text file with file information
        const fileInfo = `File Information
=================

Name: ${fileData.name || fileData.originalName}
Type: ${fileData.type || 'Unknown'}
Category: ${fileData.category || 'Unknown'}
Size: ${fileData.size ? (fileData.size / 1024).toFixed(2) + ' KB' : 'Unknown'}
Uploaded: ${fileData.createdAt ? new Date(fileData.createdAt).toLocaleString() : 'Unknown'}
Uploaded by: ${fileData.uploadedByName || 'Unknown'}

Note: This file was uploaded as metadata-only. 
The actual file content is not stored in Firebase Storage.
To enable full file storage, configure Firebase Storage in your project.`;

        // Create a blob and download URL
        const blob = new Blob([fileInfo], { type: 'text/plain' });
        const downloadURL = URL.createObjectURL(blob);
        
        // Track the download
        await updateDoc(doc(this.db, 'files', fileId), {
          downloadCount: (fileData.downloadCount || 0) + 1,
          lastDownloadAt: serverTimestamp(),
          lastDownloadBy: this.currentUser?.uid
        });
        
        return {
          downloadURL,
          fileName: `${fileData.name || 'file'}_info.txt`,
          fileData,
          isMetadataOnly: true
        };
      }

      // Handle files with actual storage (Firebase Storage URLs or base64)
      let downloadURL = fileData.downloadURL;
      let forceDownload = false;

      if (fileData.status === 'base64-stored' || fileData.downloadURL?.startsWith('data:')) {
        console.log('📁 File is base64-stored, using data URL directly');
        // For base64 files, the downloadURL is already a data URL that can be used directly
      } else if (fileData.downloadURL && fileData.downloadURL.includes('firebasestorage.googleapis.com')) {
        console.log('📁 File is in Firebase Storage, modifying URL for download');
        // For Firebase Storage URLs, add response-content-disposition parameter
        const separator = fileData.downloadURL.includes('?') ? '&' : '?';
        const encodedFilename = encodeURIComponent(fileData.name);
        downloadURL = `${fileData.downloadURL}${separator}response-content-disposition=attachment%3B%20filename%3D"${encodedFilename}"`;
        forceDownload = true;
        console.log('✅ Modified Firebase Storage URL for forced download');
      } else {
        console.log('📁 File has download URL, using direct URL');
      }
      
      // Track the download
      await updateDoc(doc(this.db, 'files', fileId), {
        downloadCount: (fileData.downloadCount || 0) + 1,
        lastDownloadAt: serverTimestamp(),
        lastDownloadBy: this.currentUser?.uid
      });

      return {
        downloadURL,
        fileName: fileData.name,
        fileData,
        isMetadataOnly: false,
        forceDownload
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async deleteFile(fileId) {
    // Handle mock data mode
    if (this.useMockData) {
      console.log('Mock: Deleting file', fileId);
      
      // Remove from uploaded files if it exists
      if (this.mockUploadedFiles) {
        const index = this.mockUploadedFiles.findIndex(f => f.id === fileId);
        if (index !== -1) {
          this.mockUploadedFiles.splice(index, 1);
          console.log('Removed file from mock storage, remaining files:', this.mockUploadedFiles.length);
        }
      }
      
      return { success: true };
    }
    
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

  // Client Methods
  async getClients() {
    console.log('🔍 getClients called, useMockData:', this.useMockData);
    
    if (this.useMockData) {
      console.log('Mock: Getting clients');
      return [
        { id: '1', name: 'John Smith', company: 'TechCorp Inc.', contactPerson: 'John Smith' },
        { id: '2', name: 'Sarah Johnson', company: 'Marketing Plus', contactPerson: 'Sarah Johnson' },
        { id: '3', name: 'Mike Chen', company: 'StartupXYZ', contactPerson: 'Mike Chen' }
      ];
    }

    console.log('🔥 Attempting to fetch clients from Firebase...');
    try {
      if (!this.db) {
        console.error('❌ Firestore database not initialized');
        throw new Error('Database not initialized');
      }

      console.log('📡 Querying Firestore for users with role=client');
      const clientsQuery = query(
        collection(this.db, 'users'),
        where('role', '==', 'client'),
        orderBy('createdAt', 'desc')
      );
      
      console.log('⏳ Executing Firestore query...');
      const snapshot = await getDocs(clientsQuery);
      console.log('✅ Query completed. Documents found:', snapshot.docs.length);
      
      const clients = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Client doc:', doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        };
      });
      
      console.log('✅ Processed clients:', clients);
      return clients;
    } catch (error) {
      console.error('❌ Error getting clients:', error);
      console.error('❌ Error details:', error.message, error.code);
      
      // Fallback to mock data on error
      console.log('🔄 Falling back to mock data');
      return [
        { id: '1', name: 'John Smith', company: 'TechCorp Inc.', contactPerson: 'John Smith' },
        { id: '2', name: 'Sarah Johnson', company: 'Marketing Plus', contactPerson: 'Sarah Johnson' },
        { id: '3', name: 'Mike Chen', company: 'StartupXYZ', contactPerson: 'Mike Chen' }
      ];
    }
  }
}

// Singleton instance
const firebaseService = new FirebaseService();

// Expose for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.firebaseService = firebaseService;
  console.log('🔧 firebaseService exposed to window for debugging');
}

export default firebaseService;