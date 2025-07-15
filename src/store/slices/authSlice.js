import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for auth operations
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // This will be connected to our API module
      const { default: api } = await import('../../api');
      const result = await api.auth.login(email, password);
      return result;
    } catch (error) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: error.code,
        message: error.message,
        name: error.name
      };
      return rejectWithValue(serializedError);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      await api.auth.logout();
      return null;
    } catch (error) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: error.code,
        message: error.message,
        name: error.name
      };
      return rejectWithValue(serializedError);
    }
  }
);

export const refreshUserProfile = createAsyncThunk(
  'auth/refreshUserProfile',
  async (uid, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const profile = await api.users.getProfile(uid);
      return profile;
    } catch (error) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: error.code,
        message: error.message,
        name: error.name
      };
      return rejectWithValue(serializedError);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ uid, updates }, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const updatedProfile = await api.users.updateProfile(uid, updates);
      return updatedProfile;
    } catch (error) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: error.code,
        message: error.message,
        name: error.name
      };
      return rejectWithValue(serializedError);
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'auth/updateUserSettings',
  async ({ uid, settings }, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const updatedSettings = await api.users.updateSettings(uid, settings);
      return updatedSettings;
    } catch (error) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: error.code,
        message: error.message,
        name: error.name
      };
      return rejectWithValue(serializedError);
    }
  }
);

export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async ({ uid, profileData }, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const result = await api.users.completeOnboarding(uid, profileData);
      return result;
    } catch (error) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: error.code,
        message: error.message,
        name: error.name
      };
      return rejectWithValue(serializedError);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  authLoading: false,
  error: null,
  lastLoginAt: null,
  sessionExpiry: null,
  isOnline: true
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.lastLoginAt = action.payload ? Date.now() : null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLoginAt = null;
      state.sessionExpiry = null;
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.lastLoginAt = Date.now();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginAt = null;
        state.sessionExpiry = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })
      
      // Refresh Profile
      .addCase(refreshUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Settings
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        if (state.user) {
          state.user.settings = { ...state.user.settings, ...action.payload };
        }
      })
      
      // Complete Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { 
  clearError, 
  setOnlineStatus, 
  setUser, 
  clearAuth, 
  updateUserData 
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.authLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserSettings = (state) => state.auth.user?.settings;

export default authSlice.reducer;