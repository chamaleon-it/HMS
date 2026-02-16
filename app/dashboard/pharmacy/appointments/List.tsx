import { fTime } from "@/lib/fDateAndTime";
import { MapPin, Phone, Video, Search, CheckCircle2, XCircle, Trash2, Pencil, MoreHorizontal, Calendar, User, Clock } from "lucide-react";
import React, { useState } from "react";
import useAppointmentList from "./data/useAppointmentList";
import Drawer from "@/components/ui/drawer";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import toast from "react-hot-toast";
import api from "@/lib/axios";
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
}: {
  query: string;
  activeStatuses: string[];
  date: Date;
}) {
  const router = useRouter();
  const { data, mutate } = useAppointmentList({ activeStatuses, date });

  const [edit, setEdit] = useState<null | any>(null);

  // Combine real data with mock data if real data is empty for demo purposes
  const rawData = data?.data && data.data.length > 0 ? data.data : [];

  const filteredData = rawData.filter((a: any) => {
    if (!query) return true;

    const q = query.toLowerCase();
    const name = a?.patient?.name?.toLowerCase() || "";
    const mrn = a?.patient?.mrn?.toLowerCase() || "";

    return name.includes(q) || mrn.includes(q);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await toast.promise(api.delete(`/appointments/${id}`), {
        loading: "Deleting...",
        success: "Deleted",
        error: "Failed",
      });
      mutate();
    } catch (error) {
      console.error(error);
    }
  };


  console.log(filteredData)
  return (
    <div className="bg-white border text-sm rounded-xl overflow-hidden shadow-sm mt-4">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50 border-gray-100">
            <TableHead className="py-3 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[100px]">Time</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type/Method</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="py-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-64 text-center">
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
                  <TableCell className="py-2.5 pl-4 font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {fTime(row.date)}
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
                      <div className="min-w-0 max-w-[200px]">
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
                        {row.doctor.name.charAt(0)}
                      </div>
                      <div className="min-w-0 max-w-[180px]">
                        <div className="truncate text-sm font-medium text-gray-900">
                          Dr. {row.doctor.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {row.doctor.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                        {row.method === "In clinic" && <MapPin className="h-3 w-3 text-gray-400" />}
                        {row.method === "Video" && <Video className="h-3 w-3 text-gray-400" />}
                        {row.method === "Phone" && <Phone className="h-3 w-3 text-gray-400" />}
                        {row.method}
                      </span>
                      <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {row.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Chip label={row.status} />
                  </TableCell>
                  <TableCell className="py-2.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionButtons id={row._id} onStatusUpdate={handleStatusUpdate} onEdit={() => setEdit(row)} onDelete={() => handleDelete(row._id)} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <Drawer
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        title="Edit Appointment"
      >
        {edit && (
          <CreateAppointmentForm
            onClose={() => setEdit(null)}
            mutate={mutate}
            appointment={edit}
          />
        )}
      </Drawer>
    </div>
  );
}

function ActionButtons({ id, onStatusUpdate, onEdit, onDelete }: any) {
  return (
    <>
      <button
        onClick={() => onStatusUpdate(id, "Consulted")}
        className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-200 transition-all"
        title="Mark Consulted"
      >
        <CheckCircle2 size={16} />
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
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onStatusUpdate(id, "Upcoming")}>Mark Upcoming</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusUpdate(id, "Consulted")}>Mark Consulted</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusUpdate(id, "Observation")}>Mark Observation</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusUpdate(id, "Completed")}>Mark Completed</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusUpdate(id, "Admit")}>Mark Admit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusUpdate(id, "Test")}>Mark Test</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onStatusUpdate(id, "Not show")} className="text-red-600 focus:text-red-700 focus:bg-red-50">Mark Not Show</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-700 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

const Chip: React.FC<{ label: string }> = ({ label }) => {
  const styles: Record<string, string> = {
    Upcoming: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Consulted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Not show": "bg-amber-50 text-amber-700 border-amber-200",
    Observation: "bg-sky-50 text-sky-700 border-sky-200",
    Admit: "bg-rose-50 text-rose-700 border-rose-200",
    Test: "bg-rose-50 text-rose-700 border-rose-200",
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
