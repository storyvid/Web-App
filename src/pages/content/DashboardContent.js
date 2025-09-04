import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, FolderOpen, FileText, UserX } from 'lucide-react';
import AdminStatsCard from '../../components/dashboards/AdminStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { useAuth } from "../../contexts/AuthContext";
import firebaseService from "../../services/firebase/firebaseService";

export default function DashboardContent() {
    const { user } = useAuth();
    const navigate = useNavigate();
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
        const fetchData = async () => {
            if (!user || !user.uid || !user.role) {
                console.log('⏳ Waiting for user authentication...');
                return;
            }
            
            setIsLoading(true);
            try {
                let userProjects = [];
                let allUsers = [];

                if (user.role === "admin") {
                    try {
                        userProjects = await firebaseService.getProjects();
                        allUsers = await firebaseService.getAllUsers();
                    } catch (error) {
                        console.warn("Admin data unavailable:", error);
                        userProjects = [];
                        allUsers = [];
                    }

                    setStats({
                        users: allUsers.filter(u => u.role === "client" || u.role === "staff").length,
                        companies: allUsers.filter(u => u.company).length,
                        activeProjects: userProjects.filter(p => p.status === "in-progress").length,
                        pendingRequests: userProjects.filter(p => p.status === "awaiting-feedback" || p.status === "review").length,
                    });

                    const fetchedUnassigned = allUsers.filter(u => !u.role || !['client', 'staff', 'admin'].includes(u.role));
                    if (fetchedUnassigned.length === 0) {
                        // Keep mock users when no real unassigned users
                        setUnassignedUsers([
                            { id: 1, full_name: "John Smith", name: "John Smith", email: "john.smith@example.com" },
                            { id: 2, full_name: "Sarah Johnson", name: "Sarah Johnson", email: "sarah.j@company.com" },
                            { id: 3, full_name: "Mike Wilson", name: "Mike Wilson", email: "m.wilson@startup.io" }
                        ]);
                    } else {
                        setUnassignedUsers(fetchedUnassigned);
                    }
                    setRecentRequests(userProjects.slice(0, 5));
                }

            } catch (error) {
                console.error("Error loading admin dashboard data:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [user?.role, user?.uid]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }
    
    if (!user || user.role !== "admin") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Access Restricted</h2>
                    <p className="text-gray-500">This dashboard is only available to administrators.</p>
                </div>
            </div>
        );
    }
    
    const requestStatusConfig = {
      submitted: { label: "New", color: "bg-blue-100 text-blue-800" },
      under_review: { label: "In Review", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", color: "bg-green-100 text-green-800" },
    };

    return (
        <div className="bg-[#F8F5F0] min-h-full -m-8">
            <div className="max-w-full mx-auto space-y-8 p-6 sm:p-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="pl-2">
                    <h1 className="text-5xl font-serif-display text-stone-900">Admin Dashboard</h1>
                    <p className="text-base font-medium text-[#7D7A73] mt-2">Platform overview and key metrics.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AdminStatsCard title="Total Users" value={stats.users} icon={Users} delay={0.1} />
                    <AdminStatsCard title="Total Companies" value={stats.companies} icon={Building2} delay={0.2} />
                    <AdminStatsCard title="Active Projects" value={stats.activeProjects} icon={FolderOpen} delay={0.3} />
                    <AdminStatsCard title="Pending Requests" value={stats.pendingRequests} icon={FileText} delay={0.4} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 bg-white border border-stone-200/80 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Project Requests</CardTitle>
                             <Button 
                                variant="ghost" 
                                className="text-sm font-semibold h-auto p-1 text-orange-500"
                                onClick={() => navigate("/admin/projects")}
                             >
                                View All
                             </Button>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                {recentRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50">
                                        <div>
                                            <p className="font-semibold text-stone-800">{req.title || req.name}</p>
                                            <p className="text-sm text-stone-500">Budget: ${req.budget?.toLocaleString() || 'Not specified'}</p>
                                        </div>
                                        <Badge className={`${requestStatusConfig[req.status]?.color || 'bg-gray-100 text-gray-800'} border-0`}>
                                            {requestStatusConfig[req.status]?.label || req.status}
                                        </Badge>
                                    </div>
                                ))}
                           </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border border-stone-200/80 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between">
                           <CardTitle className="flex items-center gap-2"><UserX className="w-5 h-5 text-orange-500"/>Unassigned Users</CardTitle>
                           <Button 
                             variant="ghost" 
                             className="text-sm font-semibold h-auto p-1 text-orange-500"
                             onClick={() => navigate("/admin/users")}
                           >
                             Manage
                           </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {unassignedUsers.slice(0, 5).map(user => (
                                    <div key={user.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium">{user.full_name || user.name}</p>
                                            <p className="text-xs text-stone-500">{user.email}</p>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => navigate("/admin/users")}
                                        >
                                          Assign Role
                                        </Button>
                                    </div>
                                ))}
                                {unassignedUsers.length === 0 && <p className="text-sm text-center py-8 text-stone-500">No unassigned users!</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}