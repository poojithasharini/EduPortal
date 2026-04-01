import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "student" | "professor";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: User[] = [
  { id: "1", name: "Alex Johnson", email: "student@demo.com", role: "student" },
  { id: "2", name: "Dr. Sarah Williams", email: "professor@demo.com", role: "professor" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("portal_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = async (email: string, _password: string) => {
    const found = MOCK_USERS.find((u) => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem("portal_user", JSON.stringify(found));
    } else {
      // Default to student for any email
      const newUser: User = { id: "3", name: "Demo User", email, role: "student" };
      setUser(newUser);
      localStorage.setItem("portal_user", JSON.stringify(newUser));
    }
  };

  const register = async (name: string, email: string, _password: string, role: UserRole) => {
    const newUser: User = { id: Date.now().toString(), name, email, role };
    setUser(newUser);
    localStorage.setItem("portal_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("portal_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
