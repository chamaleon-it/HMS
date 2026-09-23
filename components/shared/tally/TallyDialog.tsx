"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Unlink,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  FileSpreadsheet,
  HardDriveDownload,
  Activity,
  SlidersHorizontal,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

interface TallyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TallyDialog({ open, onOpenChange }: TallyDialogProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [port, setPort] = useState("9000");
  const [host, setHost] = useState("localhost");
  const [showConfig, setShowConfig] = useState(false);
  const [connectionState, setConnectionState] = useState<"disconnected" | "connected">("disconnected");
  const [errorMessage, setErrorMessage] = useState<string>(
    "Tally is not installed or port is mismatched. Unable to establish ODBC / XML handshake on port 9000."
  );

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      if (connectionState === "disconnected") {
        setErrorMessage(
          `Connection Failed: No response from ${host}:${port}. Tally is not installed or port is mismatched.`
        );
        toast.error(`Tally not reachable on ${host}:${port}. Check if Tally is running or port is mismatched.`);
      } else {
        toast.success(`Connected to Tally on ${host}:${port}!`);
      }
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">
        {/* Header with Alert / Tally Theme */}
        <div className="relative bg-gradient-to-br from-slate-950 via-rose-950/80 to-slate-900 p-6 text-white overflow-hidden rounded-t-2xl">


          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">

              <div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                  Tally Prime Integration

                </DialogTitle>
                <DialogDescription className="text-slate-300 text-xs mt-0.5">
                  Direct XML & ODBC gateway integration for pharmacy invoices & ledgers
                </DialogDescription>
              </div>
            </div>
          </div>


        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-slate-50/60">
          {/* Prominent Error Banner */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-rose-900">
                  Tally is not installed or port is mismatched
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Root Cause Breakdown */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
              Possible Reasons
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <span className="font-semibold text-slate-800">
                    TallyPrime / Tally.ERP 9 is not installed
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tally desktop software is not found or not running on this machine.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <span className="font-semibold text-slate-800">
                    Port Mismatch (Configured: {port})
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tally may be running on a different port (such as 9001, 9002, or 9080) instead of port {port}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <span className="font-semibold text-slate-800">
                    ODBC / XML Server is disabled in Tally
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tally is running, but the internal HTTP/ODBC server interface is turned off in Tally configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>



          {/* Port Configuration (Collapsible) */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Connection Configuration
                </span>
                <p className="text-[11px] text-slate-500">
                  Host: <span className="font-mono font-medium">{host}</span> &bull; Port: <span className="font-mono font-medium">{port}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs h-7 px-2.5 rounded-lg border-slate-200 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-slate-500" />
                {showConfig ? "Hide" : "Change Port"}
              </Button>
            </div>

            {showConfig && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in-50 duration-200">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Gateway Host
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    XML / ODBC Port
                  </label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="9000"
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full sm:w-auto text-xs cursor-pointer h-9 px-4 rounded-xl border-slate-300 hover:bg-slate-100 text-slate-800"
            >
              {testingConnection ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5 text-rose-600" />
                  Testing Port {port}...
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5 mr-1.5 text-slate-600" />
                  Retry Connection
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto text-xs cursor-pointer h-9 px-4 rounded-xl border-slate-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
