import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Folder as ProjectsIcon,
  PermMedia as AssetsIcon,
  BusinessCenter as ServicesIcon,
  Settings as SettingsIcon,
  People as TeamIcon,
  Person as ClientsIcon,
  Analytics as AnalyticsIcon,
  Assignment as TasksIcon,
  Schedule as CalendarIcon,
  Message as MessagesIcon,
  Receipt as BillingIcon,
  Security as PermissionsIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { selectUser } from '../../store/slices/authSlice';

const RoleBasedNavigation = ({ activeItem = 'dashboard', onMenuItemClick }) => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [quickActionsAnchor, setQuickActionsAnchor] = useState(null);

  // Define navigation items based on role
  const getNavigationItems = (role) => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/dashboard' }
    ];

    switch (role) {
      case 'client':
        return [
          ...baseItems,
          { id: 'projects', label: 'My Projects', icon: ProjectsIcon, path: '/projects' },
          { id: 'assets', label: 'Assets', icon: AssetsIcon, path: '/assets' },
          { id: 'messages', label: 'Messages', icon: MessagesIcon, path: '/messages', badge: 3 },
          { id: 'billing', label: 'Billing', icon: BillingIcon, path: '/billing' },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' }
        ];

      case 'staff':
        return [
          ...baseItems,
          { id: 'assignments', label: 'My Tasks', icon: TasksIcon, path: '/assignments', badge: 5 },
          { id: 'projects', label: 'Projects', icon: ProjectsIcon, path: '/projects' },
          { id: 'assets', label: 'Assets', icon: AssetsIcon, path: '/assets' },
          { id: 'calendar', label: 'Calendar', icon: CalendarIcon, path: '/calendar' },
          { id: 'messages', label: 'Messages', icon: MessagesIcon, path: '/messages', badge: 2 },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' }
        ];

      case 'admin':
        return [
          ...baseItems,
          { id: 'projects', label: 'Projects', icon: ProjectsIcon, path: '/projects' },
          { id: 'team', label: 'Team', icon: TeamIcon, path: '/team' },
          { id: 'clients', label: 'Clients', icon: ClientsIcon, path: '/clients' },
          { id: 'assets', label: 'Assets', icon: AssetsIcon, path: '/assets' },
          { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon, path: '/analytics' },
          { id: 'billing', label: 'Billing', icon: BillingIcon, path: '/billing' },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' }
        ];

      default:
        return [
          ...baseItems,
          { id: 'projects', label: 'Projects', icon: ProjectsIcon, path: '/projects' },
          { id: 'assets', label: 'Assets', icon: AssetsIcon, path: '/assets' },
          { id: 'services', label: 'Services', icon: ServicesIcon, path: '/services' },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' }
        ];
    }
  };

  // Get quick actions based on role
  const getQuickActions = (role) => {
    switch (role) {
      case 'client':
        return [
          { id: 'new-project', label: 'Request New Project', icon: AddIcon },
          { id: 'message-team', label: 'Message Team', icon: MessagesIcon },
          { id: 'view-assets', label: 'View Latest Assets', icon: AssetsIcon }
        ];

      case 'staff':
        return [
          { id: 'log-time', label: 'Log Time', icon: CalendarIcon },
          { id: 'upload-asset', label: 'Upload Asset', icon: AssetsIcon },
          { id: 'update-task', label: 'Update Task Status', icon: TasksIcon }
        ];

      case 'admin':
        return [
          { id: 'new-project', label: 'Create Project', icon: ProjectsIcon },
          { id: 'invite-member', label: 'Invite Team Member', icon: TeamIcon },
          { id: 'add-client', label: 'Add Client', icon: ClientsIcon },
          { id: 'view-analytics', label: 'View Analytics', icon: AnalyticsIcon }
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems(user?.role || 'client');
  const quickActions = getQuickActions(user?.role || 'client');

  const handleMenuClick = (item) => {
    if (onMenuItemClick) {
      onMenuItemClick(item.id);
    }
    
    // For testing, we'll just update the URL hash for now
    // In a real implementation, this would use React Router
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleQuickAction = (action) => {
    setQuickActionsAnchor(null);
    console.log('Quick action triggered:', action.id);
    // TODO: Implement quick action handlers
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'staff': return 'warning'; 
      case 'client': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'staff': return 'Team Member';
      case 'client': return 'Client';
      default: return 'User';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      pt: 0, 
      mt: 0
    }}>
      {/* Logo - aligned with header content */}
      <Box sx={{ 
        position: 'relative',
        px: 3, 
        py: 0, 
        mt: '-16px',
        display: 'flex', 
        alignItems: 'center', 
        minHeight: 64,
        overflow: 'hidden' // Hide any overflow from negative margin on image
      }}>
        <img 
          src="/storyvid_logo.svg" 
          alt="StoryVid" 
          style={{ 
            width: 96, // Reduced by 20% (120 * 0.8 = 96)
            height: 96, // Reduced by 20% (120 * 0.8 = 96)
            marginTop: '-20px' // Negative margin to crop top whitespace from SVG
          }} 
        />
      </Box>

      {/* User Role Badge */}
      <Box sx={{ mb: 3, textAlign: 'center', px: 2 }}>
        <Chip 
          label={getRoleLabel(user?.role)}
          color={getRoleColor(user?.role)}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
        {user?.name && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {user.name}
          </Typography>
        )}
      </Box>

      {/* Main Navigation */}
      <Typography variant="caption" sx={{ px: 3, mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
        NAVIGATION
      </Typography>
      
      <Stack spacing={0.5} sx={{ mb: 3, flex: 1, px: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItem || location.pathname === item.path;
          
          return (
            <Button
              key={item.id}
              startIcon={
                item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )
              }
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : 'action.hover'
                },
                fontWeight: isActive ? 'bold' : 'normal'
              }}
              fullWidth
              onClick={() => handleMenuClick(item)}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Quick Actions */}
      <Box sx={{ mb: 2, px: 2 }}>
        <Typography variant="caption" sx={{ px: 1, mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
          QUICK ACTIONS
        </Typography>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          endIcon={<MoreIcon />}
          onClick={(e) => setQuickActionsAnchor(e.currentTarget)}
          sx={{ 
            justifyContent: 'space-between',
            borderStyle: 'dashed',
            py: 1.5
          }}
        >
          Quick Actions
        </Button>

        <Menu
          anchorEl={quickActionsAnchor}
          open={Boolean(quickActionsAnchor)}
          onClose={() => setQuickActionsAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <MenuItem
                key={action.id}
                onClick={() => handleQuickAction(action)}
                sx={{ py: 1.5 }}
              >
                <Icon sx={{ mr: 2 }} />
                {action.label}
              </MenuItem>
            );
          })}
        </Menu>
      </Box>

      {/* Role-specific features */}
      {user?.role === 'admin' && (
        <Box sx={{ mb: 2, px: 2 }}>
          <Button
            variant="text"
            fullWidth
            startIcon={<PermissionsIcon />}
            sx={{ 
              justifyContent: 'flex-start',
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
            onClick={() => navigate('/admin/permissions')}
          >
            Manage Permissions
          </Button>
        </Box>
      )}

      {user?.role === 'staff' && user?.staffProfile?.position && (
        <Box sx={{ mx: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            ROLE
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {user.staffProfile.position}
          </Typography>
          {user.staffProfile.availability && (
            <Typography variant="caption" color="text.secondary">
              {user.staffProfile.availability.hoursPerWeek}h/week
            </Typography>
          )}
        </Box>
      )}

      {user?.role === 'client' && user?.clientProfile?.company && (
        <Box sx={{ mx: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            COMPANY
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {user.clientProfile.company}
          </Typography>
          {user.clientProfile.industry && (
            <Typography variant="caption" color="text.secondary">
              {user.clientProfile.industry}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default RoleBasedNavigation;