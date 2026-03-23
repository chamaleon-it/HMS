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
    technicianName?: string;
    hideLabel?: boolean;
    className?: string;
}



const TechnicianSelection: React.FC<Props> = ({ setValue, technicianName, hideLabel, className }) => {
    const { data: technicianResponse, isLoading: technicianLoading } = useSWR<{
        data: TechnicianData[], message: string
    }>("/technician")

    const technicians = technicianResponse?.data ?? []


    useEffect(() => {
        const inCharge = technicians.find((p) => p.inCharge)
        if (inCharge) {
            setValue(inCharge.name)
        }
    }, [technicians])


    return (
        <div className={cn("relative w-full", className)}>
            {!hideLabel && <Label className="block mb-1.5">Technician Name <span className="text-xs">*</span></Label>}
            <Select
                onValueChange={(val) => {

                    setValue(val);
                }}
                value={technicianName}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                    {technicianLoading ? (
                        <div className="p-2 text-sm text-gray-500">Loading...</div>
                    ) : technicians.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No technicians found</div>
                    ) : (
                        technicians.map((p) => (
                            <SelectItem key={p._id} value={p.name}>
                                {p.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

export default TechnicianSelection;
