"use client";

import React from "react";
import Header from "./topbar";
import Footer from "./Footer";
import { useAuth } from "@/auth/context/auth-context";
import { redirect, usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
};

const ROLE_PREFIX: Record<string, string> = {
  Doctor: "/dashboard/doctor",
  Pharmacy: "/dashboard/pharmacy",
  Lab: "/dashboard/lab",
  Admin: "/dashboard/admin",
  "Super Admin": "/dashboard/admin",
};

function roleHome(role?: string | null) {
  if (!role) return "/";
  return ROLE_PREFIX[role] || "/";
}

function roleMayAccess(role: string | undefined | null, pathname: string) {
  if (!role) return false;
  if (role === "Admin" || role === "Super Admin") {
    // Admins may open any clinical dashboard for oversight.
    return pathname.startsWith("/dashboard/");
  }
  const prefix = ROLE_PREFIX[role];
  if (!prefix) return false;
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const pathname = usePathname() || "";

  if (loading) return null;

  if (!isAuthenticated) {
    redirect("/");
  }

  if (pathname.startsWith("/dashboard/") && !roleMayAccess(user?.role, pathname)) {
    redirect(roleHome(user?.role));
  }

  return (
    <div className="flex">
      <div className="min-h-screen flex-1 min-w-0 print:min-h-auto">
        <Header />
        <div className="min-h-[calc(100vh-67px)] print:min-h-auto">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}
