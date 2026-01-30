import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArchiveRestore, DatabaseBackup, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/auth/context/auth-context";
import configuration from "@/config/configuration";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useSWR from "swr";
import { fDateandTime } from "@/lib/fDateAndTime";





export default function DoctorProfile() {
  const { user, logout } = useAuth();

  const [isNetworkLost, setIsNetworkLost] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsNetworkLost(false);
    const handleOffline = () => setIsNetworkLost(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data, mutate } = useSWR("/backup/list")


  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-12 rounded-xl gap-3 pl-2 pr-3 border border-slate-200 hover:border-slate-300"
          >
            <span className="relative inline-flex">
              <div className="h-10 w-10 rounded-xl grid place-items-center">
                {/* {user?.name.slice(0, 1).toUpperCase()} */}
                <img src="/logo.png" alt="" className="h-10 w-10" />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white 
    ${isNetworkLost ? 'bg-orange-500' : 'bg-emerald-500'}
  `}
              />
            </span>
            <span className="text-left">
              <span className="block text-[15px] font-semibold leading-tight">
                {user?.role === "Doctor" && "Dr."} {user?.name}
              </span>
              <span className="block text-xs text-slate-500 -mt-0.5">
                {user?.specialization ?? user?.role}
              </span>
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[280px] rounded-xl p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white">
                {user?.profilePic && (
                  <AvatarImage
                    src={configuration().backendUrl + user?.profilePic}
                    alt={user?.name}
                  />
                )}
                <AvatarFallback>
                  {user?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="text-sm font-semibold">
                  {user?.role === "Doctor" && "Dr."} {user?.name}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.specialization}
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Settings & logout */}
          <DropdownMenuGroup>
            <DropdownMenuItem className="px-3" asChild>
              <Button asChild variant={"ghost"} className="w-full text-left justify-start">

                <Link
                  href={`/dashboard/${user?.role === "Doctor" && "doctor" || user?.role === "Pharmacy" && "pharmacy" || user?.role === "Pharmacy Wholesaler" && "pharmacy-wholesaler" || user?.role === "Lab" && "lab" || "doctor"}/settings`}
                  className="flex items-center gap-1"
                >
                  <Settings className="mr-1 h-4 w-4" /> Settings
                </Link>
              </Button>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="px-3" asChild>
              <Button variant={"ghost"} className="w-full text-left justify-start" onClick={async () => {
                try {

                  await toast.promise(api.post("/backup/create"), {
                    loading: "Creating Backup...",
                    success: "Backup Created Successfully",
                    error: "Failed to Create Backup"
                  })
                  await mutate();
                } catch (error) {
                  console.log(error)
                }
              }}>
                <div className="flex justify-between w-full items-center">

                  <div className="flex items-center gap-1">
                    <DatabaseBackup className="mr-1 h-4 w-4" />
                    Backup
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 italic">
                      {fDateandTime(data?.latestBackup?.replace(/T(\d+)-(\d+)-(\d+)/, "T$1:$2:$3"))}
                    </span>

                    {data?.latestBackup && (() => {
                      const dateStr = data.latestBackup.replace(/T(\d+)-(\d+)-(\d+)/, "T$1:$2:$3");
                      const backupDate = new Date(dateStr);
                      const today = new Date();
                      const diffTime = Math.abs(today.getTime() - backupDate.getTime());
                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                      return (
                        <>
                          {diffDays >= 1 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200">
                              {diffDays} {diffDays === 1 ? "day" : "days"} ago
                            </span>
                          )}

                        </>
                      );
                    })()}

                  </div>

                </div>
              </Button>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* <DropdownMenuItem className="px-3" asChild>
              <Button variant={"ghost"} className="w-full text-left justify-start" onClick={async () => {
                try {

                  await toast.promise(api.post("/backup/restore_latest"), {
                    loading: "Restoring Backup...",
                    success: "Backup Restored Successfully",
                    error: "Failed to Restore Backup"
                  })
                } catch (error) {
                  console.log(error)
                }
              }}>

                <ArchiveRestore className="mr-2 h-4 w-4" />
                Restore Latest Backup

              </Button>
            </DropdownMenuItem>

            <DropdownMenuSeparator /> */}

            <DropdownMenuItem className="px-3" asChild>
              <Button
                onClick={() => {
                  logout();
                }}
                variant={"ghost"}
                className="flex gap-2 items-center text-rose-600 hover:text-rose-700 w-full text-left justify-start py-5"
              >
                <LogOut className="h-4 w-4 text-rose-600 hover:text-rose-700" />{" "}
                Log out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
