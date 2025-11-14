import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, getAuthConfig } from "../api/auth";
import { getPatientProfile } from "../api/patient";
import { User } from "@shared/types/user";

type AuthStrategy = 'email' | 'oauth';

type AuthConfig = {
  strategy: AuthStrategy;
  oauth?: {
    authorizeUrl: string;
    clientId: string;
    scope: string;
  };
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  authStrategy: AuthStrategy | null;
  authConfig: AuthConfig | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  setAuthData: (accessToken: string, refreshToken: string, userData: User) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("accessToken");
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  });
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  // Initialize with 'email' as default to prevent infinite loading
  const [authStrategy, setAuthStrategy] = useState<AuthStrategy | null>('email');

  useEffect(() => {
    // Fetch auth config in background, don't block rendering
    const fetchAuthConfig = async () => {
      try {
        const config = await getAuthConfig();
        setAuthConfig(config);
        setAuthStrategy(config.strategy);
      } catch (error) {
        // Silently fail - already defaulted to 'email'
        console.log('Backend not available, using email auth');
      }
    };
    // Use setTimeout to not block initial render
    setTimeout(() => {
      fetchAuthConfig();
    }, 100);
  }, []);

  const setAuthData = (accessToken: string, refreshToken: string, userData: User) => {
    if (accessToken || refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      throw new Error('Neither refreshToken nor accessToken was returned.');
    }
  };

  const resetAuth = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData);
      // Try to fetch the patient's profile and merge into userData for UI
      try {
        const profile = await getPatientProfile();
        const merged = { ...userData, profile } as User;
        localStorage.setItem('userData', JSON.stringify(merged));
        setUser(merged);
      } catch (err) {
        // It's okay if profile doesn't exist yet; UI can prompt the user to create one
      }
    } catch (error) {
      resetAuth();
      throw new Error(error?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, role?: string) => {
    try {
      const response = await apiRegister(email, password, role);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData);
      // After registering, attempt to fetch any existing profile and attach it
      try {
        const profile = await getPatientProfile();
        const merged = { ...userData, profile } as User;
        localStorage.setItem('userData', JSON.stringify(merged));
        setUser(merged);
      } catch (err) {
        // ignore - newly registered users won't have a profile yet
      }
    } catch (error) {
      resetAuth();
      throw new Error(error?.message || 'Registration failed');
    }
  };

  const logout = () => {
    resetAuth();
    window.location.reload();
  };

  return (
      <AuthContext.Provider value={{
        user,
        isAuthenticated,
        authStrategy,
        authConfig,
        login,
        register,
        logout,
        setAuthData
      }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}