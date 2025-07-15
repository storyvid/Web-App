import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for dashboard operations
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async ({ uid, role }, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const dashboardData = await api.dashboard.getDashboardData(uid, role);
      return dashboardData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActivities = createAsyncThunk(
  'dashboard/fetchActivities',
  async (filters, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const activities = await api.activities.getActivities(filters);
      return activities;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'dashboard/fetchNotifications',
  async (uid, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const notifications = await api.notifications.getNotifications(uid);
      return notifications;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'dashboard/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      await api.notifications.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  stats: {
    totalProjects: 0,
    pendingApprovals: 0,
    completedTasks: 0,
    teamMembers: 0
  },
  recentActivities: [],
  notifications: [],
  loading: false,
  error: null,
  lastUpdated: null,
  activitiesLoading: false,
  notificationsLoading: false
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addActivity: (state, action) => {
      state.recentActivities.unshift(action.payload);
      // Keep only the last 20 activities
      if (state.recentActivities.length > 20) {
        state.recentActivities = state.recentActivities.slice(0, 20);
      }
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateNotificationReadStatus: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        const { stats, activities, notifications } = action.payload;
        state.stats = stats || state.stats;
        state.recentActivities = activities || [];
        state.notifications = notifications || [];
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.activitiesLoading = true;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activitiesLoading = false;
        state.recentActivities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.activitiesLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.error = action.payload;
      })
      
      // Mark Notification Read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      });
  }
});

// Export actions
export const {
  clearError,
  addActivity,
  addNotification,
  updateStats,
  clearNotifications,
  updateNotificationReadStatus
} = dashboardSlice.actions;

// Selectors
export const selectDashboard = (state) => state.dashboard;
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectRecentActivities = (state) => state.dashboard.recentActivities;
export const selectNotifications = (state) => state.dashboard.notifications;
export const selectUnreadNotifications = (state) => 
  state.dashboard.notifications.filter(n => !n.read);
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;