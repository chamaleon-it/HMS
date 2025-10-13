"use client";
import { useAuth } from "@/auth/context/auth-context";
import {
  LayoutDashboard,
  FlaskConical,
  Settings,
  LogOut,
  CalendarClock,
  Users2,
  Stethoscope,
  CreditCard,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const {logout,user} = useAuth()


  const items = user?.role === "Doctor" && [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      link: "/dashboard/doctor",
    },
    {
      key: "appointments",
      label: "Appointments",
      icon: CalendarClock,
      badge: "12",
      link: "/dashboard/doctor/appointments",
    },
    {
      key: "patients",
      label: "Patients",
      icon: Users2,
      link: "/dashboard/doctor/patients",
    },
    {
      key: "lab-results",
      label: "Lab Results",
      icon: FlaskConical,
      link: "/dashboard/doctor/lab-report",
    },
    {
      key: "billing",
      label: "Billing",
      icon: CreditCard,
      link: "/dashboard/doctor/billing",
    },
  ]
  ||
  user?.role === "Pharmacy" && [
       {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      link: "/dashboard/pharmacy",
    },
  ] ||
  []
  ;

  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  return (
    <aside
      className={
        "sticky top-0 h-screen transition-all duration-300 flex flex-col border-r border-slate-200/80 " +
        (collapsed ? "w-20" : "w-72")
      }
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Brand */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-md">
          D
        </div>
        {!collapsed && (
          <div>
            <div className="text-lg font-semibold text-slate-800 leading-tight">
              DocHub
            </div>
            <div className="text-xs text-slate-500">Clinic OS</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="ml-auto rounded-xl px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm border border-slate-200 cursor-pointer"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Nav list */}
      <nav className="mt-4 px-3 space-y-1 overflow-y-auto">
        {items.map((it) => (
          <NavItem
            key={it.key}
            active={pathname === it.link}
            collapsed={collapsed}
            icon={it.icon}
            label={it.label}
            badge={it.badge}
            link={it.link}
          />
        ))}

        {/* Divider */}
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <NavItem
          active={pathname === "/dashboard/doctor/settings"}
          collapsed={collapsed}
          icon={Settings}
          label="Settings"
          link={"/dashboard/doctor/settings"}
        />
      </nav>

      {/* Account card */}
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-400 grid place-items-center text-white font-medium">
            {user?.name.slice(0,1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-xs font-medium text-slate-800">{user?.role === "Doctor" && "Dr."} {user?.name}</div>
              <div className="text-xs text-slate-500">{user?.role}</div>
            </div>
          )}
          <button
          onClick={()=>{
            logout()
          }}
            className="ml-auto rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  active,
  collapsed,
  icon: Icon,
  label,

  badge,
  link,
}: {
  active?: boolean;
  collapsed?: boolean;
  icon: React.ElementType;
  label: string;

  badge?: string;
  link?: string;
}) {
  return (
    <Link
      href={link || "/"}
      className={
        "group w-full flex items-center gap-3 rounded-2xl px-3 py-3 transition-all border " +
        (active
          ? "border-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md"
          : "border-transparent hover:border-slate-200 hover:bg-white text-slate-700")
      }
    >
      <span
        className={
          "grid h-9 w-9 place-items-center rounded-xl transition-all " +
          (active
            ? "bg-white/20 text-white"
            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200")
        }
      >
        <Icon className="h-5 w-5" />
      </span>
      {!collapsed && (
        <>
          <span className="text-left text-sm font-medium">{label}</span>
          {badge && (
            <span
              className={
                "ml-auto inline-flex items-center justify-center rounded-full text-xs px-2 py-0.5 " +
                (active
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-700")
              }
            >
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
