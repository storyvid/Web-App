import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, Header } from '../DashboardComponents';
import { theme, styles } from '../../pages/dashboardStyles';
import { getRoleBasedData } from '../../data/mockData';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Layout state - persisted across route changes
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get role-based data including recent activity
  const roleData = getRoleBasedData(user?.role || 'client');
  
  // Convert recent activity to notifications format
  const activityNotifications = roleData.recentActivity ? roleData.recentActivity.map(activity => ({
    id: `activity-${activity.id}`,
    title: 'Recent Activity',
    message: `${activity.user.name} ${activity.action} ${activity.target}`,
    time: activity.time,
    unread: false
  })) : [];

  // Combine role-based notifications with activity notifications
  const [data] = useState({
    user: user || {},
    notifications: [
      ...(roleData.notifications || []),
      ...activityNotifications
    ]
  });

  // Update active menu item based on current route
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/dashboard') {
      setActiveMenuItem('dashboard');
    } else if (path === '/projects') {
      setActiveMenuItem('projects');
    } else if (path === '/admin/projects') {
      setActiveMenuItem('admin-projects');
    } else if (path === '/admin/users') {
      setActiveMenuItem('admin-users');
    } else if (path === '/settings') {
      setActiveMenuItem('settings');
    } else if (path.startsWith('/project/')) {
      setActiveMenuItem('projects'); // Keep projects active when viewing project details
    } else {
      // For other routes, try to match the first part of the path
      const firstSegment = path.split('/')[1];
      setActiveMenuItem(firstSegment || 'dashboard');
    }
  }, [location.pathname]);

  const handleMenuItemClick = (menuId) => {
    setActiveMenuItem(menuId);
    
    // Handle navigation based on menu item
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'admin-projects':
        navigate('/admin/projects');
        break;
      case 'admin-users':
        navigate('/admin/users');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'assets':
        // TODO: Add assets page
        console.log('Assets page not implemented yet');
        break;
      case 'services':
        // TODO: Add services page
        console.log('Services page not implemented yet');
        break;
      default:
        break;
    }
  };

  const handleMobileMenuClick = () => setMobileOpen(true);
  const handleMobileClose = () => setMobileOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={styles.dashboardContainer}>
        {/* Persistent Sidebar - Never re-renders */}
        <Sidebar 
          activeItem={activeMenuItem} 
          onMenuItemClick={handleMenuItemClick}
          userRole={user?.role || 'client'}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
          user={user}
        />
        
        <Box sx={styles.mainContent}>
          {/* Persistent Header - Never re-renders */}
          <Header 
            user={data.user} 
            notifications={data.notifications}
            onMobileMenuClick={handleMobileMenuClick}
          />
          
          {/* Dynamic Content Area - Only this changes between routes */}
          <Box sx={styles.contentWrapper}>
            <Box sx={styles.leftContent}>
              {/* This is where each page's content will be rendered */}
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AppLayout;