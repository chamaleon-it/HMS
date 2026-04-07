"use client";
import LabHeader from "../LabHeader";
import TestCatalogue from "@/app/dashboard/lab/settings/TestCatalogue";
import useSWR from "swr";
import { ProfileType } from "@/app/dashboard/lab/settings/interface";

export default function Inventory() {
    const { data: ProfileData, mutate: profileMutate } = useSWR<{
        message: string;
        data: ProfileType;
    }>("/users/profile");
    const profile = ProfileData?.data;

    return (
        <div className="min-h-[calc(100vh-80px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
            <LabHeader
                title="Lab Inventory"
                subtitle="Manage reagents, kits and consumables."
            />

            <TestCatalogue profile={profile} profileMutate={profileMutate} />
        </div>
    );
}
