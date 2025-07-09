import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers = {
  'client@test.com': {
    id: '1',
    name: 'John Client',
    email: 'client@test.com',
    role: 'client',
    company: 'Tech Corp',
  },
  'staff@test.com': {
    id: '2',
    name: 'Sarah Staff',
    email: 'staff@test.com',
    role: 'staff',
  },
  'admin@test.com': {
    id: '3',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (err) {
      console.error('Error parsing saved user data:', err);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = mockUsers[email];
      if (mockUser && password) {
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setAuthLoading(false);
        return { success: true };
      }
      
      const errorMessage = !email || !password ? 'Please enter both email and password' : 'Invalid email or password';
      setError(errorMessage);
      setAuthLoading(false);
      return { success: false, error: errorMessage };
    } catch (err) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      setAuthLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('user');
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