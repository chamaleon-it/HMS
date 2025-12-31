"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { syncService, PendingAction } from "@/lib/sync.service";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

interface ConnectivityContextType {
    isOnline: boolean;
    isSyncing: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
    isOnline: true,
    isSyncing: false,
});

export const useConnectivity = () => useContext(ConnectivityContext);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success("Connection restored. Syncing data...");
            processSync();
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.error("You are offline. Changes will be saved locally.");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Initial check
        setIsOnline(navigator.onLine);
        if (navigator.onLine) {
            processSync();
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const processSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);

        try {
            const pending = await syncService.getPendingActions();
            if (pending.length === 0) return;

            const response = await api.post("/sync", pending);
            const results = response.data.results;

            let successCount = 0;
            let failureCount = 0;

            for (const result of results) {
                if (result.status === "success") {
                    await syncService.removePendingAction(result.id);
                    successCount++;
                } else {
                    console.error("Failed to sync action:", result.id, result.message);
                    failureCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully synced ${successCount} actions.`);
            }
            if (failureCount > 0) {
                toast.error(`Failed to sync ${failureCount} actions. They will be retried.`);
            }
        } catch (error) {
            console.error("Sync process failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const pullLatestData = async () => {
        // Implement pulling for major collections if needed
        // This could be expensive, maybe just refresh SWR?
    };

    return (
        <ConnectivityContext.Provider value={{ isOnline, isSyncing }}>
            {children}
        </ConnectivityContext.Provider>
    );
};
