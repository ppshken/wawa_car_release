import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<ApiResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('wawa_token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('wawa_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.get<ApiResponse>('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('wawa_user', JSON.stringify(res.data.user));
      }
    } catch (err) {}
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('wawa_token');
      if (storedToken) {
        try {
          const res = await api.get<ApiResponse>('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('wawa_user', JSON.stringify(res.data.user));
          }
        } catch (err: any) {
          // If explicitly unauthorized (token expired / invalid), clear session
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            logout();
          } else {
            // Keep existing cached user if network hiccup
            const stored = localStorage.getItem('wawa_user');
            if (stored) {
              try {
                setUser(JSON.parse(stored));
              } catch (e) {}
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<ApiResponse> => {
    try {
      const res = await api.post<ApiResponse>('/auth/login', { username, password });
      if (res.data.success && res.data.token && res.data.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('wawa_token', res.data.token);
        localStorage.setItem('wawa_user', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wawa_token');
    localStorage.removeItem('wawa_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
