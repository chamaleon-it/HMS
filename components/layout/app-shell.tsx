"use client";

import React, { useState } from "react";
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
      {/* <Sidebar collapsed={collapsed} /> */}
      <div className="min-h-screen flex-1 min-w-0 print:min-h-auto">
        <Header />
        <div className="min-h-[calc(100vh-80px)] print:min-h-auto">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}
