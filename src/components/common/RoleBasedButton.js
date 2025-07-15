import React from 'react';
import { Button, Tooltip } from '@mui/material';
import PermissionGate from './PermissionGate';

/**
 * RoleBasedButton Component
 * Button that shows/hides and enables/disables based on user permissions
 */
const RoleBasedButton = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAllPermissions = false,
  disabledTooltip = "You don't have permission to perform this action",
  hideWhenNoPermission = false,
  ...buttonProps
}) => {
  if (hideWhenNoPermission) {
    return (
      <PermissionGate
        allowedRoles={allowedRoles}
        requiredPermissions={requiredPermissions}
        requireAllPermissions={requireAllPermissions}
        fallback={null}
      >
        <Button {...buttonProps}>
          {children}
        </Button>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate
      allowedRoles={allowedRoles}
      requiredPermissions={requiredPermissions}
      requireAllPermissions={requireAllPermissions}
      fallback={
        <Tooltip title={disabledTooltip}>
          <span>
            <Button {...buttonProps} disabled>
              {children}
            </Button>
          </span>
        </Tooltip>
      }
    >
      <Button {...buttonProps}>
        {children}
      </Button>
    </PermissionGate>
  );
};

export default RoleBasedButton;