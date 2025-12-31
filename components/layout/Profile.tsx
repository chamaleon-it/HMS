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
import { LogOut, RefreshCw, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/auth/context/auth-context";
import configuration from "@/config/configuration";





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
                {user?.specialization}
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
              <Link
                href={`/dashboard/${user?.role === "Doctor" && "doctor" || user?.role === "Pharmacy" && "pharmacy" || user?.role === "Pharmacy Wholesaler" && "pharmacy-wholesaler" || user?.role === "Lab" && "lab" || "doctor"}/settings`}
                className="flex items-center gap-1"
              >
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3" asChild>
              <Button
                variant={"ghost"}
                className="flex gap-2 items-center  w-full text-left justify-start py-5"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync</Button>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
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
