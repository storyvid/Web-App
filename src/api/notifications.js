// Notifications API module
export default function createNotificationsAPI(firebaseService) {
  return {
    // Get user notifications
    async getNotifications(uid) {
      try {
        const notifications = await firebaseService.getNotifications(uid);
        return notifications || [];
      } catch (error) {
        throw new Error(error.message || 'Failed to get notifications');
      }
    },

    // Mark notification as read
    async markAsRead(notificationId) {
      try {
        await firebaseService.markNotificationAsRead(notificationId);
        return { success: true };
      } catch (error) {
        throw new Error(error.message || 'Failed to mark notification as read');
      }
    }
  };
}