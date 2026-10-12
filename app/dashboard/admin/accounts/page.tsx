"use client";

import { useState, type FormEvent } from "react";
import AppShell from "@/components/layout/app-shell";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminAccountsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Pharmacy" | "Lab">("Pharmacy");
  const [saving, setSaving] = useState(false);

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/admin/accounts", {
        name,
        email,
        password,
        role,
      });
      toast.success(data.message);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not create account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="min-h-[calc(100vh-67px)] bg-slate-50/60 p-5 sm:p-8">
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">User Accounts</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create Pharmacy and Lab sign-in accounts. Manage doctor profiles
              from Doctor Management.
            </p>
          </div>

          <form onSubmit={createAccount} className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Name
              <input
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Account type
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as "Pharmacy" | "Lab")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Pharmacy">Pharmacy</option>
                <option value="Lab">Lab</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Email
              <input
                required
                type="email"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Temporary password
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating…" : `Create ${role} Account`}
              </button>
            </div>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
