"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Calendar,
  Stethoscope,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

export interface PatientItem {
  _id: string;
  mrn: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  gender: string;
  dateOfBirth?: string;
  status: string;
  blood?: string;
  doctor?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface PatientDirectoryTableProps {
  patients: PatientItem[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  genderFilter: string;
  onGenderChange: (gender: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function PatientDirectoryTable({
  patients,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
  searchTerm,
  onSearchChange,
  genderFilter,
  onGenderChange,
  statusFilter,
  onStatusChange,
}: PatientDirectoryTableProps) {
  const totalPages = Math.ceil(total / limit) || 1;

  const calculateAge = (dobStr?: string) => {
    if (!dobStr) return "N/A";
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return "N/A";
    const age = new Date().getFullYear() - dob.getFullYear();
    return `${age} yrs`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 space-y-4 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Patient Master Directory
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              List of all registered hospital patients
            </p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 font-medium text-xs">
            <Select value={genderFilter} onValueChange={onGenderChange}>
              <SelectTrigger className="h-9 w-32 bg-slate-50/70 border-slate-200 text-xs font-semibold rounded-xl">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="ALL">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 font-medium text-xs">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 w-36 bg-slate-50/70 border-slate-200 text-xs font-semibold rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Discharged">Discharged</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search MRN, Name, Phone..."
              className="pl-9 h-9 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors text-xs font-medium"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-linear-to-r from-slate-50 via-slate-100/70 to-slate-50">
              <TableRow className="border-b border-slate-200/80">
                <TableHead className="font-bold text-slate-700 text-xs w-28 py-3.5">
                  OP / MRN
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Patient Name
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Age / Gender
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Phone
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Primary Doctor
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Blood Group
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Status
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Registered Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={8} className="py-4">
                      <div className="h-4 bg-slate-100 rounded-md w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Users className="w-8 h-8 mb-2 text-slate-300" />
                      <p className="font-bold text-slate-600 text-sm">No patients found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Adjust your search filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((pat) => {
                  const regDate = pat.createdAt
                    ? new Date(pat.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A";

                  return (
                    <TableRow
                      key={pat._id}
                      className="hover:bg-slate-50/80 transition-colors duration-150 border-b border-slate-100"
                    >
                      <TableCell className="font-mono font-bold text-slate-800 text-xs">
                        {pat.mrn}
                      </TableCell>
                      <TableCell className="text-xs font-extrabold text-slate-900">
                        {pat.name}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${pat.gender === "Male" ? "bg-blue-500" : "bg-pink-500"
                              }`}
                          />
                          {pat.gender} • {calculateAge(pat.dateOfBirth)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600 font-mono">
                        {pat.phoneNumber || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700">
                        {pat.doctor?.name ? `Dr. ${pat.doctor.name}` : "Unassigned"}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-[11px]">
                          {pat.blood || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${pat.status === "Discharged"
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : pat.status === "Critical"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                        >
                          {pat.status || "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">
                        {regDate}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>


      </div>
    </motion.div>
  );
}
