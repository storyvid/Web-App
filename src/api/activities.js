// Activities API module
export default function createActivitiesAPI(firebaseService) {
  return {
    // Get activities with filters
    async getActivities(filters = {}) {
      try {
        const activities = await firebaseService.getActivities(filters);
        return activities || [];
      } catch (error) {
        throw new Error(error.message || 'Failed to get activities');
      }
    }
  };
}