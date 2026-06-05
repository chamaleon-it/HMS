import { fAge } from "@/lib/fDateAndTime";
import { MapPin, MousePointerClick, Phone, X } from "lucide-react";

interface ExistingPatientCardProps {
    patient: {
        _id: string;
        name: string;
        phoneNumber: string;
        email: string;
        gender: "Male" | "Female" | "Other";
        dateOfBirth: Date;
        address: string;
        mrn: string;
        blood: string;
    };
    onSelect: (id: string, name: string) => void;
    onDismiss: () => void;
}

export default function ExistingPatientCard({
    patient,
    onSelect,
    onDismiss,
}: ExistingPatientCardProps) {
    return (
        <div
            className="absolute top-[calc(100%+4px)] left-0 w-full z-50 p-3 border rounded-xl shadow-xl bg-white cursor-pointer hover:border-indigo-300 transition-colors group"
            onClick={() => onSelect(patient._id, patient.name)}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                }}
                className="absolute top-2 right-2 p-1 bg-white border shadow-sm rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all z-20"
                role="button"
                aria-label="Dismiss suggestion"
            >
                <X className="h-3 w-3" />
            </div>

            <div className="absolute -top-2 left-3 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                Are you looking for this customer?
            </div>

            <div className="flex items-start justify-between gap-3 pt-2">
                <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                        {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 text-sm">
                                {patient.name}
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">
                                ({patient.mrn})
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium">
                                {fAge(new Date(patient.dateOfBirth)).years}y {fAge(new Date(patient.dateOfBirth)).months}m
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-medium">
                                {patient.gender}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-slate-50">
                    <Phone className="h-3 w-3 text-slate-500" />
                    <span className="text-xs font-medium text-slate-700">
                        {patient.phoneNumber}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed">
                <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs truncate max-w-[200px]">
                        {patient.address || "No address provided"}
                    </span>
                </div>
                <MousePointerClick className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
        </div>
    );
}
