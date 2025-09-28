import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
  role: UserRole;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);

  const login = (username: string, password: string) => {
    // This is a simple example - in a real app, you'd verify credentials with a backend
    if (username === "admin" && password === "admin") {
      setRole("admin");
      return true;
    } else if (username === "user" && password === "user") {
      setRole("user");
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
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