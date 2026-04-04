import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React, { useEffect, useEffectEvent, useState } from "react";
import useSWR from "swr";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TechnicianData } from "@/app/dashboard/lab/settings/Technician";




interface Props {
    setValue: (id: string) => void;
    doctor?: string;
    hideLabel?: boolean;
    className?: string;
}

interface DoctorData {
    _id: string;
    name: string;
}

const DoctorSelection: React.FC<Props> = ({ setValue, doctor, hideLabel, className }) => {
    const { data: doctorResponse, isLoading: doctorLoading } = useSWR<{
        data: DoctorData[], message: string
    }>("/users/doctors")

    const doctors = doctorResponse?.data ?? []

    return (
        <div className={cn("relative w-full", className)}>
            {!hideLabel && <Label className="block mb-1.5">Doctor Name</Label>}
            <Select
                onValueChange={(val) => {

                    setValue(val === "self" ? "" : val);
                }}
                value={doctor}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                    {doctorLoading ? (
                        <div className="p-2 text-sm text-gray-500">Loading...</div>
                    ) : doctors.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No doctors found</div>
                    ) : (
                        <>
                            <SelectItem value="self">
                                Self
                            </SelectItem>
                            {doctors.map((p) => (
                                <SelectItem key={p._id} value={p._id}>
                                    Dr. {p.name}
                                </SelectItem>
                            ))}
                        </>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

export default DoctorSelection;
