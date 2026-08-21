"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if configured
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            We apologize for the inconvenience. An unexpected error has occurred
            in the application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 bg-[#06b6d4] text-white font-medium rounded-lg hover:brightness-110 transition-all active:scale-95 shadow-sm"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all active:scale-95 shadow-sm"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
