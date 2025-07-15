import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

/**
 * Hook for filtering and managing role-based data
 */
export const useRoleBasedData = (data = [], dataType = 'generic') => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter data based on user role and permissions
  const filteredData = useMemo(() => {
    if (!user || !data) return [];

    try {
      setError(null);
      
      switch (dataType) {
        case 'projects':
          return filterProjects(data, user);
        case 'users':
          return filterUsers(data, user);
        case 'assets':
          return filterAssets(data, user);
        case 'notifications':
          return filterNotifications(data, user);
        case 'analytics':
          return filterAnalytics(data, user);
        default:
          return data;
      }
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [data, user, dataType]);

  // Get data access permissions for current user
  const permissions = useMemo(() => {
    if (!user) return { canView: false, canEdit: false, canDelete: false, canCreate: false };

    const basePermissions = {
      canView: true,
      canEdit: false,
      canDelete: false,
      canCreate: false
    };

    switch (user.role) {
      case 'client':
        return {
          ...basePermissions,
          canCreate: dataType === 'projects', // Clients can request new projects
          canEdit: dataType === 'projects' || dataType === 'notifications' // Edit own projects/notifications
        };

      case 'staff':
        return {
          ...basePermissions,
          canEdit: ['projects', 'assets', 'notifications'].includes(dataType),
          canCreate: ['assets', 'notifications'].includes(dataType)
        };

      case 'admin':
        const adminPermissions = user.adminProfile?.permissions || {};
        return {
          canView: true,
          canEdit: true,
          canDelete: adminPermissions.systemAdmin || false,
          canCreate: true
        };

      default:
        return basePermissions;
    }
  }, [user, dataType]);

  return {
    data: filteredData,
    loading,
    error,
    permissions,
    userRole: user?.role,
    userId: user?.uid
  };
};

// Role-based filtering functions
const filterProjects = (projects, user) => {
  switch (user.role) {
    case 'client':
      // Clients only see their own projects
      return projects.filter(project => project.clientId === user.uid);

    case 'staff':
      // Staff see projects they're assigned to
      return projects.filter(project => 
        project.assignedStaff?.includes(user.uid) ||
        project.projectManager === user.uid
      );

    case 'admin':
      // Admins see all projects in their company
      const companyId = user.adminProfile?.companyId;
      return companyId ? 
        projects.filter(project => project.companyId === companyId) : 
        projects;

    default:
      return [];
  }
};

const filterUsers = (users, user) => {
  switch (user.role) {
    case 'client':
      // Clients can only see their assigned team members
      return users.filter(u => 
        u.role === 'staff' && 
        u.staffProfile?.companyId === getClientCompany(user)
      );

    case 'staff':
      // Staff can see other staff in their company and their clients
      const staffCompanyId = user.staffProfile?.companyId;
      return users.filter(u => 
        (u.role === 'staff' && u.staffProfile?.companyId === staffCompanyId) ||
        (u.role === 'client' && isClientOfCompany(u, staffCompanyId))
      );

    case 'admin':
      // Admins see all users in their company
      const adminCompanyId = user.adminProfile?.companyId;
      return users.filter(u => 
        (u.role === 'staff' && u.staffProfile?.companyId === adminCompanyId) ||
        (u.role === 'admin' && u.adminProfile?.companyId === adminCompanyId) ||
        (u.role === 'client' && isClientOfCompany(u, adminCompanyId))
      );

    default:
      return [];
  }
};

const filterAssets = (assets, user) => {
  // Assets are filtered by project access
  // This would need to be combined with project filtering
  return assets.filter(asset => {
    // For now, basic filtering - in real implementation would check project access
    switch (user.role) {
      case 'client':
        return asset.clientId === user.uid;
      case 'staff':
        return asset.assignedStaff?.includes(user.uid);
      case 'admin':
        return asset.companyId === user.adminProfile?.companyId;
      default:
        return false;
    }
  });
};

const filterNotifications = (notifications, user) => {
  // Users only see their own notifications
  return notifications.filter(notification => notification.userId === user.uid);
};

const filterAnalytics = (analytics, user) => {
  switch (user.role) {
    case 'client':
      // Clients see analytics for their projects only
      return analytics.filter(item => item.clientId === user.uid);

    case 'staff':
      // Staff see limited analytics for their projects
      return analytics.filter(item => 
        item.type !== 'financial' && // No financial data for staff
        (item.assignedStaff?.includes(user.uid) || item.projectManager === user.uid)
      );

    case 'admin':
      // Admins see all analytics for their company
      return analytics.filter(item => item.companyId === user.adminProfile?.companyId);

    default:
      return [];
  }
};

// Helper functions
const getClientCompany = (clientUser) => {
  // In a real implementation, this would look up which company serves this client
  // For now, return null as we need to implement client-company relationships
  return null;
};

const isClientOfCompany = (clientUser, companyId) => {
  // In a real implementation, this would check if client is served by the company
  // For now, return false as we need to implement client-company relationships
  return false;
};

/**
 * Hook for role-based UI state management
 */
export const useRoleBasedUI = () => {
  const user = useSelector(selectUser);

  const uiConfig = useMemo(() => {
    if (!user) return {};

    const baseConfig = {
      showNavigation: true,
      showSearch: true,
      showNotifications: true,
      showProfile: true
    };

    switch (user.role) {
      case 'client':
        return {
          ...baseConfig,
          primaryColor: 'primary',
          dashboardTitle: 'Client Portal',
          defaultView: 'projects',
          showTeamManagement: false,
          showBilling: true,
          showAnalytics: false,
          showQuickActions: [
            'request_project',
            'message_team',
            'view_assets',
            'schedule_meeting'
          ]
        };

      case 'staff':
        return {
          ...baseConfig,
          primaryColor: 'secondary',
          dashboardTitle: 'Team Dashboard',
          defaultView: 'assignments',
          showTeamManagement: false,
          showBilling: false,
          showAnalytics: true,
          showTimeTracking: true,
          showQuickActions: [
            'log_time',
            'upload_asset',
            'update_status',
            'message_client'
          ]
        };

      case 'admin':
        return {
          ...baseConfig,
          primaryColor: 'error',
          dashboardTitle: 'Admin Dashboard',
          defaultView: 'overview',
          showTeamManagement: true,
          showBilling: true,
          showAnalytics: true,
          showSystemSettings: true,
          showQuickActions: [
            'create_project',
            'invite_member',
            'add_client',
            'view_analytics',
            'manage_billing'
          ]
        };

      default:
        return baseConfig;
    }
  }, [user]);

  return {
    user,
    uiConfig,
    isClient: user?.role === 'client',
    isStaff: user?.role === 'staff',
    isAdmin: user?.role === 'admin'
  };
};

export default useRoleBasedData;