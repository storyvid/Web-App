// Firebase Data Migration Service
// Handles creation of dummy accounts and population with sample data

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseService from './firebaseService';

class DataMigrationService {
  constructor() {
    this.dummyPassword = '123456789';
    this.migrationComplete = false;
    
    // Ensure we never use mock data for dummy accounts
    this.ensureFirebaseMode();
  }

  // Ensure Firebase service is in real mode
  ensureFirebaseMode() {
    if (firebaseService.useMockData) {
      console.log('🔧 Switching Firebase service to real mode for dummy accounts');
      firebaseService.useMockData = false;
    }
  }

  // Check if migration has already been completed
  async checkMigrationStatus() {
    try {
      if (!firebaseService.db) {
        console.log('Firestore not initialized');
        return false;
      }

      const migrationDoc = await getDoc(doc(firebaseService.db, 'system', 'migration'));
      return migrationDoc.exists() && migrationDoc.data()?.completed;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  // Mark migration as completed
  async markMigrationComplete() {
    try {
      await setDoc(doc(firebaseService.db, 'system', 'migration'), {
        completed: true,
        completedAt: serverTimestamp(),
        version: '1.0.0'
      });
      this.migrationComplete = true;
    } catch (error) {
      console.error('Error marking migration complete:', error);
    }
  }

  // Create dummy user accounts
  async createDummyAccounts() {
    const accounts = [
      {
        email: 'admin@test.com',
        name: 'Alex Admin',
        role: 'admin',
        company: 'StoryVid Productions',
        accountType: 'Production Manager'
      },
      {
        email: 'staff@test.com',
        name: 'Jordan Staff',
        role: 'staff', 
        company: 'StoryVid Productions',
        accountType: 'Video Editor'
      },
      {
        email: 'client@test.com',
        name: 'Sam Client',
        role: 'client',
        company: 'TechCorp Inc',
        accountType: 'Marketing Director'
      }
    ];

    console.log('Creating dummy user accounts...');

    for (const account of accounts) {
      try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(
          firebaseService.auth, 
          account.email, 
          this.dummyPassword
        );

        // Create user document
        const userData = {
          name: account.name,
          email: account.email,
          role: account.role,
          company: account.company,
          accountType: account.accountType,
          onboardingComplete: true,
          isDummyAccount: true,
          authProvider: 'email',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await firebaseService.updateUser(userCredential.user.uid, userData);
        console.log(`✅ Created dummy account: ${account.email}`);

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`ℹ️ Account already exists: ${account.email}`);
        } else {
          console.error(`❌ Error creating account ${account.email}:`, error);
        }
      }
    }
  }

  // Generate dummy data for each role
  getDummyData(role, userEmail, userId) {
    const baseData = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    };

