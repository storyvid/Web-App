import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  FolderOpen, 
  FileText, 
  UserX 
} from 'lucide-react';
import AdminStatsCard from './AdminStatsCard';

const AdminDashboardNew = () => {
  console.log('🚀 NEW TAILWIND ADMIN DASHBOARD LOADED');
  const user = useSelector(selectUser);
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    activeProjects: 0,
    pendingRequests: 0,
  });
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching with existing mock data
    setTimeout(() => {
      setStats({
        users: 5,
        companies: 1,
        activeProjects: 1,
        pendingRequests: 0,
      });

      setUnassignedUsers([
        // Mock data - replace with actual data fetching
        // {
        //   id: 1,
        //   full_name: 'John Doe',
        //   email: 'john@example.com'
        // }
      ]);

      setRecentRequests([
        {
          id: 1,
          title: 'Corporate Brand Video',
          budget: 15000,
          status: 'submitted'
        },
        {
          id: 2,
          title: 'Product Demo Series',
          budget: 8000,
          status: 'under_review'
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const requestStatusConfig = {
    submitted: { label: "New", color: "bg-blue-100 text-blue-800" },
    under_review: { label: "In Review", color: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approved", color: "bg-green-100 text-green-800" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-[#F8F5F0] min-h-full">
      <div className="max-w-full mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-serif-display text-stone-900">Admin Dashboard</h1>
          <p className="text-base text-gray-500 mt-2">Platform overview and key metrics.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard 
            title="Total Users" 
            value={stats.users} 
            icon={Users} 
            delay={0.1} 
          />
          <AdminStatsCard 
            title="Total Companies" 
            value={stats.companies} 
            icon={Building2} 
            delay={0.2} 
          />
          <AdminStatsCard 
            title="Active Projects" 
            value={stats.activeProjects} 
            icon={FolderOpen} 
            delay={0.3} 
          />
          <AdminStatsCard 
            title="Pending Requests" 
            value={stats.pendingRequests} 
            icon={FileText} 
            delay={0.4} 
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Project Requests */}
          <div className="lg:col-span-2 bg-white border border-stone-200/80 shadow-none rounded-lg">
            <div className="p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-stone-900">Recent Project Requests</h2>
                <button className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentRequests.length > 0 ? (
                  recentRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors">
                      <div>
                        <p className="font-semibold text-stone-800">{req.title}</p>
                        <p className="text-sm text-stone-500">Budget: ${req.budget?.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${requestStatusConfig[req.status]?.color || 'bg-gray-100 text-gray-800'} border-0`}>
                        {requestStatusConfig[req.status]?.label || req.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-stone-500">No project requests yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Unassigned Users */}
          <div className="bg-white border border-stone-200/80 shadow-none rounded-lg">
            <div className="p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-semibold text-stone-900">Unassigned Users</h2>
                </div>
                <button className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
                  Manage
                </button>
              </div>
              
              <div className="space-y-3">
                {unassignedUsers.length > 0 ? (
                  unassignedUsers.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-stone-900">{user.full_name}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                      <button className="px-3 py-1 text-sm border border-stone-300 rounded-md hover:bg-stone-50 transition-colors">
                        Assign Role
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center py-8 text-stone-500">No unassigned users!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;