"use client";

import api from "@/lib/axios";
import React from "react";
import { SWRConfig } from "swr";

export default function SWRProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        fetcher: async (url: string) => {
          const res = await api.get(url);
          return res.data;
        },
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 3000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: false,
        refreshInterval: 0, // set >0 if you need periodic refresh
        suspense: false,
        onError: (err) => {
          console.error("SWR error:", err.message);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
