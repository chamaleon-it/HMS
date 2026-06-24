import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fDate } from "@/lib/fDateAndTime";
import React from "react";
import useSWR from "swr";
import ConsultationDetails from "./ConsultationDetails";
import { Badge } from "@/components/ui/badge";

export default function History({ patientId }: { patientId: string }) {
  const {
    data: consultingData,
    isLoading
  } = useSWR<{ message: string; data: Consultations[] }>(
    `/consultings/patient/${patientId}`
  );

  const consultations = consultingData?.data ?? [];


  if (isLoading) {
    <div className="mt-4">Loading...!</div>;
  }

  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<Consultations | null>(null);

  return (
    <>

      <Table className='rounded-2xl overflow-hidden'>
        <TableHeader>
          <TableRow className='bg-slate-700 hover:bg-slate-700'>
            <TableHead className='text-white'>SL</TableHead>
            <TableHead className='text-white'>Date</TableHead>
            <TableHead className='text-white'>Doctor</TableHead>
            <TableHead className='text-white'>Medicine</TableHead>
            <TableHead className='text-white'>Diagnosis</TableHead>
            <TableHead className='text-white'>Action</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {
            consultations?.map((consulting, index) => (
              <TableRow key={consulting._id}>
                <TableCell>{String(index + 1).padStart(2, '0')}</TableCell>
                <TableCell>
                  {fDate(consulting.createdAt)}
                </TableCell>
                <TableCell>
                  {consulting.doctor.name}
                </TableCell>

                <TableCell className="max-w-[300px]">
                  <div className="flex flex-wrap gap-1">
                    {consulting.medicines.map((m, i) => (
                      <Badge
                        key={m._id ?? i}
                        variant="secondary"
                        className="font-normal text-xs whitespace-nowrap"
                      >
                        {m.name.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {consulting.consultationNotes.diagnosis}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                      setSelectedRow(consulting)
                      setOpen(true)
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>

      </Table>
      <ConsultationDetails
        selectedRow={selectedRow}
        open={open}
        onOpenChange={setOpen}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export interface Consultations {
  _id: string;
  patient: Patient;
  appointment: Appointment;
  doctor: Doctor;
  consultationNotes: ConsultationNotes;
  examinationNote: ExaminationNote;
  medicines: Medicine[];
  advice: string;
  followUp: Date;
  test: Test[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  _id: string;
  patient: string;
  doctor: string;
  createdBy: string;
  method: string;
  date: Date;
  notes: string;
  internalNotes: string;
  type: string;
  status: string;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationNotes {
  presentHistory: string;
  pastHistory: string;
  diagnosis: string;
  _id: string;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
}

export interface ExaminationNote {
  hr: string;
  bp: string;
  spo2: string;
  temp: string;
  rs: string;
  cvs: string;
  pa: string;
  cns: string;
  otherNotes: string;
  _id: string;
  tempUnit: string;
}

export interface Medicine {
  name: {
    name: string;
    _id: string;
  };
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  _id: string;
}

export interface Patient {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  gender: string;
  dateOfBirth: Date;
  conditions: string[];
  blood: string;
  allergies: string;
  address: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  name: {
    name: string
  }[];
  date: Date;
  lab: string;
  slot: string;
  priority: string;
  _id: string;
}
