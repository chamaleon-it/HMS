import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fAge } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import useSWR from "swr";

type Patient = {
  _id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: Date;
  address: string;
  mrn: string;
};

interface Props {
  setValue: UseFormSetValue<{
    patient: string;
    doctor: string;
    method: string;
    date: string;
    isPaid: string;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    type?: string | undefined;
  }>;
  values: {
    patient: string;
    doctor: string;
    method: string;
    date: string;
    isPaid: string;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    type?: string | undefined;
  };
}

const PatientSelection = ({ setValue, values }: Props) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: patientData, isLoading } = useSWR<{
    data: Patient[];
  }>(`/patients?limit=5&page=1${query ? `&query=${query}` : ""}`);

  const patients = patientData?.data ?? [];

  const handleSelect = (patient: Patient) => {
    setSelected(patient);
    setIsOpen(false);
    setQuery(patient.name);
    setValue("patient", patient._id);
  };

  useEffect(() => {
    if (!values.patient) {
      setQuery("");
    }
  }, [values.patient]);

  return (
    <div className="relative w-full">
      <Label className=" block">Patient Name</Label>
      <Input
        placeholder="Search or type new"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full mt-2.5"
      />

      {isOpen && query && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : patients.length > 0 ? (
              patients.map((p) => (
                <div
                  key={p._id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && handleSelect(p)
                  }
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border bg-white/80 px-3 py-2.5",
                    "hover:bg-zinc-50 hover:shadow-sm transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30",
                    selected?._id === p._id && "bg-primary/5 border-primary/30"
                  )}
                  onClick={() => handleSelect(p)}
                >
                  {/* Main */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex gap-1.5 items-center">
                        <p className="truncate font-medium text-zinc-900">
                          {p.name}
                        </p>
                        <p className="text-sm font-medium">({p.mrn})</p>
                      </div>
                      {p.phoneNumber ? (
                        <p
                          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-zinc-700
                     hover:bg-zinc-50 hover:text-zinc-900"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{p.phoneNumber}</span>
                        </p>
                      ) : null}
                    </div>

                    {/* Meta pills */}
                    <div className=" flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                        {fAge(p.dateOfBirth)} yrs
                      </span>
                      {p.gender ? (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                          {p.gender}
                        </span>
                      ) : null}
                    </div>

                    {p.address ? (
                      <div className="mt-1.5 flex items-start gap-1.5 text-xs text-zinc-500">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p className="line-clamp-1">{p.address}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">
                No patients found. Please register a patient first.
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default PatientSelection;
