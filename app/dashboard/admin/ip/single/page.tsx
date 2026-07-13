import { Suspense } from "react";
import AdminIPSingleClient from "./client";

export default function Page() {
  return (
    <Suspense>
      <AdminIPSingleClient />
    </Suspense>
  );
}
