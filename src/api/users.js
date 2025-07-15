// Users API module
export default function createUsersAPI(firebaseService) {
  return {
    // Get user profile
    async getProfile(uid) {
      try {
        const profile = await firebaseService.getUser(uid);
        if (!profile) {
          throw new Error('User profile not found');
        }
        return profile;
      } catch (error) {
        throw new Error(error.message || 'Failed to get user profile');
      }
    },

    // Update user profile
    async updateProfile(uid, updates) {
      try {
        const updatedProfile = await firebaseService.updateUser(uid, updates);
        return updatedProfile;
      } catch (error) {
        throw new Error(error.message || 'Failed to update profile');
      }
    },

    // Update user settings
    async updateSettings(uid, settings) {
      try {
        const updatedSettings = await firebaseService.updateUserSettings(uid, settings);
        return updatedSettings;
      } catch (error) {
        throw new Error(error.message || 'Failed to update settings');
      }
    },

    // Complete user onboarding
    async completeOnboarding(uid, profileData) {
      try {
        // Simple onboarding - just update user with basic info
        const userData = {
          role: profileData.role,
          email: profileData.email || '',
          name: profileData.name || '',
          onboardingComplete: true,
          onboardedAt: profileData.onboardedAt || new Date().toISOString()
        };

        // Create or update user document with basic info
        const updatedUser = await firebaseService.updateUser(uid, userData);

        return updatedUser;
      } catch (error) {
        throw new Error(error.message || 'Failed to complete onboarding');
      }
    },

    // Upload profile picture
    async uploadProfilePicture(uid, file) {
      try {
        if (firebaseService.uploadProfilePicture) {
          const uploadResult = await firebaseService.uploadProfilePicture(uid, file);
          return {
            success: true,
            avatarUrl: uploadResult.downloadURL,
            message: 'Profile picture updated'
          };
        } else {
          throw new Error('File upload not implemented yet');
        }
      } catch (error) {
        throw new Error(error.message || 'Failed to upload profile picture');
      }
    },

    // Get user preferences
    async getPreferences(uid) {
      try {
        const preferences = await firebaseService.getUserPreferences(uid);
        return preferences || {};
      } catch (error) {
        throw new Error(error.message || 'Failed to get preferences');
      }
    },

    // Update user preferences
    async updatePreferences(uid, preferences) {
      try {
        const updatedPreferences = await firebaseService.updateUserPreferences(uid, preferences);
        return updatedPreferences;
      } catch (error) {
        throw new Error(error.message || 'Failed to update preferences');
      }
    },

    // Get user permissions
    async getPermissions(uid) {
      try {
        const permissions = await firebaseService.getUserPermissions(uid);
        return permissions || [];
      } catch (error) {
        throw new Error(error.message || 'Failed to get permissions');
      }
    },

    // Update user permissions (admin only)
    async updatePermissions(uid, permissions) {
      try {
        const updatedPermissions = await firebaseService.updateUserPermissions(uid, permissions);
        return updatedPermissions;
      } catch (error) {
        throw new Error(error.message || 'Failed to update permissions');
      }
    },

    // Search users (admin/staff only)
    async searchUsers(query, filters = {}) {
      try {
        const users = await firebaseService.searchUsers(query, filters);
        return users || [];
      } catch (error) {
        throw new Error(error.message || 'Failed to search users');
      }
    },

    // Get team members
    async getTeamMembers(companyId) {
      try {
        const teamMembers = await firebaseService.getTeamMembers(companyId);
        return teamMembers || [];
      } catch (error) {
        throw new Error(error.message || 'Failed to get team members');
      }
    },

    // Invite user to team
    async inviteUser(email, role, companyId) {
      try {
        const inviteResult = await firebaseService.inviteUser(email, role, companyId);
        return {
          success: true,
          inviteId: inviteResult.inviteId,
          message: 'Invitation sent successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to send invitation');
      }
    },

    // Accept invitation
    async acceptInvitation(inviteId, userData) {
      try {
        const result = await firebaseService.acceptInvitation(inviteId, userData);
        return {
          success: true,
          user: result.user,
          message: 'Invitation accepted'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to accept invitation');
      }
    },

    // Deactivate user
    async deactivateUser(uid) {
      try {
        await firebaseService.deactivateUser(uid);
        return {
          success: true,
          message: 'User deactivated successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to deactivate user');
      }
    },

    // Reactivate user
    async reactivateUser(uid) {
      try {
        await firebaseService.reactivateUser(uid);
        return {
          success: true,
          message: 'User reactivated successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to reactivate user');
      }
    },

    // Get user activity log
    async getActivityLog(uid, limit = 50) {
      try {
        const activities = await firebaseService.getUserActivityLog(uid, limit);
        return activities || [];
      } catch (error) {
        throw new Error(error.message || 'Failed to get activity log');
      }
    },

    // Subscribe to user profile changes
    subscribeToProfileChanges(uid, callback) {
      return firebaseService.subscribeToUserChanges(uid, callback);
    }
  };
}