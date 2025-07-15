import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Theme and UI preferences
  theme: 'light',
  sidebarOpen: true,
  mobileMenuOpen: false,
  
  // Loading states for different UI sections
  loadingStates: {
    dashboard: false,
    projects: false,
    profile: false,
    notifications: false
  },
  
  // Error messages for different UI sections
  errors: {
    global: null,
    dashboard: null,
    projects: null,
    profile: null,
    notifications: null
  },
  
  // User preferences
  preferences: {
    dashboardLayout: 'default',
    itemsPerPage: 10,
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/New_York',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false
  },
  
  // Modal and dialog states
  modals: {
    createProject: false,
    editProfile: false,
    settings: false,
    fileUpload: false,
    confirmDialog: false
  },
  
  // Search and filter states
  searchTerm: '',
  activeFilters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
  
  // Network status
  isOnline: true,
  lastSync: null
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme and layout
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Loading states
    setLoading: (state, action) => {
      const { section, loading } = action.payload;
      state.loadingStates[section] = loading;
    },
    setGlobalLoading: (state, action) => {
      Object.keys(state.loadingStates).forEach(key => {
        state.loadingStates[key] = action.payload;
      });
    },
    
    // Error handling
    setError: (state, action) => {
      const { section, error } = action.payload;
      state.errors[section] = error;
    },
    clearError: (state, action) => {
      const section = action.payload;
      if (section) {
        state.errors[section] = null;
      } else {
        // Clear all errors
        Object.keys(state.errors).forEach(key => {
          state.errors[key] = null;
        });
      }
    },
    setGlobalError: (state, action) => {
      state.errors.global = action.payload;
    },
    
    // User preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },
    
    // Modal management
    openModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = true;
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Search and filters
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.activeFilters[key] = value;
    },
    removeFilter: (state, action) => {
      const key = action.payload;
      delete state.activeFilters[key];
    },
    clearFilters: (state) => {
      state.activeFilters = {};
      state.searchTerm = '';
    },
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    
    // Network status
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
      if (action.payload) {
        state.lastSync = Date.now();
      }
    },
    updateLastSync: (state) => {
      state.lastSync = Date.now();
    },
    
    // Reset UI state
    resetUI: (state) => {
      return { ...initialState, theme: state.theme, preferences: state.preferences };
    }
  }
});

// Export actions
export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setLoading,
  setGlobalLoading,
  setError,
  clearError,
  setGlobalError,
  updatePreferences,
  resetPreferences,
  openModal,
  closeModal,
  closeAllModals,
  setSearchTerm,
  setFilter,
  removeFilter,
  clearFilters,
  setSorting,
  setOnlineStatus,
  updateLastSync,
  resetUI
} = uiSlice.actions;

// Selectors
export const selectUI = (state) => state.ui;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectLoadingStates = (state) => state.ui.loadingStates;
export const selectLoading = (section) => (state) => state.ui.loadingStates[section];
export const selectErrors = (state) => state.ui.errors;
export const selectError = (section) => (state) => state.ui.errors[section];
export const selectGlobalError = (state) => state.ui.errors.global;
export const selectPreferences = (state) => state.ui.preferences;
export const selectModals = (state) => state.ui.modals;
export const selectModalOpen = (modalName) => (state) => state.ui.modals[modalName];
export const selectSearchTerm = (state) => state.ui.searchTerm;
export const selectActiveFilters = (state) => state.ui.activeFilters;
export const selectSorting = (state) => ({ 
  sortBy: state.ui.sortBy, 
  sortOrder: state.ui.sortOrder 
});
export const selectIsOnline = (state) => state.ui.isOnline;
export const selectLastSync = (state) => state.ui.lastSync;

export default uiSlice.reducer;