"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AccountantSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const { data: profileResponse, mutate: profileMutate } = useSWR<{
    data?: {
      name?: string;
      email?: string;
      phoneNumber?: string;
    };
  }>("/users/profile");
  const profile = profileResponse?.data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setEmail(profile.email || "");
    setPhoneNumber(profile.phoneNumber || "");
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSavingProfile(true);
    try {
      await toast.promise(
        api.patch("/users", {
          name: name.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
        {
          loading: "Updating profile...",
          success: "Profile updated",
          error: (err) => err?.response?.data?.message || "Failed to update profile",
        },
      );
      await profileMutate();
    } catch {
      // toast already reported the error
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await toast.promise(
        api.patch("/users/update_password", {
          currentPassword,
          password: newPassword,
          confirmPassword,
        }),
        {
          loading: "Updating password...",
          success: "Password updated",
          error: (err) => err?.response?.data?.message || "Failed to update password",
        },
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // toast already reported the error
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "security" as const, label: "Security", icon: Lock },
  ];

  return (
    <AppShell>
      <div className="p-6 flex flex-col gap-6 w-full min-h-[calc(100vh-67px)] text-slate-900">
        <AdminHeader
          title="Settings"
          subtitle="Update your profile and password"
        />

        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 w-full max-w-xs shadow-xs">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "relative flex items-center justify-center gap-2 rounded-full px-5 py-2 transition cursor-pointer font-medium text-xs sm:text-sm flex-1",
                  active ? "text-white" : "text-slate-600 hover:text-slate-900",
                )}
                type="button"
              >
                {active && (
                  <motion.span
                    layoutId="accountant-settings-tab-pill"
                    className="absolute inset-0 rounded-full bg-(--color-synapse-light)"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  <Icon size={15} /> {label}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "profile" && (
          <Card className="border border-slate-200 bg-white/90 shadow-xs rounded-2xl max-w-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Profile</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Name and contact details shown on your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="acc-name">Name</Label>
                  <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-email">Email</Label>
                  <Input id="acc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-phone">Phone</Label>
                  <Input id="acc-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save profile
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <Card className="border border-slate-200 bg-white/90 shadow-xs rounded-2xl max-w-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Password</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Use at least 6 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="acc-current">Current password</Label>
                  <Input id="acc-current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-new">New password</Label>
                  <Input id="acc-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-confirm">Confirm password</Label>
                  <Input id="acc-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
