"use client";

import { useAuth } from "@/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.replace("/");
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard
        switch (user.role) {
          case "Admin":
            router.replace("/dashboard/admin");
            break;
          case "Pharmacy":
            router.replace("/dashboard/pharmacy");
            break;
          case "Reception":
            router.replace("/dashboard/reception");
            break;
          case "Lab":
            router.replace("/dashboard/lab");
            break;
          case "Doctor":
            router.replace("/dashboard/doctor");
            break;
          default:
            router.replace("/");
        }
      } else {
        setAuthorized(true);
      }
    }
  }, [isAuthenticated, user, loading, router, allowedRoles]);

  if (!authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
