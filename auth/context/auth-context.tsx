"use client";
import api, { tokenStore } from "@/lib/axios";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePic?: string | null;
  specialization?: string | null;
};

type AuthState = {
  user: User | null;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialToken?: string | null;
}) {
  const [state, setState] = useState<AuthState>({ user: initialUser });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setUser = useCallback(
    (user: User | null) => {
      setState({ user });
    },
    [state]
  );

  const logout = useCallback(() => {
    setState({ user: null });
    tokenStore.clear();
  }, []);

  const getUser = useCallback(async () => {
    try {
      const { data } = await api.get("/users/profile");
      const { _id, name, email, role, profilePic, specialization } = data?.data;
      setUser({ _id, email, name, role, profilePic, specialization });
    } catch (error) {
      console.log(error);
      setLoading(false);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: !!state.user,
      setUser,
      logout,
      loading,
    }),
    [state.user, setUser, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
