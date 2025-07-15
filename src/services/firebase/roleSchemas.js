// Role-based Data Schemas for StoryVid
// This file defines the structure for role-specific user profiles

/**
 * Base User Schema
 * Collection: users
 * Document ID: user.uid (from Firebase Auth)
 */
export const BaseUserSchema = {
  uid: '', // Firebase Auth UID
  email: '',
  name: '',
  role: '', // 'client', 'staff', 'admin'
  avatar: '',
  phone: '',
  timezone: '',
  language: 'en',
  onboardingComplete: false,
  onboardedAt: null,
  createdAt: null, // Firestore Timestamp
  updatedAt: null, // Firestore Timestamp
  isActive: true,
  lastLoginAt: null,
  
  // Settings shared across all roles
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
    theme: 'light'
  }
};

/**
 * Client Profile Schema
 * Embedded in user document for role='client'
 */
export const ClientProfileSchema = {
  company: '',
  industry: '',
  companySize: '',
  projectTypes: [], // Array of project type strings
  budget: '',
  timeline: '',
  communicationPrefs: {
    preferredMethod: 'email', // 'email', 'phone', 'video', 'platform'
    frequency: 'weekly' // 'daily', 'weekly', 'milestone', 'asneeded'
  },
  description: '',
  
  // Client-specific data
  clientMetrics: {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    averageProjectValue: 0
  },
  
  // Client preferences
  preferences: {
    preferredGenres: [],
    preferredTeamSize: '',
    qualityLevel: '', // 'standard', 'premium', 'enterprise'
    rushAvailable: false
  }
};

/**
 * Staff Profile Schema
 * Embedded in user document for role='staff'
 */
export const StaffProfileSchema = {
  position: '',
  skills: [], // Array of skill/software strings
  experience: '',
  availability: {
    type: 'fulltime', // 'fulltime', 'parttime', 'freelance'
    hoursPerWeek: 40
  },
  hourlyRate: '',
  portfolio: '',
  companyCode: '',
  companyId: '', // Reference to company document
  bio: '',
  location: '',
  
  // Staff-specific data
  staffMetrics: {
    projectsCompleted: 0,
    currentProjects: 0,
    averageRating: 0,
    totalHours: 0,
    specialtyAreas: []
  },
  
  // Work preferences
  workPreferences: {
    remoteWork: true,
    travelWillingness: 'local', // 'none', 'local', 'regional', 'national', 'international'
    preferredProjectTypes: [],
    maxSimultaneousProjects: 3,
    weekendWork: false,
    overtimeAvailable: true
  },
  
  // Performance tracking
  performance: {
    onTimeDelivery: 100,
    clientSatisfaction: 0,
    teamCollaboration: 0,
    technicalSkills: 0,
    lastReviewDate: null
  }
};

/**
 * Admin Profile Schema
 * Embedded in user document for role='admin'
 */
export const AdminProfileSchema = {
  company: {
    name: '',
    website: '',
    size: '',
    location: '',
    founded: '',
    description: '',
    logo: '',
    businessType: 'production_company' // 'production_company', 'agency', 'freelancer'
  },
  
  services: [], // Array of service strings
  specialties: [], // Array of specialty strings
  teamSize: 0,
  clientTypes: [], // Array of target client type strings
  
  pricing: {
    model: '', // 'project', 'hourly', 'day_rate', 'package', 'retainer', 'value', 'custom'
    startingRate: '',
    currency: 'USD'
  },
  
  permissions: {
    teamManagement: true,
    clientManagement: true,
    billing: true,
    analytics: true,
    systemAdmin: true,
    projectCreation: true,
    settingsManagement: true
  },
  
  bio: '',
  companyId: '', // Reference to company document
  
  // Admin-specific metrics
  adminMetrics: {
    totalTeamMembers: 0,
    totalClients: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    teamUtilization: 0,
    clientRetention: 0
  },
  
  // Business settings
  businessSettings: {
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    holidaySchedule: [],
    emergencyContact: {
      name: '',
      phone: '',
      email: ''
    }
  }
};

/**
 * Company Document Schema
 * Collection: companies
 * Document ID: auto-generated
 */
