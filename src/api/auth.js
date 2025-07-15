// Authentication API module
export default function createAuthAPI(firebaseService) {
  return {
    // User login
    async login(email, password) {
      try {
        const result = await firebaseService.signIn(email, password);
        return {
          success: true,
          user: result.user,
          message: 'Login successful'
        };
      } catch (error) {
        // Preserve original Firebase error with code for better error handling
        throw error;
      }
    },

    // User logout
    async logout() {
      try {
        await firebaseService.signOut();
        return {
          success: true,
          message: 'Logout successful'
        };
      } catch (error) {
        // Preserve original Firebase error with code for better error handling
        throw error;
      }
    },

    // Register new user
    async register(userData) {
      try {
        const { email, password, ...profileData } = userData;
        
        // Create auth user
        const authResult = await firebaseService.createAuthUser(email, password);
        
        // Create user profile
        const profile = await firebaseService.createUser({
          ...profileData,
          email,
          uid: authResult.user.uid
        });

        return {
          success: true,
          user: { ...authResult.user, ...profile },
          message: 'Registration successful'
        };
      } catch (error) {
        // Preserve original Firebase error with code for better error handling
        throw error;
      }
    },

    // Refresh user session
    async refreshSession() {
      try {
        const currentUser = firebaseService.getCurrentUser();
        if (!currentUser) {
          throw new Error('No active session');
        }

        // Get fresh user data from Firestore
        const profile = await firebaseService.getUser(currentUser.uid);
        
        return {
          success: true,
          user: { ...currentUser, ...profile }
        };
      } catch (error) {
        throw new Error(error.message || 'Session refresh failed');
      }
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
      try {
        await firebaseService.updatePassword(currentPassword, newPassword);
        return {
          success: true,
          message: 'Password updated successfully'
        };
      } catch (error) {
        throw new Error(error.message || 'Password change failed');
      }
    },

    // Reset password
    async resetPassword(email) {
      try {
        await firebaseService.sendPasswordReset(email);
        return {
          success: true,
          message: 'Password reset email sent'
        };
      } catch (error) {
        // Preserve original Firebase error with code for better error handling
        throw error;
      }
    },

    // Verify email
    async verifyEmail() {
      try {
        await firebaseService.sendEmailVerification();
        return {
          success: true,
          message: 'Verification email sent'
        };
      } catch (error) {
        throw new Error(error.message || 'Email verification failed');
      }
    },

    // Check authentication status
    async checkAuthStatus() {
      try {
        const user = firebaseService.getCurrentUser();
        return {
          isAuthenticated: !!user,
          user: user || null
        };
      } catch (error) {
        return {
          isAuthenticated: false,
          user: null,
          error: error.message
        };
      }
    },

    // Set up authentication state listener
    onAuthStateChange(callback) {
      return firebaseService.onAuthStateChanged(callback);
    },

    // Get current user
    getCurrentUser() {
      return firebaseService.getCurrentUser();
    }
  };
}