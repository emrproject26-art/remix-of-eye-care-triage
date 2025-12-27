import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sessionTimeout: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('arts_user');
    const savedTime = localStorage.getItem('arts_session_time');
    
    if (savedUser && savedTime) {
      const elapsed = Date.now() - parseInt(savedTime);
      if (elapsed < SESSION_TIMEOUT) {
        setUser(JSON.parse(savedUser));
        setLastActivity(parseInt(savedTime));
      } else {
        localStorage.removeItem('arts_user');
        localStorage.removeItem('arts_session_time');
      }
    }
    setIsLoading(false);
  }, []);

  // Update activity on user interaction
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      const now = Date.now();
      setLastActivity(now);
      localStorage.setItem('arts_session_time', now.toString());
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [user]);

  // Auto logout on session timeout
  useEffect(() => {
    if (!user) return;

    const checkTimeout = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= SESSION_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimeout);
  }, [user, lastActivity]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = mockUsers[username.toLowerCase()];
    
    if (!mockUser) {
      setIsLoading(false);
      return { success: false, error: 'User not found' };
    }

    if (mockUser.password !== password) {
      setIsLoading(false);
      return { success: false, error: 'Invalid password' };
    }

    const { password: _, ...userWithoutPassword } = mockUser;
    setUser(userWithoutPassword);
    localStorage.setItem('arts_user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('arts_session_time', Date.now().toString());
    setLastActivity(Date.now());
    setIsLoading(false);

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('arts_user');
    localStorage.removeItem('arts_session_time');
  }, []);

  const sessionTimeout = Math.max(0, SESSION_TIMEOUT - (Date.now() - lastActivity));

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      sessionTimeout 
    }}>
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