export const CompanySchema = {
  id: '', // Document ID
  name: '',
  website: '',
  description: '',
  logo: '',
  size: '',
  location: {
    address: '',
    city: '',
    state: '',
    country: '',
    timezone: ''
  },
  founded: '',
  businessType: 'production_company',
  
  // Company settings
  settings: {
    companyCode: '', // Unique code for staff to join
    allowPublicProfile: true,
    requireApprovalForNewProjects: false,
    defaultProjectTemplate: '',
    billingSettings: {
      currency: 'USD',
      paymentTerms: '30',
      lateFeePercentage: 0,
      acceptedPaymentMethods: []
    }
  },
  
  // Company metrics
  metrics: {
    totalEmployees: 0,
    totalClients: 0,
    totalProjects: 0,
    monthlyRevenue: 0,
    averageProjectValue: 0,
    clientSatisfactionScore: 0
  },
  
  // Admin users
  admins: [], // Array of admin user UIDs
  
  createdAt: null,
  updatedAt: null,
  isActive: true
};

/**
 * Project Schema (updated for role-based access)
 * Collection: projects
 * Document ID: auto-generated
 */
export const ProjectSchema = {
  id: '', // Document ID
  name: '',
  description: '',
  status: 'planning', // 'planning', 'in_progress', 'review', 'completed', 'cancelled'
  priority: 'medium', // 'low', 'medium', 'high', 'urgent'
  
  // Role-based access
  clientId: '', // UID of client user
  companyId: '', // ID of production company
  assignedStaff: [], // Array of staff user UIDs
  projectManager: '', // UID of primary admin/manager
  
  // Project details
  timeline: {
    startDate: null,
    endDate: null,
    estimatedHours: 0,
    actualHours: 0
  },
  
  budget: {
    estimated: 0,
    actual: 0,
    currency: 'USD',
    breakdown: {}
  },
  
  deliverables: [],
  milestones: [],
  assets: [],
  
  // Communication and collaboration
  communications: {
    lastClientContact: null,
    nextScheduledCall: null,
    preferredContactMethod: 'email',
    clientFeedbackStatus: 'pending'
  },
  
  // Project metadata
  projectType: '',
  genre: '',
  tags: [],
  
  createdAt: null,
  updatedAt: null,
  completedAt: null,
  
  // Permissions - who can view/edit this project
  permissions: {
    viewAccess: [], // UIDs who can view
    editAccess: [], // UIDs who can edit
    commentAccess: [], // UIDs who can comment
    approvalRequired: false
  }
};

/**
 * Validation functions
 */
export const validateUserRole = (userData) => {
  const errors = [];
  
  if (!userData.role || !['client', 'staff', 'admin'].includes(userData.role)) {
    errors.push('Valid role is required (client, staff, or admin)');
  }
  
  if (!userData.email || !userData.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateClientProfile = (profileData) => {
  const errors = [];
  
  if (!profileData.company || profileData.company.trim().length < 2) {
    errors.push('Company name is required');
  }
  
  if (!profileData.industry) {
    errors.push('Industry selection is required');
  }
  
  if (!profileData.projectTypes || profileData.projectTypes.length === 0) {
    errors.push('At least one project type must be selected');
  }
  
  if (!profileData.budget) {
    errors.push('Budget range is required');
  }
  
  if (!profileData.timeline) {
    errors.push('Timeline preference is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStaffProfile = (profileData) => {
  const errors = [];
  
  if (!profileData.position) {
    errors.push('Position/role is required');
  }
  
  if (!profileData.skills || profileData.skills.length === 0) {
    errors.push('At least one skill must be selected');
  }
  
  if (!profileData.experience) {
    errors.push('Experience level is required');
  }
  
  if (!profileData.companyCode || profileData.companyCode.trim().length < 3) {
    errors.push('Valid company code is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAdminProfile = (profileData) => {
  const errors = [];
  
  if (!profileData.company?.name || profileData.company.name.trim().length < 2) {
    errors.push('Company name is required');
  }
  
  if (!profileData.company?.size) {
    errors.push('Company size is required');
  }
  
  if (!profileData.services || profileData.services.length === 0) {
    errors.push('At least one service must be selected');
  }
  
  if (!profileData.teamSize || profileData.teamSize < 1) {
    errors.push('Team size must be at least 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to create a complete user document based on role
export const createRoleBasedUserDocument = (baseUser, roleProfile) => {
  const userDoc = {
    ...BaseUserSchema,
    ...baseUser,
    updatedAt: new Date(),
    onboardingComplete: true,
    onboardedAt: new Date()
  };
  
  // Add role-specific profile data
  switch (baseUser.role) {
    case 'client':
      userDoc.clientProfile = { ...ClientProfileSchema, ...roleProfile };
      break;
    case 'staff':
      userDoc.staffProfile = { ...StaffProfileSchema, ...roleProfile };
      break;
    case 'admin':
      userDoc.adminProfile = { ...AdminProfileSchema, ...roleProfile };
      break;
  }
  
  return userDoc;
};