import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PharmacistData } from "./settings/Pharmacist";

type Pharmacist = {
    _id: string;
    name: string;
    phoneNumber?: string;
    role: string;
    email?: string;
};

interface Props {
    setValue: (id: string) => void;
    pharmacistName?: string;
    hideLabel?: boolean;
    className?: string;
}



const PharmacistSelection: React.FC<Props> = ({ setValue, pharmacistName, hideLabel, className }) => {
    const { data: pharmacistResponse, mutate: pharmacistMutate, isLoading: pharmacistLoading } = useSWR<{
        data: PharmacistData[], message: string
    }>("/pharmacist")

    const pharmacists = pharmacistResponse?.data ?? []




    return (
        <div className={cn("relative w-full", className)}>
            {!hideLabel && <Label className="block mb-1.5">Pharmacist Name</Label>}
            <Select
                onValueChange={(val) => {

                    setValue(val);
                }}
                value={pharmacistName}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select pharmacist" />
                </SelectTrigger>
                <SelectContent>
                    {pharmacistLoading ? (
                        <div className="p-2 text-sm text-gray-500">Loading...</div>
                    ) : pharmacists.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No pharmacists found</div>
                    ) : (
                        pharmacists.map((p) => (
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

export default PharmacistSelection;
