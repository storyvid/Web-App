// Dashboard API module
export default function createDashboardAPI(firebaseService) {
  return {
    // Get dashboard data based on user role
    async getDashboardData(uid, role) {
      try {
        const dashboardData = await firebaseService.getDashboardData(uid, role);
        return dashboardData || { stats: {}, activities: [], notifications: [] };
      } catch (error) {
        throw new Error(error.message || 'Failed to get dashboard data');
      }
    },

    // Get dashboard statistics
    async getStats(uid, role) {
      try {
        const stats = await firebaseService.getDashboardStats(uid, role);
        return stats || {};
      } catch (error) {
        throw new Error(error.message || 'Failed to get dashboard stats');
      }
    }
  };
}