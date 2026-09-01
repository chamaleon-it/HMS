"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  Shield,
  Building2,
  Activity,
  Users,
  DatabaseBackup,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function ReceptionSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile data
  const {
    data: profileResponse,
    mutate: profileMutate,
    isLoading: profileLoading,
  } = useSWR<{ data: any; message: string }>("/users/profile");
  const profile = profileResponse?.data;

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hospital, setHospital] = useState("");
  const [address, setAddress] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhoneNumber(profile.phoneNumber || "");
      setHospital(profile.hospital || "");
      setAddress(profile.address || "");
    }
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
          hospital: hospital.trim(),
          address: address.trim(),
        }),
        {
          loading: "Updating profile...",
          success: "Profile updated successfully!",
          error: (err) =>
            err?.response?.data?.message || "Failed to update profile",
        }
      );
      await profileMutate();
    } catch (err) {
      console.error(err);
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
          success: "Password updated successfully!",
          error: (err) =>
            err?.response?.data?.message || "Failed to update password",
        }
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getInitials = (n: string) => {
    if (!n) return "RE";
    const p = n.trim().split(" ");
    return p.length === 1
      ? p[0].slice(0, 2).toUpperCase()
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "security", label: "Security", icon: Lock },
  ];

  return (
    <AppShell>
      <div className="p-5 flex flex-col gap-6 w-full min-h-[calc(100vh-67px)] text-slate-900">
        {/* Header */}
        <PharmacyHeader
          title="Settings"
          subtitle="Manage your reception profile, contact details, and account security"
        />

        {/* Top Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="group border border-slate-200 bg-white/80 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Desk Status
                </CardTitle>
                <p className="flex items-center gap-2 text-base font-bold text-slate-900">
                  Live & Syncing
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-(--color-synapse-light) ring-1 ring-purple-100">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-slate-500">
              Connected to front desk queue. Patient tokens and doctor appointments syncing.
            </CardContent>
          </Card>

          <Card className="group border border-slate-200 bg-white/80 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employee Roster
                </CardTitle>
                <p className="text-base font-bold text-slate-900">
                  Unified Staff Directory
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-(--color-synapse-light) ring-1 ring-purple-100">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-slate-500">
              Pharmacists, Technicians, and Therapists managed under Reception.
            </CardContent>
          </Card>

          <Card className="group border border-slate-200 bg-white/80 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Security & Backup
                </CardTitle>
                <p className="text-base font-bold text-slate-900">
                  Auto-Encrypted
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <DatabaseBackup className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-slate-500">
              Session secured with JWT. System backups available from top profile menu.
            </CardContent>
          </Card>
        </div>

        {/* Tab Selector */}
        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 w-full max-w-xs shadow-xs">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={cn(
                  "relative flex items-center justify-center gap-2 rounded-full px-5 py-2 transition will-change-transform cursor-pointer font-medium text-xs sm:text-sm flex-1 text-center",
                  active ? "text-white" : "text-slate-600 hover:text-slate-900"
                )}
                type="button"
              >
                {active && (
                  <motion.span
                    layoutId="reception-settings-tab-pill"
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

        {/* Tab Content: Profile */}
        {activeTab === "profile" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
            <Card className="border border-slate-200 bg-white/90 shadow-xs backdrop-blur-xs rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-(--color-synapse-light) ring-1 ring-purple-100">
                        <User className="h-5 w-5" />
                      </span>
                      Receptionist Profile
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Basic details used across appointment tokens, billing headers, and reception logs.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="rec-name"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Display Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="rec-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Reception Desk"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-(--color-synapse-light)"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="rec-email"
                        className="text-xs font-semibold text-slate-700"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="rec-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="reception@hospital.com"
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-(--color-synapse-light)"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="rec-phone"
                        className="text-xs font-semibold text-slate-700"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="rec-phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 9876543210"
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm font-mono focus-visible:ring-(--color-synapse-light)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="rec-hosp"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Hospital / Clinic Name
                    </Label>
                    <Input
                      id="rec-hosp"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="e.g. Synapse Multi-Speciality Clinic"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-(--color-synapse-light)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="rec-addr"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Address / Location
                    </Label>
                    <Textarea
                      id="rec-addr"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Hospital address or desk notes..."
                      rows={3}
                      className="rounded-xl border-slate-200 bg-slate-50 text-sm resize-none focus-visible:ring-(--color-synapse-light)"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="gap-2 rounded-xl bg-(--color-synapse-light) hover:opacity-90 text-white font-bold px-5 cursor-pointer shadow-sm"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Profile Overview Card */}
            <div className="space-y-4">
              <Card className="border border-slate-200 bg-white/90 shadow-xs backdrop-blur-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-(--color-synapse-light)" />
                    Account Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-slate-600">
                  <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <Avatar className="h-12 w-12 rounded-xl bg-linear-to-tr from-(--color-synapse-dark) to-(--color-synapse-light) text-white font-bold text-sm">
                      <AvatarFallback className="bg-transparent text-white">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {name || "Reception Desk"}
                      </h4>
                      <p className="text-slate-500 text-[11px]">
                        {email || "reception@synapsehms.com"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Role</span>
                      <span className="font-semibold text-slate-800">
                        Receptionist
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Permissions</span>
                      <span className="font-semibold text-slate-800">
                        Front Desk, Roster, Billing
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Account Status</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                        Active
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab Content: Security */}
        {activeTab === "security" && (
          <div className="max-w-2xl">
            <Card className="border border-slate-200 bg-white/90 shadow-xs backdrop-blur-xs rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-(--color-synapse-light) ring-1 ring-purple-100">
                    <Lock className="h-5 w-5" />
                  </span>
                  Password & Security
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Update your account password and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleChangePassword}
                  className="space-y-4 text-sm"
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cur-pass"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Current Password <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="cur-pass"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-(--color-synapse-light)"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="new-pass"
                      className="text-xs font-semibold text-slate-700"
                    >
                      New Password <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="new-pass"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-(--color-synapse-light)"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="conf-pass"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Confirm New Password{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="conf-pass"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-(--color-synapse-light)"
                      required
                    />
                  </div>



                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                    <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-(--color-synapse-light)" />
                      Security Tips
                    </p>
                    <ul className="text-[11px] text-slate-500 space-y-0.5 list-disc pl-4">
                      <li>
                        Use 8+ characters with mixed case letters, numbers, and
                        symbols.
                      </li>
                      <li>Never share reception credentials with unauthorized staff.</li>
                      <li>Log out at the end of every desk shift.</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="gap-2 rounded-xl bg-(--color-synapse-light) hover:opacity-90 text-white font-bold px-5 cursor-pointer shadow-sm"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
