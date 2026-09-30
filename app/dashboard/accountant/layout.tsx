"use client";

import RequireRole from "@/components/auth/require-role";

export default function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole allowed={["Accountant", "Admin"]}>{children}</RequireRole>;
}
