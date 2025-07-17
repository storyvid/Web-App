import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, Header } from '../DashboardComponents';
import { theme, styles } from '../../pages/dashboardStyles';

const PersistentDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Layout state - persisted across route changes
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mock data for header (this could be moved to a context later)
  const [data] = useState({
    user: user || {},
    notifications: [
      {
        id: 1,
        title: 'New project assigned',
        message: 'You have been assigned to Website Redesign project',
        time: '5 minutes ago',
        unread: true
      },
      {
        id: 2,
        title: 'Project update',
        message: 'Brand Story project status updated to In Review',
        time: '1 hour ago',
        unread: true
      },
      {
        id: 3,
        title: 'Deadline reminder',
        message: 'Product Demo milestone due tomorrow',
        time: '2 hours ago',
        unread: false
      }
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

export default PersistentDashboardLayout;