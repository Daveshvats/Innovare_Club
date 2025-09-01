import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'coordinator' | 'super_admin';
  isApproved: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  userLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  mockLogin: (role?: 'user' | 'coordinator' | 'super_admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing mock user on mount
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      try {
        const userData = JSON.parse(mockUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse mock user data:', error);
        localStorage.removeItem('mockUser');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          id: data.admin.id,
          username: data.admin.username,
          email: data.admin.email,
          role: 'super_admin', // Default to super admin for now
          isApproved: true,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('mockUser', JSON.stringify(userData));
        localStorage.setItem('adminToken', data.token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const userLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          isApproved: data.user.isApproved,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('mockUser', JSON.stringify(userData));
        localStorage.setItem('userToken', data.token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('User login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
  };

  const mockLogin = (role: 'user' | 'coordinator' | 'super_admin' = 'user') => {
    const mockUser: User = {
      id: `mock_${Date.now()}`,
      username: `mock_${role}`,
      email: `${role}@example.com`,
      role,
      isApproved: true,
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    userLogin,
    logout,
    mockLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
