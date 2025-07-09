// Firebase Migration Utilities
// Helper functions to transform mock data to Firebase-compatible format

import { 
  UserSchema,
  ClientSchema,
  StaffSchema,
  ProjectSchema,
  MilestoneSchema,
  NotificationSchema,
  ActivitySchema,
  AssetSchema,
  createDocumentWithTimestamps
} from './schemas';

/**
 * Transform mock user data to Firebase User document
 */
export const transformMockUserToFirebase = (mockUser) => {
  return createDocumentWithTimestamps({
    uid: mockUser.uid || `${mockUser.role}-${Date.now()}`,
    email: mockUser.email,
    name: mockUser.name,
    role: mockUser.role,
    avatar: mockUser.avatar || '',
    company: mockUser.company || '',
    accountType: mockUser.accountType || '',
    isActive: true,
    
    // Role-specific fields
    clientId: mockUser.role === 'client' ? `client-${Date.now()}` : '',
    staffId: mockUser.role === 'staff' ? `staff-${Date.now()}` : '',
    permissions: mockUser.role === 'staff' ? ['read', 'write'] : [],
    adminLevel: mockUser.role === 'admin' ? 0 : null
  });
};

/**
 * Transform mock project data to Firebase Project document
 */
export const transformMockProjectToFirebase = (mockProject, clientId) => {
  return createDocumentWithTimestamps({
    id: mockProject.id?.toString() || `project-${Date.now()}`,
    name: mockProject.name,
    description: mockProject.description || '',
    clientId: clientId,
    status: mockProject.status,
    statusLabel: mockProject.statusLabel,
    priority: 'medium',
    progress: mockProject.progress || 0,
    
    // Parse dates from strings if needed
    startDate: new Date(),
    dueDate: mockProject.nextMilestone ? new Date(mockProject.nextMilestone) : null,
    completedDate: mockProject.status === 'completed' ? new Date() : null,
    
    // Team assignment (transform team array to staff IDs)
    assignedStaff: mockProject.team?.map(member => member.id?.toString()) || [],
    projectManager: mockProject.team?.[0]?.id?.toString() || '',
    
    // Defaults for missing fields
    budget: 0,
    estimatedHours: 40,
    actualHours: 0,
    videoType: 'brand-story',
    deliverables: [],
    assets: [],
    finalDeliverables: [],
    feedback: [],
    approvalStatus: mockProject.status === 'in-review' ? 'pending' : 'approved'
  });
};

/**
 * Transform mock milestone data to Firebase Milestone document
 */
export const transformMockMilestoneToFirebase = (mockMilestone, projectId) => {
  return createDocumentWithTimestamps({
    id: mockMilestone.id?.toString() || `milestone-${Date.now()}`,
    title: mockMilestone.title,
    description: '',
    projectId: projectId,
    type: mockMilestone.type,
    status: 'pending',
    
    // Parse time string to date
    dueDate: parseMockTimeToDate(mockMilestone.time),
    completedDate: null,
    
    assignedTo: 'staff-1',
    reviewedBy: '',
    dependencies: [],
    deliverables: [],
    notes: '',
    feedback: []
  });
};

/**
 * Transform mock notification data to Firebase Notification document
 */
export const transformMockNotificationToFirebase = (mockNotification, userId) => {
  return createDocumentWithTimestamps({
    id: mockNotification.id?.toString() || `notification-${Date.now()}`,
    userId: userId,
    title: mockNotification.title,
    message: mockNotification.message,
    type: 'info',
    category: 'project',
    
    read: !mockNotification.unread,
    actionRequired: false,
    readAt: !mockNotification.unread ? new Date() : null,
    
    relatedEntity: {
      type: 'project',
      id: 'project-1'
    },
    
    action: {
      label: 'View Project',
      url: '/dashboard',
      type: 'navigation'
    }
  });
};

/**
 * Transform mock activity data to Firebase Activity document
 */
