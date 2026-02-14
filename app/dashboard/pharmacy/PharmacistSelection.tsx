import { Label } from "@/components/ui/label";
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
}

const DUMMY_PHARMACISTS: Pharmacist[] = [
    { _id: "ph001", name: "Sarah Jenkins", role: "pharmacist", email: "sarah.j@hospital.com", phoneNumber: "5550101" },
    { _id: "ph002", name: "Mike Ross", role: "pharmacist", email: "mike.r@hospital.com", phoneNumber: "5550102" },
    { _id: "ph003", name: "Emily Chen", role: "pharmacist", email: "emily.c@hospital.com", phoneNumber: "5550103" },
    { _id: "ph004", name: "David Kim", role: "pharmacist", email: "david.k@hospital.com", phoneNumber: "5550104" },
    { _id: "ph005", name: "Jessica Pearson", role: "pharmacist", email: "jessica.p@hospital.com", phoneNumber: "5550105" },
];

const PharmacistSelection: React.FC<Props> = ({ setValue, pharmacistName }) => {
    const { data: pharmacistResponse, mutate: pharmacistMutate, isLoading: pharmacistLoading } = useSWR<{
        data: PharmacistData[], message: string
    }>("/pharmacist")

    const pharmacists = pharmacistResponse?.data ?? []




    return (
        <div className="relative w-full max-w-[500px]">
            <Label className="block mb-1.5">Pharmacist Name</Label>
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
