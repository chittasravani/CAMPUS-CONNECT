import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { initStorage, resetToSeedData } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize storage and load current user
  useEffect(() => {
    initStorage();
    authService.getCurrentUser().then((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const login = async (credentials) => {
    const user = await authService.login(credentials);
    setCurrentUser(user);
    return user;
  };

  const register = async (studentData) => {
    const user = await authService.register(studentData);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const switchRole = async (role) => {
    const user = await authService.switchRole(role);
    setCurrentUser(user);
    return user;
  };

  const switchUser = async (userId) => {
    const user = await authService.switchUser(userId);
    if (user) setCurrentUser(user);
    return user;
  };

  const updateProfile = async (profileData) => {
    if (!currentUser) return null;
    const updated = await authService.updateProfile(currentUser.id, profileData);
    setCurrentUser(updated);
    return updated;
  };

  const resetData = () => {
    resetToSeedData();
    authService.getCurrentUser().then((user) => {
      setCurrentUser(user);
    });
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    switchRole,
    switchUser,
    updateProfile,
    resetData,
    isAuthenticated: !!currentUser,
    isStudent: currentUser?.role === 'student',
    isOrganizer: currentUser?.role === 'organizer',
    isAdmin: currentUser?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
