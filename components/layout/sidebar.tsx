"use client";
import {
  Receipt,
  Users,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  CalendarDays,
  FlaskConical,
  Settings,
  LogOut,
  LucideProps,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("dashboard");

  const NavItem = ({
    icon: Icon,
    label,
    keyName,
    path,
  }: {
    icon:ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    label: string;
    keyName: string;
    path?: string;
  }) => (
    <Link
      href={path || "/"}
      onClick={() => setActiveKey(keyName)}
      className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition ${
        activeKey === keyName
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-600"
      }`}
    >
      <Icon
        className={`w-4 h-4 ${
          activeKey === keyName
            ? "text-indigo-600"
            : "text-gray-400 group-hover:text-gray-600"
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  return (
    <aside
      className={`${
        collapsed ? "w-[68px]" : "w-64"
      } shrink-0 border-r bg-white flex flex-col transition-all duration-200`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">
            D
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold">DocHub</div>
              <div className="text-[10px] text-gray-500">Clinic OS</div>
            </div>
          )}
        </div>
        <Button
          size="icon"
          variant="outline"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="p-3 space-y-1">
        <NavItem icon={LayoutDashboard} label="Dashboard" keyName="dashboard" />
        <NavItem
          icon={CalendarDays}
          label="Appointments"
          keyName="appointments"
        />
        <NavItem icon={Users} label="Patients" keyName="patients" />
        <NavItem
          icon={FlaskConical}
          label="Lab Results"
          keyName="labs"
          path="/lab-report"
        />
        <NavItem icon={Receipt} label="Billing" keyName="billing" />
      </div>

      <div className="mt-auto p-3 border-t">
        <div
          className={`flex items-center gap-2 px-2 py-2 rounded-lg ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <img
            src="https://i.pravatar.cc/36"
            className="rounded-full w-9 h-9"
          />
          {!collapsed && (
            <div className="truncate">
              <div className="text-sm font-medium">Dr. Nadir Sha</div>
              <div className="text-xs text-gray-500">General Physician</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" className="w-full" size="sm">
            <Settings className="w-4 h-4 mr-1" /> {!collapsed && "Settings"}
          </Button>
          <Button variant="outline" size="icon">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
