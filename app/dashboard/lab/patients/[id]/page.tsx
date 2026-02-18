"use client";
import React, { useState } from "react";
import { ArrowLeft, ChevronDownIcon, FlaskConical, Image as ImageIcon, LucideProps } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/app-shell";
import { useParams, useRouter } from "next/navigation";
import { formatINR } from "@/lib/fNumber";
import { fAge, fDate } from "@/lib/fDateAndTime";
import useSWR from "swr";
import { EmptyReport } from "./EmptyReport";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { DataTypes, Datum } from "./interface";
import useGetPatient from "./useGetPatient";
import { motion } from "framer-motion";

const Customer: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const { data: reportData, error } = useSWR<DataTypes>(
    `/lab/report/patient/${id}`
  );

  const { data: patient } = useGetPatient(id as string);
  const reports = reportData?.data;
  const [selectedVisit, setSelectedVisit] = useState<Datum | null>(null);

  const [openCalander, setOpenCalander] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);


  const [type, setType] = useState<"Lab" | "Imaging" | "All">("All");

  const tabs = [
    { key: "All", label: "All", },
    { key: "Lab", label: "Lab", icon: FlaskConical },
    { key: "Imaging", label: "Imaging", icon: ImageIcon },
  ] as const;

  return (
    <AppShell>
      <div className="bg-slate-50 p-5">
        <main className="space-y-6">
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 rounded-full border-slate-300 bg-white/80 hover:bg-slate-50"
              onClick={() => router.push("/dashboard/lab/patients")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to patients
            </Button>
          </div>
          {error && <EmptyReport />}
          {!error && (
            <>
              <div className="border rounded-2xl bg-white shadow-sm px-5 py-4 flex flex-wrap items-start gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white text-lg font-semibold">
                  {patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-[220px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {patient?.name}
                    </h1>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {patient?.mrn}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Age {fAge(patient?.dateOfBirth)} /{" "}
                    {patient?.gender} • Ph:{" "}
                    {patient?.phoneNumber}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {patient?.address}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                    {reports?.length === 0 && (
                      <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        No purchase history yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                  <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                    Total Spend
                  </div>
                  <div className="text-2xl font-semibold text-emerald-900">
                    {formatINR(0)}
                  </div>
                </div>
                <div className="border rounded-2xl p-4 bg-gradient-to-br from-sky-50 to-sky-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                  <div className="text-xs font-medium text-sky-700 uppercase tracking-wide">
                    Total Visits
                  </div>
                  <div className="text-3xl font-semibold text-sky-900">
                    {reports?.length}
                  </div>
                </div>
                <div className="border rounded-2xl p-4 bg-gradient-to-br from-violet-50 to-violet-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                  <div className="text-xs font-medium text-violet-700 uppercase tracking-wide">
                    Last Visit
                  </div>
                  <div className="text-sm font-semibold text-violet-900">
                    {fDate(reports?.[0]?.createdAt)}
                  </div>
                </div>
                <div className="border rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                  <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                    Avg Spend
                  </div>
                  <div className="text-2xl font-semibold text-amber-900">
                    {formatINR(0)}
                  </div>
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-5 items-start">
                <div className="md:col-span-2 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                  <div className="px-4 py-3 bg-slate-900 text-slate-50 flex items-center justify-between">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">
                        {reports?.length}
                      </span>
                      Bills / Visits
                    </div>
                    <div className="text-[11px] text-slate-200">
                      {reports?.length !== 0 ? reports?.length : "No"}{" "}
                      bill
                      {reports?.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-2">
                    <div className="flex items-center gap-3 text-[12px] text-slate-700">
                      <span className="font-medium">Filter:</span>

                      <Popover open={openCalander} onOpenChange={setOpenCalander}>

                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date"
                            className="w-52 justify-between font-normal"
                          >
                            {date?.from && date?.to
                              ? `${fDate(date.from)} to ${fDate(date.to)}`
                              : "Select date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="range"
                            selected={date}
                            captionLayout="dropdown"
                            numberOfMonths={2}
                            onSelect={(s) => {
                              setDate(s);

                              const { from, to } = s || {};

                              if (
                                from &&
                                to &&
                                from !== to &&
                                (from !== date?.from || to !== date?.to)
                              ) {
                                setOpenCalander(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      {date?.from && date?.to && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[11px] px-3"
                          onClick={() => {
                            setDate({ from: undefined, to: undefined });
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
                      {tabs.map(({ key, label, icon: Icon }: { key: "Lab" | "Imaging" | "All"; label: string; icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> }) => {
                        const active = type === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setType(key)}
                            className={
                              "relative flex items-center gap-2 rounded-full px-2 py-1.5 transition will-change-transform cursor-pointer " +
                              (active ? "text-white" : "text-gray-700")
                            }
                            type="button"
                          >
                            {active && (
                              <motion.span
                                layoutId="tab-indicator-1"
                                className="absolute inset-0 rounded-full"
                                style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              />
                            )}
                            <span className="relative z-10 flex items-center gap-1 text-sm">
                              {Icon && <Icon size={16} />}
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>


                  </div>
                  <div className="flex-1 overflow-y-auto divide-y">
                    {reports?.length === 0 && (
                      <div className="p-4 text-xs text-slate-500">
                        No purchase history for this patient.
                      </div>
                    )}

                    {reports?.length === 0 && (
                      <div className="p-4 text-xs text-slate-500">
                        No bills in this date range.
                      </div>
                    )}

                    {reports?.filter(o => {

                      if (type && type !== "All" && !o.name?.some(s => s.type === type)) return false;

                      if (date?.from && date?.to) {
                        const created = new Date(o.createdAt);
                        const start = new Date(date.from);
                        const end = new Date(date.to);
                        end.setHours(23, 59, 59, 999);
                        if (created < start || created > end) return false;
                      }

                      return true;
                    })
                      .map((bill) => {
                        const active =
                          selectedVisit && selectedVisit._id === bill._id;
                        return (
                          <button
                            key={bill._id}
                            type="button"
                            onClick={() => setSelectedVisit(bill)}
                            className={`w-full text-left px-4 py-3.5 text-[15px] flex flex-col gap-1 transition-all duration-150 ${active
                              ? "bg-slate-900 text-slate-50"
                              : "hover:bg-slate-50"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {fDate(bill.createdAt)}
                              </span>
                              <span className="text-xs font-semibold">
                                {formatINR(0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-[12px]">
                              <span
                                className={
                                  active ? "opacity-80" : "text-slate-500"
                                }
                              >
                                {bill.name.filter(o => type === "All" || o.type === type).length} item
                                {bill.name.filter(o => type === "All" || o.type === type).length === 1 ? "" : "s"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="md:col-span-3 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                  <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b">
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedVisit
                        ? `Bill Details — ${selectedVisit?.name.filter(o => type === "All" || o.type === type).map(e => e.code).join(", ")}`
                        : "Bill Details"}
                    </div>
                    {selectedVisit && (
                      <div className="text-[11px] text-slate-500 flex flex-col items-end">
                        <span>
                          Date:{" "}
                          <span className="font-medium text-slate-700">
                            {fDate(selectedVisit.createdAt)}
                          </span>
                        </span>
                        <span>
                          RX ID:{" "}
                          <span className="font-medium text-slate-700">
                            {selectedVisit._id}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {!selectedVisit && (
                    <div className="p-6 text-sm text-slate-500">
                      Select a bill on the left to see its item-wise details.
                    </div>
                  )}

                  {selectedVisit && (
                    <>
                      <div className="flex-1 overflow-auto">
                        <table className="w-full text-[15px]">
                          <thead className="bg-slate-50 text-slate-700 sticky top-0 text-sm">
                            <tr>
                              <th className="p-2 text-left font-medium">Sl</th>
                              <th className="p-2 text-left font-medium">
                                Test
                              </th>
                              <th className="p-2 text-right font-medium">
                                Value
                              </th>
                              <th className="p-2 text-right font-medium">
                                Reference
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedVisit.name.filter(o => type === "All" || o.type === type).map((it, i) => {
                              return (
                                <tr
                                  key={it.name}
                                  className="border-t align-top hover:bg-slate-50/70 transition-colors"
                                >
                                  <td className="p-2 align-top text-slate-500">
                                    {i + 1}
                                  </td>
                                  <td className="p-2 align-top">
                                    <div className="flex items-center gap-1">
                                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        {it.type === "Lab" ? (
                                          <FlaskConical className="h-4 w-4" />
                                        ) : (
                                          <ImageIcon className="h-4 w-4" />
                                        )}
                                      </span>

                                      <div className="">

                                        <div className="font-medium text-slate-900 leading-snug">
                                          {it.name}
                                        </div>
                                        <div className="text-[12px] text-slate-600 leading-snug">
                                          (Gen: {it.code} - {it.panel})
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-2 align-top text-right text-sm font-semibold text-slate-900">
                                    {it.type === "Lab" ? (
                                      <>
                                        {it.value} {it.unit}
                                      </>
                                    ) : (
                                      <a
                                        href={it.value?.toString()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-2 py-0.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                      >
                                        View Result
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3 w-3 ml-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                          />
                                        </svg>
                                      </a>
                                    )}
                                  </td>
                                  <td className="p-2 align-top text-right text-sm font-semibold text-slate-900">
                                    {it.type === "Lab" && it.min ? (
                                      <>
                                        {it.min} {it.unit} - {it.max}{" "}
                                        {it.unit}
                                      </>
                                    ) : (
                                      <>
                                        {it.min} - {it.max}
                                      </>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}

                            {selectedVisit.name.length === 0 && (
                              <tr>
                                <td
                                  className="p-3 text-center text-slate-500"
                                  colSpan={4}
                                >
                                  No items.
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr className="border-t bg-slate-50/80">
                              <td
                                colSpan={3}
                                className="p-2 text-right text-xs text-slate-600"
                              >
                                Total
                              </td>
                              <td className="p-2 text-right text-sm font-semibold text-slate-900">
                                {formatINR(
                                  0
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between gap-3">
                        <div className="text-[12px] text-slate-500">

                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800"

                          >
                            Print bill
                          </Button>
                          <Button className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800">
                            Refund
                          </Button>
                        </div>
                      </div>

                    </>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </AppShell>
  );
};

export default Customer;
