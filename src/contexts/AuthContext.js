import React, { createContext, useContext, useState, useEffect } from 'react';

// Import Firebase service
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize Firebase
        await firebaseService.initialize();
        
        // Set up auth state listener
        const unsubscribe = firebaseService.onAuthStateChanged((user) => {
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoading(false);
      }
    };

    const unsubscribe = initializeAuth();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const result = await firebaseService.signIn(email, password);
      setAuthLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setAuthLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    setError(null);
    
    try {
      await firebaseService.signOut();
      setAuthLoading(false);
    } catch (err) {
      console.error('Logout error:', err);
      setAuthLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    authLoading,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};