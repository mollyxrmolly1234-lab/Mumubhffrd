import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  balance: string;
  referralCode: string;
  referralCount?: number;
  referralEarnings?: string;
}

interface AuthContextType {
  user: User | null;
  admin: { id: string; username: string } | null;
  login: (user: User) => void;
  loginAdmin: (admin: { id: string; username: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<{ id: string; username: string } | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {
        localStorage.removeItem("admin");
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const loginAdmin = (adminData: { id: string; username: string }) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    setLocation("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        login,
        loginAdmin,
        logout,
        isAuthenticated: !!user,
        isAdmin: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
