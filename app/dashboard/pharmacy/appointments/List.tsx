import { fDateandTime } from "@/lib/fDateAndTime";
import { Search, CheckCircle2, XCircle, Pencil, MoreHorizontal, Clock, Printer } from "lucide-react";
import React, { useState } from "react";
import BlankPrescription from "./BlankPrescription";
import useAppointmentList from "./data/useAppointmentList";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



export default function List({
  query,
  activeStatuses,
  date,
  activeDate
}: {
  query: string;
  activeStatuses: string[];
  date: Date;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
}) {
  const router = useRouter();
  const { data, mutate } = useAppointmentList({ activeStatuses, date, activeDate });

  const [edit, setEdit] = useState<null | any>(null);
  const [printData, setPrintData] = useState<any>(null);

  const handlePrintPrescription = (row: any) => {
    setPrintData({
      patient: row.patient,
      doctor: row.doctor,
      date: row.date,
    });
    setTimeout(() => {
      window.print();
      setPrintData(null);
    }, 500);
  };

  // Combine real data with mock data if real data is empty for demo purposes
  const rawData = data?.data && data.data.length > 0 ? data.data : [];

  const filteredData = rawData.filter((a: any) => {
    if (!query) return true;

    const q = query.toLowerCase();
    const name = a?.patient?.name?.toLowerCase() || "";
    const mrn = a?.patient?.mrn?.toLowerCase() || "";
    const aptNo = String(a?.mrn ?? "").toLowerCase();

    return name.includes(q) || mrn.includes(q) || aptNo.includes(q);
  }) || [];

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await toast.promise(api.patch(`/appointments/${id}`, { status }), {
        loading: `Updating...`,
        success: "Updated!",
        error: "Failed to update",
      });
      mutate();

      const appointment = filteredData.find((a) => a._id === id);
      if (status === "Consulted") {
        router.push(`/dashboard/pharmacy/?mrn=${appointment?.patient?.mrn}&name=${appointment?.patient?.name}&id=${appointment?.patient?._id}&doctor=${appointment?.doctor._id}&#newOrder`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white border text-sm rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50 border-gray-100">
            <TableHead className="py-3 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Apt #</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-25">Time</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason / Notes</TableHead>
            <TableHead className="py-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center ring-1 ring-gray-100">
                    <Search className="h-8 w-8 text-gray-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">No appointments found</p>
                    <p className="text-xs text-gray-500">Try adjusting your filters or date.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((row, idx) => {
              const isNew = row.visitCount === 1 || row.type === "New";
              return (
                <TableRow
                  key={row._id}
                  className="group hover:bg-gray-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="py-2.5 pl-4 font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                    {row.mrn ?? "—"}
                  </TableCell>
                  <TableCell className="py-2.5 font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {fDateandTime(row.date)}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <Avatar text={row.patient.name} />
                        {row.visitCount === 1 ? (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0 rounded-full ring-2 ring-white">N</span>
                        ) : (
                          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1 py-0 rounded-full ring-2 ring-white">R</span>
                        )}
                      </div>
                      <div className="min-w-0 max-w-50">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-gray-900 block">{row.patient.name}</span>
                          {row.visitCount > 0 && <span className="bg-gray-100 text-gray-500 text-[10px] px-1 rounded border border-gray-200" title="Visit Count">{row.visitCount}</span>}
                        </div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <span>{row.patient.mrn}</span>
                          {row.patient.phoneNumber && <span className="text-gray-300">•</span>}
                          <span>{row.patient.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-1 ring-indigo-100">
                        {row?.doctor?.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 max-w-45">
                        <div className="truncate text-sm font-medium text-gray-900">
                          Dr. {row?.doctor?.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {row?.doctor?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                      {row.type}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Chip label={row.status} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-xs text-gray-500 truncate">{row.notes}</span>
                  </TableCell>
                  <TableCell className="py-2.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButtons status={row.status} id={row._id} onStatusUpdate={handleStatusUpdate} onEdit={() => setEdit(row)} onPlaceOrder={() => router.push(`/dashboard/pharmacy/?mrn=${row?.patient?.mrn}&name=${row?.patient?.name}&id=${row?.patient?._id}&doctor=${row?.doctor?._id}&#newOrder`)} onPrint={() => handlePrintPrescription(row)} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <Dialog open={Boolean(edit)} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl! max-h-[90vh] overflow-hidden flex flex-col p-0! gap-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
            {edit && (
              <CreateAppointmentForm
                onClose={() => setEdit(null)}
                mutate={mutate}
                walkIn
                appointment={edit}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {printData && <BlankPrescription data={printData} />}
    </div>
  );
}

function ActionButtons({ status, id, onStatusUpdate, onEdit, onPlaceOrder, onPrint }: any) {
  return (
    <>
      {status !== "Consulted" && <button
        onClick={() => onStatusUpdate(id, "Consulted")}
        className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-200 transition-all"
        title="Mark Consulted"
      >
        <CheckCircle2 size={16} />
      </button>}
      <button
        onClick={onPrint}
        className="p-1.5 rounded-md hover:bg-purple-50 text-purple-600 border border-transparent hover:border-purple-200 transition-all"
        title="Print Blank Prescription"
      >
        <Printer size={16} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 border border-transparent hover:border-blue-200 transition-all"
        title="Edit"
      >
        <Pencil size={16} />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 border border-transparent hover:border-gray-200 outline-hidden">
          <MoreHorizontal size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1">
          <DropdownMenuLabel className="py-1 px-2 text-xs">Change Status</DropdownMenuLabel>
          <DropdownMenuItem className="py-1" onClick={onPlaceOrder}>Place Order</DropdownMenuItem>
          <DropdownMenuItem className="py-1" onClick={() => onStatusUpdate(id, "Upcoming")}>Mark Upcoming</DropdownMenuItem>
          <DropdownMenuItem className="py-1" onClick={() => onStatusUpdate(id, "Consulted")}>Mark Consulted</DropdownMenuItem>
          <DropdownMenuSeparator className="my-0.5" />
          <DropdownMenuItem className="py-1 text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => onStatusUpdate(id, "Not show")}>Mark Not Show</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

const Chip: React.FC<{ label: string }> = ({ label }) => {
  const styles: Record<string, string> = {
    Upcoming: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Consulted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Not show": "bg-amber-50 text-amber-700 border-amber-200",
  };

  const style = styles[label] || "bg-zinc-100 text-zinc-600 border-zinc-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${style}`}
    >
      {label}
    </span>
  );
};

function Avatar({ text }: { text: string }) {
  const initial = text.charAt(0).toUpperCase();
  const colors = [
    "from-rose-400 to-orange-300",
    "from-violet-400 to-purple-300",
    "from-blue-400 to-cyan-300",
    "from-emerald-400 to-teal-300",
    "from-amber-400 to-yellow-300"
  ];
  // Simple deterministic color
  const colorIndex = text.length % colors.length;
  const gradient = colors[colorIndex];

  return (
    <div
      className={`h-9 w-9 rounded-full bg-linear-to-br ${gradient} text-white grid place-items-center text-sm font-bold shadow-sm shadow-black/5`}
    >
      {initial}
    </div>
  );
}
