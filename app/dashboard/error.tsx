"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-4 bg-slate-50/50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Something went wrong!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We encountered an unexpected error. You can try recovering by clicking the button below, or refresh the page.
        </p>
      </div>
      <div className="flex gap-3 mt-4">
        <Button
          onClick={() => reset()}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/dashboard'}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
