"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Printer, ScrollText, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { fAge } from "@/lib/fDateAndTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PatientSelection from "../PatientSelection";
import {
  formatCertificateDate,
  formatDoctorName,
  resumeDate,
} from "./certificateFormat";
import PrintMedicalCertificate, {
  MedicalCertificateRecord,
} from "./PrintMedicalCertificate";

interface DoctorOption {
  _id: string;
  name: string;
  qualification?: string | null;
  specialization?: string | null;
  licenseNo?: string | null;
  status?: string;
}

interface FormState {
  patientId: string;
  patientName: string;
  age: string;
  gender: "" | "Male" | "Female";
  reason: string;
  dateFrom: string;
  dateTo: string;
  doctorId: string;
  doctorQualification: string;
  doctorRegistrationNumber: string;
}

const emptyForm = (): FormState => ({
  patientId: "",
  patientName: "",
  age: "",
  gender: "",
  reason: "",
  dateFrom: "",
  dateTo: "",
  doctorId: "",
  doctorQualification: "",
  doctorRegistrationNumber: "",
});

const fieldClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-(--color-synapse-light) focus:ring-2 focus:ring-synapse-light/20";

export default function MedicalCertificatePanel() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [printing, setPrinting] = useState<MedicalCertificateRecord | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const listKey = `/pharmacy/medical-certificate?page=${page}&limit=20${
    debouncedQuery ? `&q=${encodeURIComponent(debouncedQuery)}` : ""
  }`;

  const { data, isLoading, mutate } = useSWR<{
    data: MedicalCertificateRecord[];
    total: number;
    page: number;
    limit: number;
  }>(listKey);

  const { data: doctorsData } = useSWR<{ data: DoctorOption[] }>("/users/doctors");
  const doctors = useMemo(
    () =>
      (doctorsData?.data ?? [])
        .filter((doctor) => doctor._id && doctor.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [doctorsData],
  );

  const certificates = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const fitFrom = form.dateTo ? formatCertificateDate(resumeDate(form.dateTo)) : "";

  useEffect(() => {
    if (!printing) return;
    const timer = window.setTimeout(() => window.print(), 150);
    const clear = () => setPrinting(null);
    window.addEventListener("afterprint", clear);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", clear);
    };
  }, [printing]);

  const onSelectPatient = useCallback(
    (patient: {
      _id: string;
      name: string;
      gender?: string;
      dateOfBirth?: string | Date;
    } | null) => {
      if (!patient) return;
      const years = patient.dateOfBirth
        ? String(fAge(patient.dateOfBirth).years)
        : "";
      const rawGender = (patient.gender || "").toLowerCase();
      const gender = rawGender.startsWith("f")
        ? "Female"
        : rawGender.startsWith("m")
          ? "Male"
          : "";
      setForm((prev) => ({
        ...prev,
        patientId: patient._id,
        patientName: patient.name || prev.patientName,
        age: years || prev.age,
        gender: gender || prev.gender,
      }));
    },
    [],
  );

  const onSelectDoctor = (doctorId: string) => {
    const doctor = doctors.find((item) => item._id === doctorId);
    setForm((prev) => ({
      ...prev,
      doctorId,
      doctorQualification: (
        doctor?.qualification ||
        doctor?.specialization ||
        ""
      ).trim(),
      doctorRegistrationNumber: (doctor?.licenseNo || "").trim(),
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.patientName.trim()) {
      toast.error("Enter the patient name.");
      return;
    }
    if (!form.age.trim()) {
      toast.error("Enter the patient age.");
      return;
    }
    if (form.gender !== "Male" && form.gender !== "Female") {
      toast.error("Select the patient gender.");
      return;
    }
    if (!form.reason.trim()) {
      toast.error("Enter the reason.");
      return;
    }
    if (!form.dateFrom || !form.dateTo) {
      toast.error("Enter the from and to dates.");
      return;
    }
    if (form.dateTo < form.dateFrom) {
      toast.error("To date cannot be before the from date.");
      return;
    }
    if (!form.doctorId) {
      toast.error("Select a doctor.");
      return;
    }
    if (!form.doctorQualification.trim()) {
      toast.error("Enter the doctor's qualification.");
      return;
    }
    if (!form.doctorRegistrationNumber.trim()) {
      toast.error("Enter the doctor's registration number.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/pharmacy/medical-certificate", {
        patientName: form.patientName.trim(),
        age: form.age.trim(),
        gender: form.gender,
        reason: form.reason.trim(),
        dateFrom: form.dateFrom,
        dateTo: form.dateTo,
        doctor: form.doctorId,
        doctorQualification: form.doctorQualification.trim(),
        doctorRegistrationNumber: form.doctorRegistrationNumber.trim(),
        ...(form.patientId ? { patient: form.patientId } : {}),
      });
      toast.success("Medical certificate saved.");
      setForm(emptyForm());
      setPage(1);
      await mutate();
    } catch (error: unknown) {
      const message = (
        error as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;
      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Could not save the medical certificate.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 print:hidden">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-(--color-synapse-light)" />
          <h2 className="text-sm font-semibold text-slate-900">
            New medical certificate
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1.5 xl:col-span-3">
            <Label>Find patient</Label>
            <PatientSelection
              value={form.patientId}
              setValue={(patientId) =>
                setForm((prev) => ({ ...prev, patientId }))
              }
              onSelectPatient={onSelectPatient}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-patient-name">Patient name</Label>
            <Input
              id="cert-patient-name"
              value={form.patientName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, patientName: event.target.value }))
              }
              placeholder="Patient name"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-age">Age</Label>
            <Input
              id="cert-age"
              value={form.age}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, age: event.target.value }))
              }
              placeholder="45"
              inputMode="numeric"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-gender">Gender</Label>
            <select
              id="cert-gender"
              value={form.gender}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  gender: event.target.value as FormState["gender"],
                }))
              }
              className={fieldClass}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
            <Label htmlFor="cert-reason">Reason</Label>
            <Input
              id="cert-reason"
              value={form.reason}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reason: event.target.value }))
              }
              placeholder="Leg pain"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-from">Date from</Label>
            <Input
              id="cert-from"
              type="date"
              value={form.dateFrom}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dateFrom: event.target.value }))
              }
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-to">Date to</Label>
            <Input
              id="cert-to"
              type="date"
              value={form.dateTo}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dateTo: event.target.value }))
              }
              className={fieldClass}
            />
          </div>

          <div className="flex items-end pb-2 text-xs text-slate-500">
            {fitFrom
              ? `Fit to resume on ${fitFrom}, the day after the to date.`
              : "Fit to resume is the day after the to date."}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-doctor">Doctor</Label>
            <select
              id="cert-doctor"
              value={form.doctorId}
              onChange={(event) => onSelectDoctor(event.target.value)}
              className={fieldClass}
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {formatDoctorName(doctor.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-qualification">Qualification</Label>
            <Input
              id="cert-qualification"
              value={form.doctorQualification}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  doctorQualification: event.target.value,
                }))
              }
              placeholder="Filled from the selected doctor"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-reg">Registration number</Label>
            <Input
              id="cert-reg"
              value={form.doctorRegistrationNumber}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  doctorRegistrationNumber: event.target.value,
                }))
              }
              placeholder="Filled from the selected doctor"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit" disabled={saving} className="rounded-full px-5">
            {saving ? "Saving..." : "Save certificate"}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Medical certificates
            </h2>
            <p className="text-xs text-slate-500">
              {total} saved {total === 1 ? "certificate" : "certificates"}
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search patient, doctor, or reason"
              className="h-9 pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Rest period</TableHead>
              <TableHead>Fit from</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead className="text-right">Print</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  Loading certificates...
                </TableCell>
              </TableRow>
            ) : certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  No medical certificates yet.
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((certificate) => (
                <TableRow key={certificate._id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {certificate.patientName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {certificate.age} · {certificate.gender}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56 truncate">
                    {certificate.reason}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatCertificateDate(certificate.dateFrom)} –{" "}
                    {formatCertificateDate(certificate.dateTo)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatCertificateDate(resumeDate(certificate.dateTo))}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {formatDoctorName(certificate.doctorName)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {certificate.doctorQualification}
                      {certificate.doctorRegistrationNumber
                        ? ` · ${certificate.doctorRegistrationNumber}`
                        : ""}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setPrinting(certificate)}
                    >
                      <Printer className="mr-1.5 h-3.5 w-3.5" />
                      Print
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pageCount > 1 && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-slate-500">
              {page} / {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <PrintMedicalCertificate certificate={printing} />
    </div>
  );
}
