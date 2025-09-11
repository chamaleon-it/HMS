"use client"

import React, { useEffect } from "react";
import { Bell, Search, Plus } from "lucide-react";

/**
 * Modern Header (Minimal & Attractive)
 * - Clean glass look, no subheader
 * - Fixes JSX parsing error by removing stray escapes and using valid class strings
 * - Adds lightweight self-tests to verify mount and key elements
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md">
      {/* Background glow (subtle) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28">
        <div className="mx-auto h-full w-full max-w-screen-2xl opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_0%,#000_0%,transparent_70%)]">
          <div className="h-full w-full bg-[radial-gradient(1000px_200px_at_15%_-20%,#818cf8_12%,transparent_60%),radial-gradient(1000px_200px_at_85%_-20%,#e879f9_12%,transparent_60%)]" />
        </div>
      </div>

      {/* Top bar */}
      <div className="flex h-20 items-center justify-between border-b border-slate-200/70 px-4 sm:px-8 bg-white/85">
        {/* Brand */}
        <div className="flex items-center gap-3 pr-2" data-testid="brand">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-md">
            D
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-base font-semibold text-slate-800">DocHub</div>
            <div className="text-xs text-slate-500">Clinic OS</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients or appointments…"
              data-testid="search-input"
              className="w-full rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-24 py-2.5 text-sm shadow-sm outline-none placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-[10px] text-slate-500">⌘K</kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="ml-4 flex items-center gap-3 sm:gap-4" data-testid="actions">
          <button className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md">
            <Plus className="h-4 w-4" /> New Appointment
          </button>
          <button className="relative rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm transition hover:bg-slate-50" aria-label="Notifications">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-2.5 py-1.5 shadow-sm">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="User"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
            />
            <div className="hidden md:block text-left leading-tight">
              <p className="text-sm font-medium text-slate-800">Dr. Nadir Sha</p>
              <p className="text-[11px] text-slate-500">Cardiologist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider (slimmer) */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-600/15 via-fuchsia-600/15 to-indigo-600/15" data-testid="header-divider" />
    </header>
  );
}

/**
 * Smoke Tests (manual):
 * 1) Component mounts without JSX errors (no console errors).
 * 2) <header> renders exactly once; search input present; action buttons visible.
 * 3) Responsive check: avatar label hides under md; New Appointment hides under sm.
 */
export function HeaderSmokeTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="p-6 text-slate-700">If you can see this below the header, mount passed.</main>
    </div>
  );
}

/**
 * Self-test (runtime checks in browser console)
 * Asserts key elements exist to catch regressions quickly without a test runner.
 */
export function HeaderSelfTest() {
  useEffect(() => {
    try {
      const header = document.querySelector("header");
      const search = document.querySelector('[data-testid="search-input"]');
      const actions = document.querySelector('[data-testid="actions"]');
      const divider = document.querySelector('[data-testid="header-divider"]');
      console.assert(!!header, "Header should render");
      console.assert(!!search, "Search input should render");
      console.assert(!!actions, "Actions group should render");
      console.assert(!!divider, "Bottom divider should render");
      // Extra: ensure no unintended backslashes exist in class strings
      const badEscapes = Array.from(document.querySelectorAll("[class]"))
        .some(el => /\\"/.test(el.getAttribute("class") || ""));
      console.assert(!badEscapes, "No stray escapes should appear in class attributes");
    } catch (e) {
      console.error("HeaderSelfTest error", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="p-6 text-slate-700">Open console to see self-test assertions.</main>
    </div>
  );
}