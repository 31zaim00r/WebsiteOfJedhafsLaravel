import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { api } from "@/lib/api";

// Simplified User interface to match Supabase for compatibility but lightweight
interface SimpleUser {
  id: string;
  email?: string;
  user_metadata: {
    name?: string;
    phone_number?: string;
  };
  can_upload?: boolean;
  app_metadata?: {
    provider?: string;
  };
  aud: string;
  created_at: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string, phoneNumber?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const response = await api.get("/user");
          const userData = response.data;
          setUser({
            id: userData.id.toString(),
            email: userData.email,
            user_metadata: {
              name: userData.name,
              phone_number: userData.phone_number,
            },
            can_upload: !!userData.can_upload,
            aud: "authenticated",
            created_at: userData.created_at,
          });
          setIsAdmin(userData.role === "admin");
        } catch (error) {
          console.error("Auth init error:", error);
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, name: string, phoneNumber?: string) => {
    try {
      const response = await api.post("/register", {
        email,
        password,
        name,
        phone_number: phoneNumber,
      });

      const { user: userData, role, access_token } = response.data;
      localStorage.setItem("auth_token", access_token);

      const newUser: SimpleUser = {
        id: userData.id.toString(),
        email: userData.email,
        user_metadata: { name: userData.name, phone_number: userData.phone_number },
        can_upload: !!userData.can_upload,
        aud: "authenticated",
        created_at: userData.created_at,
      };

      setUser(newUser);
      setIsAdmin(role === "admin");
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message || "حدث خطأ أثناء إنشاء الحساب" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });

      const { user: userData, role, access_token } = response.data;
      localStorage.setItem("auth_token", access_token);

      const loggedUser: SimpleUser = {
        id: userData.id.toString(),
        email: userData.email,
        user_metadata: { name: userData.name, phone_number: userData.phone_number },
        can_upload: !!userData.can_upload,
        aud: "authenticated",
        created_at: userData.created_at,
      };

      setUser(loggedUser);
      setIsAdmin(role === "admin");
      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.message || "بيانات الاعتماد غير صحيحة";
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user: user as any, session, isLoading, isAdmin, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
