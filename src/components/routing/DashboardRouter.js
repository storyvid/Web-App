import React from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { selectUser } from '../../store/slices/authSlice';

// Import role-specific dashboard components
import ClientDashboard from '../dashboards/ClientDashboard';
import StaffDashboard from '../dashboards/StaffDashboard';
import AdminDashboard from '../dashboards/AdminDashboard';

// Fallback to the original dashboard for now
import Dashboard from '../../pages/Dashboard';

const DashboardRouter = () => {
  const user = useSelector(selectUser);
  const [searchParams] = useSearchParams();
  const viewOverride = searchParams.get('view'); // Allow URL override for testing

  if (!user) {
    return <Dashboard />; // Fallback to original dashboard
  }

  // Determine which dashboard to show based on role
  const userRole = viewOverride || user.role;

  switch (userRole) {
    case 'client':
      return <ClientDashboard />;
      
    case 'staff':
      return <StaffDashboard />;
      
    case 'admin':
      return <AdminDashboard />;
      
    default:
      return <Dashboard />;
  }
};

export default DashboardRouter;