import React, { Suspense } from "react";
import IPDetailsClient from "./client";

export default function IPDetailsPage() {
  return (
    <Suspense fallback={<div className="p-5">Loading patient details...</div>}>
      <IPDetailsClient />
    </Suspense>
  );
}
