"use client";

import type React from "react";
import { Sidebar } from "./sidebar";
import Header from "./topbar";
import Footer from "./Footer";
import { useAuth } from "@/auth/context/auth-context";
import { redirect } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
