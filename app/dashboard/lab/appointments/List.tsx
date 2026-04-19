import { fTime } from "@/lib/fDateAndTime";
import { MapPin, Phone, Video, Search, Clock } from "lucide-react";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import BookNowModal from "@/components/dashboard/lab/Home/BookNowModal";
import { useState } from "react";

export default function List({
  query,
  activeStatuses,
  date,
  data,
  mutate,
  isLoading,
}: {
  query: string;
  activeStatuses: string[];
  date: Date | undefined;
  data: any;
  mutate: () => void;
  isLoading: boolean;
}) {
  // const { data } = useAppointmentList({ activeStatuses, date });
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<string | null>(null)
  const [isNewTestOpen, setIsNewTestOpen] = useState(false);


  // Combine real data with mock data if real data is empty for demo purposes
  const rawData = data?.data && data.data.length > 0 ? data.data : [];

  const filteredData = rawData.filter((a: any) => {
    if (!query) return true;

    const q = query.toLowerCase();
    const name = a?.patient?.name?.toLowerCase() || "";
    const mrn = a?.patient?.mrn?.toLowerCase() || "";

    return name.includes(q) || mrn.includes(q);
  }) || [];





  return (
    <div className="bg-white border text-sm rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50 border-gray-100">
            <TableHead className="py-3 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-25">Time</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type/Method</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason / Notes</TableHead>
            <TableHead className="py-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Loading appointments...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
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
            filteredData.map((row: any) => {
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
                      <div className="min-w-0 max-w-50">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-gray-900 block">{row?.patient?.name}</span>
                          {row?.visitCount > 0 && <span className="bg-gray-100 text-gray-500 text-[10px] px-1 rounded border border-gray-200" title="Visit Count">{row.visitCount}</span>}
                        </div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <span>{row?.patient?.mrn}</span>
                          {row?.patient?.phoneNumber && <span className="text-gray-300">•</span>}
                          <span>{row?.patient?.phoneNumber}</span>
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
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                        {row?.method === "In clinic" && <MapPin className="h-3 w-3 text-gray-400" />}
                        {row?.method === "Video" && <Video className="h-3 w-3 text-gray-400" />}
                        {row?.method === "Phone" && <Phone className="h-3 w-3 text-gray-400" />}
                        {row?.method}
                      </span>
                      <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {row?.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Chip label={row?.status} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-xs text-gray-500 truncate">{row?.notes}</span>
                  </TableCell>
                  <TableCell className="py-2.5 pr-4 text-right">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      onClick={() => {
                        setSelectedPatient(row?.patient);
                        setDoctor(row?.doctor?._id)
                        setIsNewTestOpen(true);
                      }}
                    >
                      Book Now
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      <BookNowModal
        doctor={doctor}
        open={isNewTestOpen}
        onOpenChange={setIsNewTestOpen}
        patient={selectedPatient}
        mutate={mutate}
      />
    </div>
  );
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