export const transformMockActivityToFirebase = (mockActivity, userId) => {
  return createDocumentWithTimestamps({
    id: mockActivity.id?.toString() || `activity-${Date.now()}`,
    userId: userId,
    action: mockActivity.action,
    target: mockActivity.target,
    targetType: 'project',
    targetId: 'project-1',
    
    ipAddress: '127.0.0.1',
    userAgent: 'Mock Browser',
    metadata: {},
    isPublic: true,
    clientVisible: true
  });
};

/**
 * Helper function to parse mock time strings to Date objects
 */
export const parseMockTimeToDate = (timeString) => {
  const now = new Date();
  
  if (timeString.includes('Today')) {
    const timeMatch = timeString.match(/(\d+):(\d+)(am|pm)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3];
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      return today;
    }
  }
  
  if (timeString.includes('Tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // Try to parse other date formats
  if (timeString.includes('Dec')) {
    const year = new Date().getFullYear();
    const monthMatch = timeString.match(/Dec (\d+)/);
    if (monthMatch) {
      return new Date(year, 11, parseInt(monthMatch[1])); // December is month 11
    }
  }
  
  // Default to current date
  return now;
};

/**
 * Batch transformation of all mock data for a user
 */
export const transformAllMockDataToFirebase = (mockData, userInfo) => {
  const transformedData = {
    user: transformMockUserToFirebase(userInfo),
    projects: [],
    milestones: [],
    notifications: [],
    activities: []
  };
  
  // Transform projects
  if (mockData.projects) {
    transformedData.projects = mockData.projects.map(project => 
      transformMockProjectToFirebase(project, transformedData.user.clientId || 'default-client')
    );
  }
  
  // Transform milestones
  if (mockData.milestones) {
    transformedData.milestones = mockData.milestones.map(milestone => 
      transformMockMilestoneToFirebase(milestone, transformedData.projects[0]?.id || 'default-project')
    );
  }
  
  // Transform notifications
  if (mockData.notifications) {
    transformedData.notifications = mockData.notifications.map(notification => 
      transformMockNotificationToFirebase(notification, transformedData.user.uid)
    );
  }
  
  // Transform activities
  if (mockData.activities) {
    transformedData.activities = mockData.activities.map(activity => 
      transformMockActivityToFirebase(activity, transformedData.user.uid)
    );
  }
  
  return transformedData;
};

/**
 * Generate Firestore security rules based on data structure
 */
export const generateFirestoreSecurityRules = () => {
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read and update their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clients can read their own client document
    match /clients/{clientId} {
      allow read: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clientId == clientId);
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Staff can read all staff documents, admins can write
    match /staff/{staffId} {
      allow read: if request.auth != null && 
        (request.auth.token.role in ['staff', 'admin']);
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Project access based on role and assignment
    match /projects/{projectId} {
      allow read: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clientId == resource.data.clientId ||
         request.auth.uid in resource.data.assignedStaff);
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.uid in resource.data.assignedStaff);
    }
    
    // Milestones follow project permissions
    match /milestones/{milestoneId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.uid == resource.data.assignedTo);
    }
    
    // Users can read their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Activities are readable by related users
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Assets follow project permissions
    match /assets/{assetId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.uid == resource.data.uploadedBy);
    }
  }
}`;
};

/**
 * Generate Firebase Storage security rules
 */
export const generateStorageSecurityRules = () => {
  return `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /files/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['staff', 'admin'];
    }
    
    match /avatars/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || request.auth.token.role == 'admin');
    }
    
    match /project-assets/{projectId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['staff', 'admin'];
    }
  }
}`;
};

export default {
  transformMockUserToFirebase,
  transformMockProjectToFirebase,
  transformMockMilestoneToFirebase,
  transformMockNotificationToFirebase,
  transformMockActivityToFirebase,
  transformAllMockDataToFirebase,
  parseMockTimeToDate,
  generateFirestoreSecurityRules,
  generateStorageSecurityRules
};