    switch (role) {
      case 'admin':
        return this.getAdminDummyData(userEmail, userId, baseData);
      case 'staff':
        return this.getStaffDummyData(userEmail, userId, baseData);
      case 'client':
        return this.getClientDummyData(userEmail, userId, baseData);
      default:
        return { projects: [], notifications: [], activities: [] };
    }
  }

  getAdminDummyData(userEmail, userId, baseData) {
    return {
      projects: [
        {
          id: `admin-project-1-${userId}`,
          name: 'Brand Campaign 2024',
          client: 'TechCorp Inc',
          status: 'in-production',
          progress: 75,
          nextMilestone: 'Final Review - Jan 25',
          team: [
            { id: 'member1', name: 'Jordan Staff', avatar: null },
            { id: 'member2', name: 'Sarah Designer', avatar: null }
          ],
          action: 'Review Draft',
          assignedStaff: ['staff-uid-1'],
          companyId: 'storyvid-productions',
          ...baseData
        },
        {
          id: `admin-project-2-${userId}`,
          name: 'Product Launch Video',
          client: 'StartupXYZ',
          status: 'in-review',
          progress: 90,
          nextMilestone: 'Client Approval - Jan 22',
          team: [
            { id: 'member3', name: 'Mike Editor', avatar: null }
          ],
          action: 'Awaiting Approval',
          assignedStaff: ['staff-uid-2'],
          companyId: 'storyvid-productions',
          ...baseData
        },
        {
          id: `admin-project-3-${userId}`,
          name: 'Social Media Package',
          client: 'Fashion Brand Co',
          status: 'in-production',
          progress: 45,
          nextMilestone: 'First Draft - Jan 30',
          team: [
            { id: 'member1', name: 'Jordan Staff', avatar: null },
            { id: 'member4', name: 'Emma Creative', avatar: null }
          ],
          action: 'In Progress',
          assignedStaff: ['staff-uid-1'],
          companyId: 'storyvid-productions',
          ...baseData
        }
      ],
      notifications: [
        {
          id: `admin-notif-1-${userId}`,
          title: 'New client project submitted',
          message: 'TechCorp Inc submitted a new project request for review',
          time: '2 hours ago',
          unread: true,
          type: 'project',
          userId: userId,
          ...baseData
        },
        {
          id: `admin-notif-2-${userId}`,
          title: 'Team member completed task',
          message: 'Jordan Staff completed video editing for Brand Campaign 2024',
          time: '4 hours ago',
          unread: true,
          type: 'task',
          userId: userId,
          ...baseData
        },
        {
          id: `admin-notif-3-${userId}`,
          title: 'Client feedback received',
          message: 'StartupXYZ provided feedback on Product Launch Video',
          time: '1 day ago',
          unread: false,
          type: 'feedback',
          userId: userId,
          ...baseData
        }
      ],
      activities: [
        {
          id: `admin-activity-1-${userId}`,
          user: { name: 'Alex Admin', avatar: null },
          action: 'assigned',
          target: 'Brand Campaign 2024',
          time: '3 hours ago',
          type: 'assignment',
          userId: userId,
          ...baseData
        },
        {
          id: `admin-activity-2-${userId}`,
          user: { name: 'Jordan Staff', avatar: null },
          action: 'completed editing for',
          target: 'Product Launch Video',
          time: '5 hours ago',
          type: 'completion',
          userId: userId,
          ...baseData
        }
      ]
    };
  }

  getStaffDummyData(userEmail, userId, baseData) {
    return {
      projects: [
        {
          id: `staff-project-1-${userId}`,
          name: 'Brand Campaign 2024',
          client: 'TechCorp Inc',
          status: 'in-production',
          progress: 75,
          nextMilestone: 'Video Edit Complete - Jan 24',
          team: [
            { id: 'member1', name: 'Alex Admin', avatar: null },
            { id: 'member2', name: 'Sarah Designer', avatar: null }
          ],
          action: 'Continue Editing',
          myRole: 'Video Editor',
          assignedTasks: ['Video editing', 'Color correction'],
          ...baseData
        },
        {
          id: `staff-project-2-${userId}`,
          name: 'Social Media Package',
          client: 'Fashion Brand Co',
          status: 'in-production',
          progress: 45,
          nextMilestone: 'First Draft - Jan 30',
          team: [
            { id: 'member3', name: 'Emma Creative', avatar: null }
          ],
          action: 'Start Editing',
          myRole: 'Video Editor',
          assignedTasks: ['Video editing', 'Motion graphics'],
          ...baseData
        }
      ],
      notifications: [
        {
          id: `staff-notif-1-${userId}`,
          title: 'New task assigned',
          message: 'You have been assigned video editing for Brand Campaign 2024',
          time: '1 hour ago',
          unread: true,
          type: 'assignment',
          userId: userId,
          ...baseData
        },
        {
          id: `staff-notif-2-${userId}`,
          title: 'Deadline approaching',
          message: 'Video edit for Brand Campaign 2024 is due in 2 days',
          time: '6 hours ago',
          unread: true,
          type: 'deadline',
          userId: userId,
          ...baseData
        },
        {
          id: `staff-notif-3-${userId}`,
          title: 'Project approved',
          message: 'Your work on Product Launch Video has been approved',
          time: '2 days ago',
          unread: false,
          type: 'approval',
          userId: userId,
          ...baseData
        }
      ],
      activities: [
        {
          id: `staff-activity-1-${userId}`,
          user: { name: 'Jordan Staff', avatar: null },
          action: 'started editing',
          target: 'Brand Campaign 2024',
          time: '2 hours ago',
          type: 'start',
          userId: userId,
          ...baseData
        },
        {
          id: `staff-activity-2-${userId}`,
          user: { name: 'Jordan Staff', avatar: null },
          action: 'completed',
          target: 'Product Launch Video editing',
          time: '1 day ago',
          type: 'completion',
          userId: userId,
          ...baseData
        }
      ]
    };
  }

  getClientDummyData(userEmail, userId, baseData) {
    const projectIds = [
      `client-project-1-${userId}`,
      `client-project-2-${userId}`,
      `client-project-3-${userId}`
    ];

    return {
      projects: [
        {
          id: projectIds[0],
          name: 'Company Intro Video',
          client: 'TechCorp Inc',
          status: 'in-review',
          progress: 85,
          nextMilestone: 'Your Review - Jan 23',
          team: [
            { id: 'member1', name: 'Jordan Staff', avatar: null },
            { id: 'member2', name: 'Alex Admin', avatar: null }
          ],
          action: 'Review & Approve',
          projectType: 'Corporate Video',
          deliverables: ['Main video', 'Social media cuts', 'Thumbnails'],
          ...baseData
        },
        {
          id: projectIds[1],
          name: 'Product Demo Series',
          client: 'TechCorp Inc',
          status: 'completed',
          progress: 100,
          nextMilestone: 'Project Complete',
          team: [
            { id: 'member3', name: 'Sarah Designer', avatar: null }
          ],
          action: 'Completed',
          projectType: 'Product Demo',
          deliverables: ['3 demo videos', 'Tutorial guides'],
          ...baseData
        },
        {
          id: projectIds[2],
          name: 'Social Media Campaign',
          client: 'TechCorp Inc',
          status: 'in-production',
          progress: 60,
          nextMilestone: 'Second Review - Feb 10',
          team: [
            { id: 'member4', name: 'Mike Creative', avatar: null }
          ],
          action: 'In Progress',
          projectType: 'Social Media',
          deliverables: ['Instagram reels', 'TikTok videos'],
          ...baseData
        }
      ],
      milestones: [
        // Company Intro Video milestones
        {
          id: `client-milestone-1-${userId}`,
          projectId: projectIds[0],
          title: 'Script Review & Approval',
          description: 'Review and approve the video script and storyboard',
          status: 'completed',
          dueDate: new Date('2025-01-15').toISOString(),
          completedAt: new Date('2025-01-14').toISOString(),
          order: 0,
          assignedTo: userId,
          revisionCount: 1,
          maxRevisions: 2,
          ...baseData
        },
        {
          id: `client-milestone-2-${userId}`,
          projectId: projectIds[0],
          title: 'First Draft Review',
          description: 'Review the first cut of the video and provide feedback',
          status: 'in_review',
          dueDate: new Date('2025-01-23').toISOString(),
          order: 1,
          assignedTo: userId,
          revisionCount: 0,
          maxRevisions: 2,
          ...baseData
        },
        {
          id: `client-milestone-3-${userId}`,
          projectId: projectIds[0],
          title: 'Final Approval',
          description: 'Final review and approval for video delivery',
          status: 'pending',
          dueDate: new Date('2025-01-30').toISOString(),
          order: 2,
          assignedTo: userId,
          revisionCount: 0,
          maxRevisions: 2,
          ...baseData
        },
        // Product Demo Series milestones (completed project)
        {
          id: `client-milestone-4-${userId}`,
          projectId: projectIds[1],
          title: 'Demo 1 - Product Overview',
          description: 'Complete overview demo video',
          status: 'completed',
          dueDate: new Date('2024-12-15').toISOString(),
          completedAt: new Date('2024-12-14').toISOString(),
          order: 0,
          assignedTo: userId,
          revisionCount: 0,
          maxRevisions: 2,
          ...baseData
        },
        {
          id: `client-milestone-5-${userId}`,
          projectId: projectIds[1],
          title: 'Demo 2 - Feature Deep Dive',
          description: 'Detailed feature demonstration',
          status: 'completed',
          dueDate: new Date('2024-12-22').toISOString(),
          completedAt: new Date('2024-12-21').toISOString(),
          order: 1,
          assignedTo: userId,
          revisionCount: 1,
          maxRevisions: 2,
          ...baseData
        },
        // Social Media Campaign milestones
        {
          id: `client-milestone-6-${userId}`,
          projectId: projectIds[2],
          title: 'Content Strategy Approval',
          description: 'Approve social media content strategy and themes',
          status: 'completed',
          dueDate: new Date('2025-01-20').toISOString(),
          completedAt: new Date('2025-01-19').toISOString(),
          order: 0,
          assignedTo: userId,
          revisionCount: 0,
          maxRevisions: 2,
          ...baseData
        },
        {
          id: `client-milestone-7-${userId}`,
          projectId: projectIds[2],
          title: 'First Batch Review',
          description: 'Review first batch of social media content',
          status: 'in_progress',
          dueDate: new Date('2025-02-10').toISOString(),
          order: 1,
          assignedTo: userId,
          revisionCount: 0,
          maxRevisions: 2,
          ...baseData
        }
      ],
      files: [
        // Company Intro Video files
        {
          id: `client-file-1-${userId}`,
          name: 'company_intro_script_v2.pdf',
          originalName: 'company_intro_script_v2.pdf',
          size: 245760,
          type: 'document',
          mimeType: 'application/pdf',
          downloadURL: 'https://example.com/files/company_intro_script_v2.pdf',
          storagePath: `files/${userId}/company_intro_script_v2.pdf`,
          projectId: projectIds[0],
          milestoneId: `client-milestone-1-${userId}`,
          category: 'script',
          uploadedByName: 'Jordan Staff',
          isPublic: false,
          downloadCount: 3,
          ...baseData
        },
        {
          id: `client-file-2-${userId}`,
          name: 'company_intro_first_draft.mp4',
          originalName: 'company_intro_first_draft.mp4',
          size: 52428800,
          type: 'video',
          mimeType: 'video/mp4',
          downloadURL: 'https://example.com/files/company_intro_first_draft.mp4',
          storagePath: `files/${userId}/company_intro_first_draft.mp4`,
          projectId: projectIds[0],
          milestoneId: `client-milestone-2-${userId}`,
          category: 'draft',
          uploadedByName: 'Jordan Staff',
          isPublic: false,
          downloadCount: 1,
          ...baseData
        },
        // Product Demo Series files (completed)
        {
          id: `client-file-3-${userId}`,
          name: 'product_demo_overview_final.mp4',
          originalName: 'product_demo_overview_final.mp4',
          size: 78643200,
          type: 'video',
          mimeType: 'video/mp4',
          downloadURL: 'https://example.com/files/product_demo_overview_final.mp4',
          storagePath: `files/${userId}/product_demo_overview_final.mp4`,
          projectId: projectIds[1],
          milestoneId: `client-milestone-4-${userId}`,
          category: 'final',
          uploadedByName: 'Sarah Designer',
          isPublic: false,
          downloadCount: 8,
          ...baseData
        },
        {
          id: `client-file-4-${userId}`,
          name: 'product_demo_features_final.mp4',
          originalName: 'product_demo_features_final.mp4',
          size: 94371840,
          type: 'video',
          mimeType: 'video/mp4',
          downloadURL: 'https://example.com/files/product_demo_features_final.mp4',
          storagePath: `files/${userId}/product_demo_features_final.mp4`,
          projectId: projectIds[1],
          milestoneId: `client-milestone-5-${userId}`,
          category: 'final',
          uploadedByName: 'Sarah Designer',
          isPublic: false,
          downloadCount: 12,
          ...baseData
        },
        // Social Media Campaign files
        {
          id: `client-file-5-${userId}`,
          name: 'social_media_strategy.pdf',
          originalName: 'social_media_strategy.pdf',
          size: 1572864,
          type: 'document',
          mimeType: 'application/pdf',
          downloadURL: 'https://example.com/files/social_media_strategy.pdf',
          storagePath: `files/${userId}/social_media_strategy.pdf`,
          projectId: projectIds[2],
          milestoneId: `client-milestone-6-${userId}`,
          category: 'strategy',
          uploadedByName: 'Mike Creative',
          isPublic: false,
          downloadCount: 2,
          ...baseData
        },
        {
          id: `client-file-6-${userId}`,
          name: 'brand_assets.zip',
          originalName: 'brand_assets.zip',
          size: 15728640,
          type: 'other',
          mimeType: 'application/zip',
          downloadURL: 'https://example.com/files/brand_assets.zip',
          storagePath: `files/${userId}/brand_assets.zip`,
          projectId: projectIds[2],
          category: 'assets',
          uploadedByName: 'Sam Client',
          isPublic: false,
          downloadCount: 1,
          ...baseData
        }
      ],
      notifications: [
        {
          id: `client-notif-1-${userId}`,
          title: 'Video ready for review',
          message: 'Company Intro Video is ready for your review and approval',
          time: '30 minutes ago',
          unread: true,
          type: 'review',
          userId: userId,
          ...baseData
        },
        {
          id: `client-notif-2-${userId}`,
          title: 'Project milestone reached',
          message: 'Product Demo Series has reached the 40% completion milestone',
          time: '3 hours ago',
          unread: true,
          type: 'milestone',
          userId: userId,
          ...baseData
        },
        {
          id: `client-notif-3-${userId}`,
          title: 'New project proposal',
          message: 'StoryVid team has sent you a new project proposal',
          time: '1 day ago',
          unread: false,
          type: 'proposal',
          userId: userId,
          ...baseData
        }
      ],
      activities: [
        {
          id: `client-activity-1-${userId}`,
          user: { name: 'Sam Client', avatar: null },
          action: 'requested revisions for',
          target: 'Company Intro Video',
          time: '4 hours ago',
          type: 'feedback',
          userId: userId,
          ...baseData
        },
        {
          id: `client-activity-2-${userId}`,
          user: { name: 'StoryVid Team', avatar: null },
          action: 'delivered first draft of',
          target: 'Product Demo Series',
          time: '2 days ago',
          type: 'delivery',
          userId: userId,
          ...baseData
        }
      ]
    };
  }

  // Get actual Firebase Auth UID for an email
  async getAuthUidForEmail(email) {
    try {
      console.log(`🔍 Getting UID for ${email}...`);
      
      // Sign in temporarily to get the UID
      const credential = await signInWithEmailAndPassword(
        firebaseService.auth,
        email,
        this.dummyPassword
      );
      const uid = credential.user.uid;
      
      console.log(`✅ Found UID for ${email}: ${uid}`);
      
      // Sign out immediately
      await firebaseService.signOut();
      
      return uid;
    } catch (error) {
      console.error(`❌ Error getting UID for ${email}:`, error);
      return null;
    }
  }

  // Populate Firestore with dummy data
  async populateDummyData() {
    console.log('Populating dummy data in Firestore...');

    const dummyAccounts = [
      { email: 'admin@test.com', role: 'admin' },
      { email: 'staff@test.com', role: 'staff' },
      { email: 'client@test.com', role: 'client' }
    ];

    // Store user IDs for cross-referencing
    const userIds = {};
    
    // First pass: collect all user IDs
    for (const account of dummyAccounts) {
      try {
        const credential = await signInWithEmailAndPassword(
          firebaseService.auth,
          account.email,
          this.dummyPassword
        );
        userIds[account.role] = credential.user.uid;
        await firebaseService.auth.signOut();
      } catch (error) {
        console.error(`Error getting UID for ${account.email}:`, error);
      }
    }

    console.log('📋 User IDs collected:', userIds);

    for (const account of dummyAccounts) {
      try {
        console.log(`🔐 Signing in as ${account.email} to create data...`);
        
        // Sign in as this user and keep the session active for data creation
        const credential = await signInWithEmailAndPassword(
          firebaseService.auth,
          account.email,
          this.dummyPassword
        );
        
        const userId = credential.user.uid;
        console.log(`📝 Creating data for ${account.email} with UID: ${userId}`);
        const dummyData = this.getDummyData(account.role, account.email, userId);
        
        console.log(`📊 Generated data for ${account.email}:`, {
          projects: dummyData.projects.length,
          notifications: dummyData.notifications.length,
          activities: dummyData.activities.length,
          milestones: dummyData.milestones?.length || 0,
          files: dummyData.files?.length || 0
        });

        const batch = writeBatch(firebaseService.db);

        // Add projects with proper role-based structure
        dummyData.projects.forEach(project => {
          const projectRef = doc(collection(firebaseService.db, 'projects'));
          
          if (account.role === 'admin') {
            // Admin projects should be created by clients but visible to admin through companyId
            batch.set(projectRef, {
              ...project,
              createdBy: userIds.client, // Use client's actual UID
              companyId: 'storyvid-productions' // This makes it visible to admin
            });
          } else if (account.role === 'staff') {
            // Staff projects should be created by clients but assigned to staff
            batch.set(projectRef, {
              ...project,
              createdBy: userIds.client, // Use client's actual UID
              assignedStaff: [userId], // Assign to this staff member
              companyId: 'storyvid-productions'
            });
          } else {
            // Client projects - created by the client user
            batch.set(projectRef, {
              ...project,
              userId: userId, // Link to real user
              createdBy: userId, // Client is the creator
              companyId: 'storyvid-productions' // Same company
            });
          }
        });

        // Add notifications
        dummyData.notifications.forEach(notification => {
          const notificationRef = doc(collection(firebaseService.db, 'notifications'));
          batch.set(notificationRef, {
            ...notification,
            userId: userId // Link to real user
          });
        });

        // Add activities
        dummyData.activities.forEach(activity => {
          const activityRef = doc(collection(firebaseService.db, 'activities'));
          batch.set(activityRef, {
            ...activity,
            userId: userId // Link to real user
          });
        });

        // Add milestones
        if (dummyData.milestones) {
          dummyData.milestones.forEach(milestone => {
            const milestoneRef = doc(collection(firebaseService.db, 'milestones'));
            batch.set(milestoneRef, {
              ...milestone,
              createdBy: userId
            });
          });
        }

        // Add files
        if (dummyData.files) {
          dummyData.files.forEach(file => {
            const fileRef = doc(collection(firebaseService.db, 'files'));
            batch.set(fileRef, {
              ...file,
              uploadedBy: userId
            });
          });
        }

        await batch.commit();
        console.log(`✅ Populated data for ${account.email} (UID: ${userId})`);
        console.log(`📊 Batch committed with ${(dummyData.projects.length + dummyData.notifications.length + dummyData.activities.length + (dummyData.milestones?.length || 0) + (dummyData.files?.length || 0))} total documents`);
        
        // Sign out after successful data creation
        await firebaseService.signOut();
        console.log(`🔐 Signed out from ${account.email}`);

      } catch (error) {
        console.error(`❌ Error populating data for ${account.email}:`, error);
        // Sign out even if there was an error
        try {
          await firebaseService.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
      }
    }
  }

  // Main migration function
  async runMigration() {
    try {
      console.log('🚀 Starting data migration...');

      // Check if already completed
      const isCompleted = await this.checkMigrationStatus();
      if (isCompleted) {
        console.log('✅ Migration already completed');
        return;
      }

      // Initialize Firebase if needed
      if (!firebaseService.app) {
        await firebaseService.initialize();
      }

      // Create dummy accounts
      await this.createDummyAccounts();

      // Populate with dummy data
      await this.populateDummyData();

      // Mark as complete
      await this.markMigrationComplete();

      console.log('✅ Data migration completed successfully!');
      console.log('Test accounts created:');
      console.log('- admin@test.com (password: 123456789)');
      console.log('- staff@test.com (password: 123456789)');
      console.log('- client@test.com (password: 123456789)');

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Clear existing dummy data
  async clearExistingData() {
    console.log('🗑️ Clearing existing dummy data...');
    
    try {
      // Sign in as admin to have permission to delete data
      console.log('🔐 Signing in as admin to clear data...');
      await signInWithEmailAndPassword(
        firebaseService.auth,
        'admin@test.com',
        this.dummyPassword
      );
      
      // Get all collections and delete dummy data
      const collections = ['projects', 'notifications', 'activities', 'milestones', 'files', 'system'];
      
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(firebaseService.db, collectionName));
        
        if (!snapshot.empty) {
          const batch = writeBatch(firebaseService.db);
          
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
          console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
        } else {
          console.log(`ℹ️ No documents to clear in ${collectionName}`);
        }
      }
      
      // Sign out after clearing
      await firebaseService.signOut();
      console.log('🔐 Signed out after clearing data');
    } catch (error) {
      console.error('Error clearing existing data:', error);
    }
  }

  // Reset dummy accounts (useful for testing)
  async resetDummyAccounts() {
    console.log('🔄 Resetting dummy accounts...');
    
    try {
      // Clear existing data
      await this.clearExistingData();
      
      // Repopulate with fresh data
      await this.populateDummyData();
      
      console.log('✅ Dummy accounts reset successfully');
    } catch (error) {
      console.error('❌ Error resetting dummy accounts:', error);
      throw error;
    }
  }

  // Force migration (clears existing migration status)
  async forceMigration() {
    console.log('🔄 Force running migration...');
    
    try {
      console.log('Step 1: Clearing existing data...');
      await this.clearExistingData();
      
      console.log('Step 2: Creating dummy accounts...');
      await this.createDummyAccounts();

      console.log('Step 3: Populating with dummy data...');
      await this.populateDummyData();

      console.log('Step 4: Verifying data was created...');
      await this.verifyDummyData();

      console.log('Step 5: Marking migration as complete...');
      await this.markMigrationComplete();

      console.log('✅ Force migration completed successfully!');
      console.log('🧪 Test with: window.checkFirestoreData()');
    } catch (error) {
      console.error('❌ Force migration failed:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  }

  // Verify dummy data was created correctly
  async verifyDummyData() {
    console.log('🔍 Verifying dummy data creation...');
    
    try {
      const collections = ['projects', 'notifications', 'activities'];
      const verificationResults = {};

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(firebaseService.db, collectionName));
        verificationResults[collectionName] = snapshot.size;
        console.log(`📊 ${collectionName}: ${snapshot.size} documents`);
      }

      const totalDocs = Object.values(verificationResults).reduce((sum, count) => sum + count, 0);
      console.log(`✅ Total documents created: ${totalDocs}`);
      
      if (totalDocs === 0) {
        throw new Error('No dummy data was created! Check migration logic.');
      }

      // Log sample document IDs for verification
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(firebaseService.db, collectionName));
        if (!snapshot.empty) {
          const sampleDoc = snapshot.docs[0];
          console.log(`📝 Sample ${collectionName} doc:`, {
            id: sampleDoc.id,
            userId: sampleDoc.data().userId,
            createdBy: sampleDoc.data().createdBy
          });
        }
      }

    } catch (error) {
      console.error('❌ Data verification failed:', error);
      throw error;
    }
  }

  // Test dummy account data after login (for debugging)
  async testDummyAccountLogin(email) {
    console.log(`🧪 Testing data for ${email}...`);
    
    try {
      // Get the user ID for this email
      const userId = await this.getAuthUidForEmail(email);
      if (!userId) {
        console.log(`❌ Could not find user ID for ${email}`);
        return;
      }

      console.log(`👤 User ID for ${email}: ${userId}`);

      // Test data retrieval using the same methods the dashboard uses
      const [projects, notifications, activities] = await Promise.all([
        firebaseService.getUserProjects(userId),
        firebaseService.getUserNotifications(userId),
        firebaseService.getUserActivities(userId)
      ]);

      console.log(`📊 Data for ${email}:`, {
        projects: projects.length,
        notifications: notifications.length,
        activities: activities.length
      });

      if (projects.length > 0) {
        console.log(`📋 Sample project:`, {
          name: projects[0].name,
          client: projects[0].client,
          status: projects[0].status
        });
      }

      if (notifications.length > 0) {
        console.log(`🔔 Sample notification:`, {
          title: notifications[0].title,
          unread: notifications[0].unread
        });
      }

      return { projects, notifications, activities };

    } catch (error) {
      console.error(`❌ Error testing ${email}:`, error);
      return null;
    }
  }
}

