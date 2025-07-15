import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and UI state
  blacklist: ['projects', 'dashboard'] // Don't persist data that should be fresh
};

// Auth persist config (more specific)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated', 'lastLoginAt'] // Only persist essential auth data
};

// UI persist config
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'preferences', 'sidebarOpen'] // Persist user preferences
};

// Create root reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  projects: projectsReducer,
  dashboard: dashboardReducer,
  ui: persistReducer(uiPersistConfig, uiReducer)
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// Create persistor
export const persistor = persistStore(store);

// Export hooks for easier usage
export { useSelector, useDispatch } from 'react-redux';

export default store;