// Main API module - centralized API management
import firebaseService from '../services/firebase/firebaseService';
import auth from './auth';
import users from './users';
import projects from './projects';
import dashboard from './dashboard';
import activities from './activities';
import notifications from './notifications';
import realtime from './realtime';

class API {
  constructor() {
    // Use existing Firebase service singleton
    this.firebaseService = firebaseService;
    this.initialized = false;
    
    // Bind all API modules with Firebase service
    this.auth = auth(this.firebaseService);
    this.users = users(this.firebaseService);
    this.projects = projects(this.firebaseService);
    this.dashboard = dashboard(this.firebaseService);
    this.activities = activities(this.firebaseService);
    this.notifications = notifications(this.firebaseService);
    this.realtime = realtime(this.firebaseService);
  }

  // Initialize the API (setup Firebase)
  async initialize() {
    if (!this.initialized) {
      try {
        await this.firebaseService.initialize();
        this.initialized = true;
        console.log('API initialized successfully');
      } catch (error) {
        console.error('API initialization failed:', error);
        throw error;
      }
    }
    return this.initialized;
  }

  // Check if API is ready
  isReady() {
    return this.initialized && !this.firebaseService.useMockData;
  }

  // Get Firebase service instance (for direct access if needed)
  getFirebaseService() {
    return this.firebaseService;
  }

  // Health check
  async healthCheck() {
    try {
      // Simple test to check if Firebase is responsive
      const testResult = await this.firebaseService.healthCheck?.() || true;
      return {
        status: 'ok',
        firebase: testResult,
        initialized: this.initialized,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        initialized: this.initialized,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export singleton instance
const api = new API();

export default api;