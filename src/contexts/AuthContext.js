import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import Redux actions
import { 
  loginUser, 
  logoutUser, 
  setUser, 
  clearAuth, 
  clearError,
  refreshUserProfile,
  setAuthError 
} from '../store/slices/authSlice';

// Import selectors
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectAuthError 
} from '../store/slices/authSlice';

// Import Firebase service for auth state listener
import firebaseService from '../services/firebase/firebaseService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  // Get auth state from Redux store
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const loading = useSelector(state => state.auth.loading);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize Firebase
        await firebaseService.initialize();
        
        // Set up auth state listener that dispatches to Redux
        const unsubscribe = firebaseService.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in, update Redux store
            dispatch(setUser(user));
          } else {
            // User is signed out, clear Redux store
            dispatch(clearAuth());
          }
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error initializing auth:', err);
        dispatch(clearAuth());
      }
    };

    initializeAuth();
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      return { success: true, user: result.user };
    } catch (err) {
      // Error is already handled by the async thunk in Redux
      return { success: false, error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await firebaseService.signInWithGoogle();
      if (result.user) {
        // Dispatch user to Redux store
        dispatch(setUser(result.user));
        return { success: true, user: result.user };
      }
      return { success: false, error: 'Google sign-in failed' };
    } catch (err) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: err.code,
        message: err.message,
        name: err.name
      };
      dispatch(setAuthError(serializedError));
      return { success: false, error: err };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await firebaseService.createUserWithEmailAndPassword(name, email, password);
      if (result.user) {
        // Dispatch user to Redux store
        dispatch(setUser(result.user));
        return { success: true, user: result.user };
      }
      return { success: false, error: 'Signup failed' };
    } catch (err) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: err.code,
        message: err.message,
        name: err.name
      };
      dispatch(setAuthError(serializedError));
      return { success: false, error: err };
    }
  };

  const resetPassword = async (email) => {
    try {
      await firebaseService.sendPasswordResetEmail(email);
      return { success: true };
    } catch (err) {
      // Serialize Firebase error for Redux (avoid non-serializable values)
      const serializedError = {
        code: err.code,
        message: err.message,
        name: err.name
      };
      dispatch(setAuthError(serializedError));
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.uid) {
      try {
        await dispatch(refreshUserProfile(user.uid)).unwrap();
      } catch (err) {
        console.error('Profile refresh error:', err);
      }
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const value = {
    user,
    isAuthenticated,
    login,
    signup,
    signInWithGoogle,
    resetPassword,
    logout,
    refreshProfile,
    loading,
    authLoading,
    error,
    clearError: clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};