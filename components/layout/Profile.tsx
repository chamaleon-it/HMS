import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, LogOut, Settings, Building2, User } from "lucide-react";
import Link from "next/link";

/**
 * DoctorProfileDropdown — Minimal clean version
 * Sections:
 * 1) Header (avatar, name, role)
 * 2) Status (Available / Consulting / Away / DND)
 * 3) Clinic switcher
 * 4) Settings & Logout
 */

const STATUSES = ["Available", "Consulting", "Away", "Do Not Disturb"] as const;

type Status = typeof STATUSES[number];

export default function DoctorProfile() {
  const [status, setStatus] = React.useState<Status>("Available");

  const dot = (s: Status) =>
    ({
      Available: "bg-emerald-500",
      Consulting: "bg-sky-500",
      Away: "bg-amber-500",
      "Do Not Disturb": "bg-rose-500",
    }[s]);

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-12 rounded-xl gap-3 pl-2 pr-3 border border-slate-200 hover:border-slate-300"
          >
            <span className="relative inline-flex">
              <Avatar className="h-9 w-9 ring-1 ring-slate-100">
                <AvatarImage src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200" alt="Dr. Nadir Sha" />
                <AvatarFallback>NS</AvatarFallback>
              </Avatar>
              <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white ${dot(status)}`} />
            </span>
            <span className="text-left">
              <span className="block text-[15px] font-semibold leading-tight">Dr. Nadir Sha</span>
              <span className="block text-xs text-slate-500 -mt-0.5">Cardiologist</span>
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-[280px] rounded-xl p-0 overflow-hidden">
          {/* Header */}
          <div className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white">
                <AvatarImage src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200" alt="Dr. Nadir Sha" />
                <AvatarFallback>NS</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Dr. Nadir Sha</div>
                <div className="text-xs text-slate-500">Cardiologist</div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Status */}
          <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[11px] text-slate-500">Status</DropdownMenuLabel>
          <DropdownMenuGroup>
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => setStatus(s)} className="px-3">
                <span className={`h-2.5 w-2.5 rounded-full mr-2 ${dot(s)}`} /> {s}
                {status === s && <span className="ml-auto text-[11px] text-slate-500">Active</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Clinic */}
          <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[11px] text-slate-500">Clinic</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-3">
              <Building2 className="mr-2 h-4 w-4" /> Nilambur Heart Center
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" /> Nilambur Heart Center
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" /> Calicut Cardio Clinic
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" /> Malappuram Medicals
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Settings & logout */}
          <DropdownMenuGroup>
            <DropdownMenuItem className="px-3">
              <Settings className="mr-2 h-4 w-4" /> Settings
              <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3">
              <User className="mr-2 h-4 w-4" /> View profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="px-3 text-rose-600 focus:text-rose-700">
              <Link href={"/"} className="flex gap-2 items-center">
              <LogOut className="h-4 w-4" /> Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}