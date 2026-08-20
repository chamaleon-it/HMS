import React, { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { formatINR } from "@/lib/fNumber";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { ConsultationType } from "./interface";
import ConsultationDetails from "./ConsultationDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  FlaskConical,
  Pill,
  Search,
  Stethoscope,
  User,
  CalendarCheck,
} from "lucide-react";

interface AppointmentType {
  _id: string;
  date: string | Date;
  doctor?: {
    name?: string;
    specialization?: string;
  };
  type?: string;
  status?: string;
  method?: string;
  notes?: string;
  tokenNumber?: number;
  isPaid?: boolean;
}

interface VisitProps {
  consult?: ConsultationType[];
}

export default function Visit({ consult: propConsult }: VisitProps) {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");

  const { data: consultingData } = useSWR<{
    message: string;
    data: ConsultationType[];
  }>(!propConsult && patientId ? `/consultings/patient/${patientId}` : null);

  const { data: appointmentsData } = useSWR<{
    message: string;
    data: AppointmentType[];
  }>(patientId ? `/appointments/patient/${patientId}` : null);

  const consult = propConsult || consultingData?.data || [];
  const appointments = appointmentsData?.data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConsult, setSelectedConsult] = useState<ConsultationType | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const openDetails = useCallback((row: ConsultationType) => {
    setSelectedConsult(row);
    setShowDetail(true);
  }, []);

  const closeDetails = useCallback(() => {
    setShowDetail(false);
  }, []);

  const filteredConsult = consult.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const docName = item.doctor?.name?.toLowerCase() || "";
    const diag = item.consultationNotes?.diagnosis?.toLowerCase() || "";
    const complaints = item.chiefComplaints?.complaints?.join(" ")?.toLowerCase() || "";
    const presentHist = item.consultationNotes?.presentHistory?.toLowerCase() || "";
    const type = item.consultationType?.toLowerCase() || "";

    return (
      docName.includes(q) ||
      diag.includes(q) ||
      complaints.includes(q) ||
      presentHist.includes(q) ||
      type.includes(q)
    );
  });

  const lastVisit = consult[0]?.createdAt ? fDate(consult[0].createdAt) : "None";
  const nextFollowUp = consult.find((c) => c.followUp && new Date(c.followUp) >= new Date())?.followUp;

  return (
    <div className="space-y-4">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border p-3.5 bg-linear-to-br from-slate-50 to-slate-100/60 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Visits
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {consult.length}
          </div>
          <span className="text-[11px] text-slate-500">Consultation records</span>
        </div>

        <div className="rounded-xl border p-3.5 bg-linear-to-br from-emerald-50 to-emerald-100/50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Last Visit
          </span>
          <div className="text-base font-bold text-emerald-900 mt-1 truncate">
            {lastVisit}
          </div>
          <span className="text-[11px] text-emerald-600 truncate">
            {consult[0]?.doctor?.name ? `Dr. ${consult[0]?.doctor?.name}` : "No doctor assigned"}
          </span>
        </div>

        <div className="rounded-xl border p-3.5 bg-linear-to-br from-indigo-50 to-indigo-100/50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
            Next Follow-Up
          </span>
          <div className="text-base font-bold text-indigo-900 mt-1 truncate">
            {nextFollowUp ? fDate(nextFollowUp) : "Not scheduled"}
          </div>
          <span className="text-[11px] text-indigo-600">
            {nextFollowUp ? "Upcoming appointment" : "No active follow-up"}
          </span>
        </div>

        <div className="rounded-xl border p-3.5 bg-linear-to-br from-purple-50 to-purple-100/50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
            Appointments
          </span>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {appointments.length}
          </div>
          <span className="text-[11px] text-purple-600">Total bookings</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-2 border rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by diagnosis, doctor, complaints..."
            className="pl-9 h-9 text-xs rounded-lg border-slate-200"
          />
        </div>

      </div>

      {/* Visits Table */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900 hover:bg-slate-900">
              <TableHead className="text-white text-xs font-semibold w-12">#</TableHead>
              <TableHead className="text-white text-xs font-semibold">Visit Date & Time</TableHead>
              <TableHead className="text-white text-xs font-semibold">Doctor</TableHead>
              <TableHead className="text-white text-xs font-semibold">Chief Complaints</TableHead>
              <TableHead className="text-white text-xs font-semibold">Diagnosis</TableHead>
              <TableHead className="text-white text-xs font-semibold">Prescription & Tests</TableHead>
              <TableHead className="text-white text-xs font-semibold">Follow-Up</TableHead>
              <TableHead className="text-white text-xs font-semibold text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredConsult.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                    <Stethoscope className="h-8 w-8 text-slate-300 stroke-[1.5] mb-1" />
                    <p className="font-semibold text-sm text-slate-700">No consultation visits found</p>
                    <p className="text-xs text-slate-400">
                      {searchQuery
                        ? "Try clearing your search query to see all visits"
                        : "No recorded consultations for this patient yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredConsult.map((visit, idx) => {
                const complaints =
                  visit.chiefComplaints?.complaints?.length
                    ? visit.chiefComplaints.complaints.join(", ")
                    : visit.consultationNotes?.presentHistory || "-";

                const medsCount = visit.medicines?.length || 0;
                const testsCount = visit.test?.reduce((sum, t) => sum + (t.name?.length || 0), 0) || 0;

                return (
                  <TableRow key={visit._id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-semibold text-slate-500 text-xs">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-900">
                          {fDate(visit.createdAt)}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3 inline" />
                          {fDateandTime(visit.createdAt).split(" ")[1] || ""}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col min-w-32">
                        <span className="font-semibold text-xs text-slate-900">
                          {visit.doctor?.name ? `Dr. ${visit.doctor.name.replace(/^dr\.\s*/i, "")}` : "Attending Doctor"}
                        </span>
                        {visit.doctor?.specialization && (
                          <span className="text-[11px] text-slate-500">
                            {visit.doctor.specialization}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-44">
                      <p className="text-xs text-slate-700 truncate" title={complaints}>
                        {complaints}
                      </p>
                    </TableCell>

                    <TableCell className="max-w-44">
                      <p className="text-xs font-medium text-slate-800 truncate" title={visit.consultationNotes?.diagnosis || "-"}>
                        {visit.consultationNotes?.diagnosis || "-"}
                      </p>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {medsCount > 0 && (
                          <Badge variant="secondary" className="text-[11px] font-normal gap-1 bg-amber-50 text-amber-700 border-amber-200">
                            <Pill className="h-3 w-3" />
                            {medsCount} {medsCount === 1 ? "Med" : "Meds"}
                          </Badge>
                        )}
                        {testsCount > 0 && (
                          <Badge variant="secondary" className="text-[11px] font-normal gap-1 bg-sky-50 text-sky-700 border-sky-200">
                            <FlaskConical className="h-3 w-3" />
                            {testsCount} {testsCount === 1 ? "Test" : "Tests"}
                          </Badge>
                        )}
                        {medsCount === 0 && testsCount === 0 && (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {visit.followUp ? (
                        <Badge variant="outline" className="text-[11px] bg-indigo-50/70 text-indigo-700 border-indigo-200 gap-1 font-medium">
                          <CalendarCheck className="h-3 w-3" />
                          {fDate(visit.followUp)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetails(visit)}
                        className="h-7 px-2.5 text-xs font-semibold rounded-lg hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Consultation Details Modal */}
      <ConsultationDetails
        open={showDetail}
        onOpenChange={setShowDetail}
        selectedRow={selectedConsult}
        onClose={closeDetails}
      />
    </div>
  );
}
