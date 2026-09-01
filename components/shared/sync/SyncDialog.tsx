"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Server,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  Activity,
  Check,
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fDateandTime } from "@/lib/fDateAndTime";

interface SyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SyncResult {
  success: boolean;
  message: string;
  targetHost: string;
  durationMs: number;
  totalCollections: number;
  totalDocuments: number;
  collections: Array<{ name: string; count: number; error?: string }>;
  syncedAt: string;
}

export function SyncDialog({ open, onOpenChange }: SyncDialogProps) {
  const { data: statusData, mutate: refreshStatus, isLoading: isLoadingStatus } = useSWR<{
    data: {
      isSyncing: boolean;
      lastSync: any;
      atlasConfigured: boolean;
      targetHost: string;
    };
  }>(open ? "/sync/status" : null, { refreshInterval: 5000 });

  const [syncing, setSyncing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [connStatus, setConnStatus] = useState<"idle" | "success" | "error">("idle");
  const [connMessage, setConnMessage] = useState("");

  const status = statusData?.data;
  const lastSync = status?.lastSync;

  useEffect(() => {
    if (open) {
      setSyncResult(null);
      setConnStatus("idle");
      setConnMessage("");
    }
  }, [open]);

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setConnStatus("idle");
      const res = await api.post("/sync/test-connection");
      setConnStatus("success");
      setConnMessage(res.data?.message || "Connected to MongoDB Atlas");
      toast.success("MongoDB Atlas connection verified!");
    } catch (err: any) {
      setConnStatus("error");
      const errMsg = err.response?.data?.message || err.message || "Connection failed";
      setConnMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleStartSync = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await api.post<{ data: SyncResult; message: string }>("/sync/atlas");
      if (res.data?.data) {
        setSyncResult(res.data.data);
        toast.success(
          `Sync complete! ${res.data.data.totalDocuments.toLocaleString()} documents synchronized.`
        );
      }
      refreshStatus();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "Failed to synchronize database";
      toast.error(errMsg);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">
        {/* Header with gradient backdrop */}
        <div className="relative bg-linear-to-r from-slate-900 via-synapse-dark to-slate-950 p-6 text-white overflow-hidden rounded-t-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <CloudUpload size={140} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-synapse-light/20 flex items-center justify-center border border-synapse-light/30 backdrop-blur-md">
              <CloudUpload className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Database Cloud Sync
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-xs mt-0.5">
                Synchronize local MongoDB community database to remote MongoDB Atlas
              </DialogDescription>
            </div>
          </div>

          {/* Connection Bridge Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-white/10 items-center">
            {/* Local DB */}
            <div className="sm:col-span-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Database className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                  Source Database
                </div>
                <div className="text-xs font-bold text-white truncate">Local Mongo DB</div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Server
                </div>
              </div>
            </div>

            {/* Sync Arrow */}
            <div className="sm:col-span-1 flex justify-center text-slate-400">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                {syncing ? (
                  <RefreshCw className="h-4 w-4 text-synapse-light animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-white" />
                )}
              </div>
            </div>

            {/* Atlas DB */}
            <div className="sm:col-span-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-500/30">
                <Server className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
                  Target Destination
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {status?.targetHost || "MongoDB Atlas"}
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Cloud Replica
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Status & Last Synced Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-synapse-light/10 text-(--color-synapse-light) flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Last Successful Sync</div>
                <div className="text-sm font-semibold text-slate-800">
                  {lastSync?.completedAt ? (
                    fDateandTime(lastSync.completedAt)
                  ) : (
                    <span className="text-slate-400 italic">No previous sync recorded</span>
                  )}
                </div>
                {lastSync?.user?.name && (
                  <div className="text-[11px] text-slate-500">
                    Triggered by: {lastSync.user.name} ({lastSync.user.role || "Staff"})
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testingConnection || syncing}
              className="text-xs shrink-0 cursor-pointer h-9 px-3 rounded-lg border-slate-300 hover:bg-slate-100"
            >
              {testingConnection ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Testing...
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5 mr-1.5 text-slate-600" />
                  Test Atlas Connection
                </>
              )}
            </Button>
          </div>

          {/* Connection Test Banner if any */}
          {connStatus === "success" && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{connMessage}</span>
            </div>
          )}

          {connStatus === "error" && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{connMessage}</span>
            </div>
          )}

          {/* Sync Results View (When sync completes) */}
          {syncResult && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-900">
                      Sync Completed Successfully!
                    </div>
                    <div className="text-xs text-emerald-700 mt-0.5">
                      {syncResult.totalDocuments.toLocaleString()} documents across{" "}
                      {syncResult.totalCollections} collections synchronized in{" "}
                      {(syncResult.durationMs / 1000).toFixed(2)}s.
                    </div>
                  </div>
                </div>
              </div>

              {/* Collections breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-500" /> Collection Breakdown
                  </span>
                  <span>Items Synced</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {syncResult.collections
                    .filter((c) => c.count > 0 || c.error)
                    .map((col) => (
                      <div
                        key={col.name}
                        className="px-4 py-2 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                      >
                        <span className="font-medium text-slate-800 capitalize flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          {col.name}
                        </span>
                        {col.error ? (
                          <span className="text-rose-600 font-semibold">{col.error}</span>
                        ) : (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {col.count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Sync In-Progress Banner */}
          {syncing && (
            <div className="p-6 rounded-2xl bg-linear-to-r from-violet-50 via-purple-50 to-indigo-50 border border-purple-200 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-(--color-synapse-light) animate-spin" />
              </div>
              <div>
                <div className="text-sm font-bold text-purple-950">
                  Synchronizing Database with MongoDB Atlas...
                </div>
                <div className="text-xs text-purple-700 mt-1 max-w-md">
                  Reading local collections and securely upserting all records to the cloud replica.
                  Please do not close this window.
                </div>
              </div>
            </div>
          )}

          {/* Description & Action */}
          {!syncing && !syncResult && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 leading-relaxed space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5 text-blue-600" /> How Cloud Sync works:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>
                  All patients, appointments, billing invoices, pharmacy records, lab results, and
                  staff data from local MongoDB will be mirrored to MongoDB Atlas.
                </li>
                <li>
                  Synchronization is <strong>safe and idempotent</strong>: it performs atomic upserts
                  by ID, ensuring no duplicate entries are generated.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between rounded-b-2xl">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={syncing}
            className="text-xs cursor-pointer text-slate-600 hover:text-slate-900"
          >
            {syncResult ? "Close" : "Cancel"}
          </Button>

          <Button
            onClick={handleStartSync}
            disabled={syncing}
            className="rounded-xl px-5 bg-(--color-synapse-light) hover:bg-(--color-synapse-dark) text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer flex items-center gap-2"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing Data...
              </>
            ) : (
              <>
                <CloudUpload className="h-4 w-4" />
                {syncResult ? "Sync Again" : "Sync All Data to Atlas"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
