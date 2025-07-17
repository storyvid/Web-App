// Firebase Data Schemas for StoryVid
// This file defines the structure of documents that will be stored in Firestore

/**
 * User Document Schema
 * Collection: users
 * Document ID: user.uid (from Firebase Auth)
 */
export const UserSchema = {
  uid: '', // Firebase Auth UID
  email: '',
  name: '',
  role: '', // 'client', 'staff', 'admin'
  avatar: '',
  company: '',
  accountType: '',
  createdAt: null, // Firestore Timestamp
  updatedAt: null, // Firestore Timestamp
  isActive: true,
  
  // Project assignment
  assignedProjects: [], // Array of project IDs assigned to this user
  
  // Client-specific fields
  clientId: '', // For clients, references client document
  
  // Staff-specific fields
  staffId: '', // For staff, references staff document
  permissions: [], // Array of permission strings
  
  // Admin-specific fields
  adminLevel: 0 // 0=super admin, 1=manager, 2=coordinator
};

/**
 * Client Document Schema
 * Collection: clients
 * Document ID: auto-generated
 */
export const ClientSchema = {
  id: '', // Document ID
  name: '',
  company: '',
  email: '',
  phone: '',
  address: {},
  contactPerson: '',
  accountType: '', // 'Premium Client', 'Standard', 'Enterprise'
  subscriptionStatus: 'active', // 'active', 'inactive', 'trial'
  createdAt: null,
  updatedAt: null,
  
  // Billing information
  billing: {
    plan: '',
    nextBillingDate: null,
    paymentMethod: ''
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: true,
      sms: false,
      inApp: true
    },
    timezone: 'UTC'
  }
};

/**
 * Staff Document Schema
 * Collection: staff
 * Document ID: auto-generated
 */
export const StaffSchema = {
  id: '',
  name: '',
  email: '',
  role: '', // 'Video Editor', 'Motion Graphics', 'Producer', etc.
  department: '',
  skills: [], // Array of skill strings
  hourlyRate: 0,
  availability: 'available', // 'available', 'busy', 'offline'
  createdAt: null,
  updatedAt: null,
  
  // Work tracking
  currentProjects: [], // Array of project IDs
  completedProjects: 0,
  totalHours: 0
};

/**
 * Project Document Schema
 * Collection: projects
 * Document ID: auto-generated
 */
export const ProjectSchema = {
  id: '',
  name: '',
  description: '',
  clientId: '', // Reference to client document
  status: '', // 'draft', 'in-production', 'in-review', 'completed', 'cancelled'
  statusLabel: '',
  priority: 'medium', // 'low', 'medium', 'high', 'urgent'
  progress: 0, // 0-100
  
  // Dates
  createdAt: null,
  updatedAt: null,
  startDate: null,
  dueDate: null,
  completedDate: null,
  
  // Team assignment
  assignedStaff: [], // Array of staff IDs
  projectManager: '', // Staff ID
  
  // Project details
  budget: 0,
  estimatedHours: 0,
  actualHours: 0,
  
  // Video production specific
  videoType: '', // 'brand-story', 'product-demo', 'testimonial', etc.
  deliverables: [], // Array of deliverable objects
  
  // Files and assets
  assets: [], // Array of asset references
  finalDeliverables: [], // Array of final file references
  
  // Client feedback
  feedback: [], // Array of feedback objects
  approvalStatus: 'pending' // 'pending', 'approved', 'needs-revision'
};

/**
 * Milestone Document Schema
 * Collection: milestones
 * Document ID: auto-generated
 */
export const MilestoneSchema = {
  id: '',
  title: '',
  description: '',
  projectId: '', // Reference to project
  type: '', // 'draft', 'review', 'final', 'meeting'
  status: 'pending', // 'pending', 'in-progress', 'completed', 'overdue'
  
  // Dates
  createdAt: null,
  updatedAt: null,
  dueDate: null,
  completedDate: null,
  
  // Assignment
  assignedTo: '', // Staff ID
  reviewedBy: '', // Client/Staff ID who needs to review
  
  // Dependencies
  dependencies: [], // Array of milestone IDs that must complete first
  
  // Deliverables
  deliverables: [], // Array of files/assets for this milestone
  
  // Notes and feedback
  notes: '',
  feedback: []
};

/**
 * Notification Document Schema
 * Collection: notifications
 * Document ID: auto-generated
 */
export const NotificationSchema = {
  id: '',
  userId: '', // Who receives this notification
  title: '',
  message: '',
  type: '', // 'info', 'success', 'warning', 'error'
  category: '', // 'project', 'milestone', 'system', 'billing'
  
  // Status
  read: false,
  actionRequired: false,
  
  // Dates
  createdAt: null,
  readAt: null,
  
  // Related entities
  relatedEntity: {
    type: '', // 'project', 'milestone', 'user'
    id: ''
  },
  
  // Action button (optional)
  action: {
    label: '',
    url: '',
    type: '' // 'navigation', 'external'
  }
};

/**
 * Activity Document Schema
 * Collection: activities
 * Document ID: auto-generated
 */
export const ActivitySchema = {
  id: '',
  userId: '', // Who performed the action
  action: '', // Description of the action
  target: '', // What was acted upon
  targetType: '', // 'project', 'milestone', 'user', 'file'
  targetId: '', // ID of the target entity
  
  // Metadata
  createdAt: null,
  ipAddress: '',
  userAgent: '',
  
  // Additional context
  metadata: {}, // Flexible object for additional data
  
  // Visibility
  isPublic: true, // Whether to show in activity feeds
  clientVisible: true // Whether clients can see this activity
};

/**
 * File/Asset Document Schema
 * Collection: assets
 * Document ID: auto-generated
 */
export const AssetSchema = {
  id: '',
  name: '',
  originalName: '',
  type: '', // 'video', 'image', 'audio', 'document'
  mimeType: '',
  size: 0, // bytes
  
  // Storage
  storageUrl: '', // Firebase Storage URL
  storagePath: '', // Path in Firebase Storage
  thumbnailUrl: '', // For video/image previews
  
  // Ownership
  uploadedBy: '', // User ID
  projectId: '', // Associated project
  milestoneId: '', // Associated milestone (optional)
  
  // Metadata
  createdAt: null,
  updatedAt: null,
  
  // Video-specific metadata
  videoMetadata: {
    duration: 0,
    resolution: '',
    format: '',
    codec: ''
  },
  
  // Access control
  isPublic: false,
  allowedUsers: [], // Array of user IDs who can access
  downloadCount: 0
};

// Utility functions for schema validation
export const validateSchema = (data, schema) => {
  const errors = [];
  
  Object.keys(schema).forEach(key => {
    if (schema[key] !== null && typeof schema[key] !== 'undefined') {
      if (!(key in data)) {
        errors.push(`Missing required field: ${key}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper to create document with timestamps
export const createDocumentWithTimestamps = (data) => {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now
  };
};

// Helper to update document with timestamp
export const updateDocumentWithTimestamp = (data) => {
  return {
    ...data,
    updatedAt: new Date()
  };
};