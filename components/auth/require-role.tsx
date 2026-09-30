"use client";

import { useAuth } from "@/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROLE_HOME: Record<string, string> = {
  Admin: "/dashboard/admin",
  Doctor: "/dashboard/doctor",
  Pharmacy: "/dashboard/pharmacy",
  "Pharmacy Wholesaler": "/dashboard/pharmacy",
  Lab: "/dashboard/lab",
  Reception: "/dashboard/reception",
  Accountant: "/dashboard/accountant",
};

type RequireRoleProps = {
  allowed: string[];
  children: React.ReactNode;
};

/**
 * Client-side role gate for dashboard segments.
 * Static export cannot enforce auth at the edge; this blocks wrong-role UI navigation.
 */
export default function RequireRole({ allowed, children }: RequireRoleProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    const role = user?.role;
    if (role && !allowed.includes(role)) {
      router.replace(ROLE_HOME[role] || "/");
    }
  }, [loading, isAuthenticated, user?.role, allowed, router]);

  if (loading || !isAuthenticated) return null;
  if (user?.role && !allowed.includes(user.role)) return null;

  return <>{children}</>;
}
