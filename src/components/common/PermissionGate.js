import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions and role
 */
const PermissionGate = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [],
  requireAllPermissions = false,
  fallback = null,
  requireOnboarding = true
}) => {
  const user = useSelector(selectUser);

  // If no user, don't render
  if (!user) {
    return fallback;
  }

  // Check onboarding requirement
  if (requireOnboarding && !user.onboardingComplete) {
    return fallback;
  }

  // Check role permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback;
  }

  // Check specific permissions for admin users
  if (requiredPermissions.length > 0 && user.role === 'admin') {
    const userPermissions = user.adminProfile?.permissions || {};
    
    if (requireAllPermissions) {
      // All permissions must be true
      const hasAllPermissions = requiredPermissions.every(
        permission => userPermissions[permission] === true
      );
      if (!hasAllPermissions) {
        return fallback;
      }
    } else {
      // At least one permission must be true
      const hasAnyPermission = requiredPermissions.some(
        permission => userPermissions[permission] === true
      );
      if (!hasAnyPermission) {
        return fallback;
      }
    }
  }

  // All checks passed, render children
  return children;
};

export default PermissionGate;