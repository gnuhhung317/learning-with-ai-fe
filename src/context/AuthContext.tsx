"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config/api-config';

interface User {
  id: number;
  email: string;
  name?: string;
  preferences: Record<string, unknown>;
  created_at: string;
}

interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  recentActivity: Array<{ date: string; count: number }>;
  achievements: number;
}

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  token: string | null;
  loading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; preferences?: Record<string, unknown> }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, []);

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(tokenToVerify);
        
        // Get user profile with stats
        await fetchProfile(tokenToVerify);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const verifyStoredToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        await verifyToken(storedToken);
      } else {
        setLoading(false);
      }
    };
    
    verifyStoredToken();
  }, [verifyToken]);

  const login = async (email: string, name?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      
      // Fetch profile with stats
      await fetchProfile(data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setStats(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const updateProfile = async (data: { name?: string; preferences?: Record<string, unknown> }) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
      }

      const result = await response.json();
      setUser(result.user);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    await fetchProfile(token);
  };

  const value: AuthContextType = {
    user,
    stats,
    token,
    loading,
    login,
    logout,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
