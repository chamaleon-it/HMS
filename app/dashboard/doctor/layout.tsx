"use client";

import RequireRole from "@/components/auth/require-role";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole allowed={["Doctor", "Admin"]}>{children}</RequireRole>
  );
}
