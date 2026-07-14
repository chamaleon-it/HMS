import React, { useState } from "react";
import { User, BedDouble, Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useSWR from "swr";
import PatientSelection from "@/components/shared/appointment/PatientSelection";
import Select from "@/components/shared/appointment/AppointmentSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PatientForm } from "@/components/shared/patient/PatientForm";

export default function IPAdmissionDialog({ open, onOpenChange, mutate }: { open: boolean, onOpenChange: (open: boolean) => void, mutate?: () => void }) {
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [room, setRoom] = useState("");
  const [ward, setWard] = useState("");
  const [bed, setBed] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [openSelection, setOpenSelection] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const { data: doctorsData } = useSWR("/users/doctors");
  const doctors = doctorsData?.data || [];

  const handleSelectPatient = (p: any) => {
    setSelected(p);
    setPatientId(p._id);
    setInput(`${p.name}${p.mrn ? ` - (${p.mrn})` : ""}`);
    setOpenSelection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !room || !ward || !bed) {
      toast.error("Please fill all required fields (Patient, Doctor, Room, Ward, Bed)");
      return;
    }

    try {
      await toast.promise(api.post("/in-patients", {
        patientId,
        doctorId,
        room,
        ward,
        bed,
        diagnosis,
        notes,
        status: "Admitted"
      }), {
        loading: "Admitting patient...",
        success: "Patient admitted to IP successfully!",
        error: "Failed to admit patient"
      });
      if (mutate) mutate();
      onOpenChange(false);

      // Reset form after closing animation
      setTimeout(() => {
        setPatientId("");
        setDoctorId("");
        setRoom("");
        setWard("");
        setBed("");
        setDiagnosis("");
        setNotes("");
        setInput("");
        setSelected(null);
      }, 300);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl! max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Admit New Patient</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">

            {/* Section 1: Patient & Doctor */}
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-sm space-y-5 relative transition-all hover:shadow-md">
              <div className="flex items-center gap-2.5 text-(--color-synapse-light) mb-1">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-(--color-synapse-light)">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base">Patient & Doctor</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="w-full">
                  <PatientSelection
                    openCreate={openCreate}
                    setOpenCreate={setOpenCreate}
                    open={openSelection}
                    setOpen={setOpenSelection}
                    setValue={(field, val) => setPatientId(val as string)}
                    values={{ patient: patientId } as any}
                    input={input}
                    setInput={setInput}
                    handleSelect={handleSelectPatient}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </div>
                <div className="w-full">
                  <Label className="block text-slate-700 font-medium mb-1">Attending Doctor <span className="text-red-500">*</span></Label>
                  <Select
                    value={doctorId}
                    onChange={setDoctorId}
                    options={doctors.map((d: any) => ({ label: `Dr. ${d.name}`, value: d._id }))}
                    placeholder="Select Doctor"
                    className="bg-white rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Room & Bed */}
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-sm space-y-5 relative transition-all hover:shadow-md">
              <div className="flex items-center gap-2.5 text-blue-500 mb-1">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-500">
                  <BedDouble className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base">Room & Bed Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-slate-700 font-medium">Ward <span className="text-red-500">*</span></Label>
                  <Input className="bg-white border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 shadow-xs rounded-xl h-11" value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g. General Ward" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-slate-700 font-medium">Room <span className="text-red-500">*</span></Label>
                  <Input className="bg-white border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 shadow-xs rounded-xl h-11" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 101" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-slate-700 font-medium">Bed <span className="text-red-500">*</span></Label>
                  <Input className="bg-white border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 shadow-xs rounded-xl h-11" value={bed} onChange={(e) => setBed(e.target.value)} placeholder="e.g. Bed A" required />
                </div>
              </div>
            </div>

            {/* Section 3: Medical Information */}
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-sm space-y-5 relative transition-all hover:shadow-md">
              <div className="flex items-center gap-2.5 text-emerald-500 mb-1">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-500">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base">Medical Information</h3>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-slate-700 font-medium">Admission Diagnosis</Label>
                  <Input className="bg-white border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-xs rounded-xl h-11" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary reason for admission" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-slate-700 font-medium">Initial Notes</Label>
                  <Textarea className="bg-white border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-xs rounded-xl min-h-[100px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific instructions or observations..." />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-white py-4 border-t border-slate-100 -mx-6 px-6 rounded-b-lg mt-2 shadow-[0_-10px_15px_-10px_rgba(0,0,0,0.05)]">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-5">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-linear-to-r from-(--color-synapse-dark) to-[#2a2a2a] text-white px-8 shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 border border-slate-800">
                Confirm Admission <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Creation Modal inline */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
          </DialogHeader>
          <PatientForm
            patient={{ name: input }}
            onClose={async (id?: string, name?: string) => {
              setOpenCreate(false);
              if (id && name) {
                handleSelectPatient({ _id: id, name, mrn: "" });
                try {
                  const { data } = await api.get(`/patients/${id}`);
                  if (data && data.data) {
                    handleSelectPatient(data.data);
                  }
                } catch (error) {
                  console.error("Failed to fetch full patient details", error);
                }
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
