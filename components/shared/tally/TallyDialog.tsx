"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  Activity,
  SlidersHorizontal,
  HelpCircle,
  CheckCircle2,
  Unlink,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useSWR from "swr";

interface TallyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

type TallyStatus = {
  connected: boolean;
  host: string;
  port: number;
  companyName?: string;
  cashLedger?: string;
  upiLedger?: string;
  cardLedger?: string;
  salesLedger?: string;
  expenseLedger?: string;
  lastCheckedAt?: string | null;
  lastError?: string | null;
  connectedAt?: string | null;
  companies?: string[];
  message?: string;
  ok?: boolean;
};

export function TallyDialog({ open, onOpenChange, onStatusChange }: TallyDialogProps) {
  const { data, mutate, isLoading } = useSWR<{ data: TallyStatus }>(
    open ? "/tally/status" : null,
    { revalidateOnFocus: true }
  );

  const status = data?.data;
  const connected = !!status?.connected;

  const [testingConnection, setTestingConnection] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [port, setPort] = useState("9000");
  const [host, setHost] = useState("localhost");
  const [companyName, setCompanyName] = useState("");
  const [cashLedger, setCashLedger] = useState("Cash");
  const [upiLedger, setUpiLedger] = useState("UPI");
  const [cardLedger, setCardLedger] = useState("Card");
  const [salesLedger, setSalesLedger] = useState("Pharmacy Sales");
  const [expenseLedger, setExpenseLedger] = useState("Indirect Expenses");

  useEffect(() => {
    if (!status) return;
    setHost(status.host || "localhost");
    setPort(String(status.port || 9000));
    setCompanyName(status.companyName || "");
    setCashLedger(status.cashLedger || "Cash");
    setUpiLedger(status.upiLedger || "UPI");
    setCardLedger(status.cardLedger || "Card");
    setSalesLedger(status.salesLedger || "Pharmacy Sales");
    setExpenseLedger(status.expenseLedger || "Indirect Expenses");
  }, [status]);

  const refresh = async () => {
    await mutate();
    onStatusChange?.();
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const res = await api.post("/tally/connect", {
        host: host.trim(),
        port: Number(port) || 9000,
        companyName: companyName.trim() || undefined,
        cashLedger: cashLedger.trim() || undefined,
        upiLedger: upiLedger.trim() || undefined,
        cardLedger: cardLedger.trim() || undefined,
        salesLedger: salesLedger.trim() || undefined,
        expenseLedger: expenseLedger.trim() || undefined,
      });
      toast.success(res.data?.message || `Connected to Tally on ${host}:${port}`);
      await refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Tally not reachable on ${host}:${port}`;
      toast.error(typeof msg === "string" ? msg : "Failed to connect to Tally");
      await refresh();
    } finally {
      setConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const res = await api.post("/tally/test");
      if (res.data?.data?.ok) {
        toast.success(res.data?.message || "Tally connection OK");
      } else {
        toast.error(res.data?.message || "Tally connection failed");
      }
      await refresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          `Tally not reachable on ${host}:${port}. Check if Tally is running.`
      );
      await refresh();
    } finally {
      setTestingConnection(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await api.post("/tally/disconnect");
      toast.success("Disconnected from Tally");
      await refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">
        <div className="relative bg-gradient-to-br from-slate-950 via-rose-950/80 to-slate-900 p-6 text-white overflow-hidden rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                  Tally Prime Integration
                  {connected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 border border-emerald-400/30">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-xs mt-0.5">
                  XML gateway for pharmacy receipts, payments &amp; ledgers
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 bg-slate-50/60">
          {isLoading ? (
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading Tally status…
            </div>
          ) : connected ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-emerald-900">
                    Connected to Tally on {status?.host}:{status?.port}
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Pharmacy account transactions (sales, refunds, expenses) are posted as{" "}
                    <strong>Receipt</strong> / <strong>Payment</strong> vouchers to your Tally
                    ledgers.
                    {status?.companyName ? (
                      <>
                        {" "}
                        Company: <span className="font-mono">{status.companyName}</span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-rose-900">
                    Tally is not connected
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    {status?.lastError ||
                      "TallyPrime must be running with HTTP/XML server enabled (default port 9000). The API server must be able to reach the Tally host."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!connected && (
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                Setup checklist
              </div>
              <ol className="space-y-2 text-xs list-decimal list-inside text-slate-600">
                <li>Open TallyPrime → F1 Help → Settings → Advanced Configuration</li>
                <li>Enable client/server with HTTP port (usually 9000) and load your company</li>
                <li>
                  If HMS API runs on another machine, set Host to this PC&apos;s LAN IP (not
                  localhost on the VPS)
                </li>
              </ol>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Connection Configuration
                </span>
                <p className="text-[11px] text-slate-500">
                  Host: <span className="font-mono font-medium">{host}</span> &bull; Port:{" "}
                  <span className="font-mono font-medium">{port}</span>
                  {companyName ? (
                    <>
                      {" "}
                      &bull; Company: <span className="font-mono font-medium">{companyName}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs h-7 px-2.5 rounded-lg border-slate-200 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-slate-500" />
                {showConfig ? "Hide" : "Configure"}
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
                    XML Port
                  </label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="9000"
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Company name (optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="As shown in Tally"
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Cash ledger
                  </label>
                  <input
                    value={cashLedger}
                    onChange={(e) => setCashLedger(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    UPI ledger
                  </label>
                  <input
                    value={upiLedger}
                    onChange={(e) => setUpiLedger(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Card ledger
                  </label>
                  <input
                    value={cardLedger}
                    onChange={(e) => setCardLedger(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Sales ledger
                  </label>
                  <input
                    value={salesLedger}
                    onChange={(e) => setSalesLedger(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Expense ledger
                  </label>
                  <input
                    value={expenseLedger}
                    onChange={(e) => setExpenseLedger(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 px-2.5 py-1.5"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="w-full sm:w-auto text-xs cursor-pointer h-9 px-4 rounded-xl border-slate-300"
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5 text-rose-600" />
                      Testing…
                    </>
                  ) : (
                    <>
                      <Activity className="h-3.5 w-3.5 mr-1.5 text-slate-600" />
                      Test connection
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto text-xs cursor-pointer h-9 px-4 rounded-xl border-slate-200"
              >
                Close
              </Button>
              {connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="w-full sm:w-auto text-xs cursor-pointer h-9 px-4 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                >
                  {disconnecting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Unlink className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full sm:w-auto text-xs cursor-pointer h-9 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white"
                >
                  {connecting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Link2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Connect Tally
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
