import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import RoleBasedNavigation from '../navigation/RoleBasedNavigation';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ 
  children, 
  title, 
  activeNavItem = 'dashboard',
  showAppBar = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useSelector(selectUser);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const drawerWidth = 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchor(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const drawer = (
    <RoleBasedNavigation 
      activeItem={activeNavItem}
      onMenuItemClick={(item) => {
        console.log('Navigate to:', item);
        // Handle navigation here
      }}
    />
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      {showAppBar && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>

            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{ ml: 1 }}
            >
              <Avatar 
                src={user?.avatar} 
                sx={{ width: 32, height: 32 }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>

            {/* Profile Menu */}
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => navigate('/profile')}>
                <ProfileIcon sx={{ mr: 2 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => navigate('/settings')}>
                <SettingsIcon sx={{ mr: 2 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: { width: 320, maxHeight: 400 }
              }}
            >
              <MenuItem>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Project Update
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Corporate Brand Video is ready for review
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    New Message
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your team has sent you a message
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => navigate('/notifications')}>
                <Typography variant="body2" color="primary">
                  View all notifications
                </Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider',
              pt: 0,
              mt: 0
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider',
              pt: 0,
              mt: 0,
              '& > *:first-child': {
                mt: 0,
                pt: 0
              }
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: showAppBar ? '64px' : 0
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;