import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
axios.defaults.baseURL = window.location.origin;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('auth_token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token);
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set user state
        setUser(userData);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'Login failed' 
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Network error occurred';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Optional: Call logout endpoint
    axios.post('/api/auth/logout').catch(() => {
      // Ignore errors on logout endpoint
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}