// Export singleton instance
const dataMigrationService = new DataMigrationService();

// Export test functions for debugging
window.testDummyAccount = (email) => dataMigrationService.testDummyAccountLogin(email);
window.forceMigration = () => dataMigrationService.forceMigration();
window.checkFirestoreData = async () => {
  try {
    const collections = ['projects', 'notifications', 'activities'];
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(firebaseService.db, collectionName));
      console.log(`📊 ${collectionName}: ${snapshot.size} documents`);
      
      if (!snapshot.empty) {
        const sampleDoc = snapshot.docs[0];
        console.log(`📝 Sample ${collectionName}:`, {
          id: sampleDoc.id,
          userId: sampleDoc.data().userId,
          createdBy: sampleDoc.data().createdBy,
          data: sampleDoc.data()
        });
      }
    }
  } catch (error) {
    console.error('Error checking Firestore data:', error);
  }
};

window.checkClientData = async (userId) => {
  try {
    console.log(`🔍 Checking data for client user: ${userId}`);
    
    // Direct query for projects with createdBy field
    const projectsQuery = query(
      collection(firebaseService.db, 'projects'),
      where('createdBy', '==', userId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    console.log(`📋 Client projects (createdBy): ${projectsSnapshot.size}`);
    
    // Also check with userId field
    const projectsQuery2 = query(
      collection(firebaseService.db, 'projects'),
      where('userId', '==', userId)
    );
    const projectsSnapshot2 = await getDocs(projectsQuery2);
    console.log(`📋 Client projects (userId): ${projectsSnapshot2.size}`);
    
    // Check notifications
    const notificationsQuery = query(
      collection(firebaseService.db, 'notifications'),
      where('userId', '==', userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    console.log(`🔔 Client notifications: ${notificationsSnapshot.size}`);
    
    // Check activities
    const activitiesQuery = query(
      collection(firebaseService.db, 'activities'),
      where('userId', '==', userId)
    );
    const activitiesSnapshot = await getDocs(activitiesQuery);
    console.log(`📊 Client activities: ${activitiesSnapshot.size}`);
    
  } catch (error) {
    console.error('Error checking client data:', error);
  }
};

export default dataMigrationService;