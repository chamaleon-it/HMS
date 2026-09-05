"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import BulkUpdateTable from "../BulkUpdateTable";
import { TooltipProvider } from "@/components/ui/tooltip";
import PharmacyHeader from "../../components/PharmacyHeader";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Drawer from "@/components/ui/drawer";
import { AddSupplier } from "../../suppliers/AddSupplier";
import { useRouter } from "next/navigation";

export default function NewPurchaseEntryPage() {
    const router = useRouter();
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const { data, isLoading, mutate } = useSWR<{
        message: string;
        data: {
            pharmacy: {
                inventory: {
                    lowStockThreshold: number;
                };
            };
        };
    }>("/users/profile");

    const pharmacyInventory = data?.data?.pharmacy?.inventory ?? {
        lowStockThreshold: 20,
    };

    return (
        <AppShell>
            <TooltipProvider>
                <div className="p-5 min-h-[calc(100vh-67px)] w-full">
                    <div className="flex flex-col gap-6">
                        <PharmacyHeader
                            title="New Purchase Entry"
                            subtitle="Record new purchases, batches, and update pharmacy inventory"
                        >
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="font-medium hover:bg-slate-100"
                                    onClick={() => router.push("/dashboard/pharmacy/purchase-entry")}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Purchase Entries
                                </Button>
                                <Button
                                    className="bg-(--color-synapse-light) text-white shadow-md font-semibold"
                                    onClick={() => setIsAddDrawerOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Supplier
                                </Button>
                            </div>
                        </PharmacyHeader>

                        {isLoading ? (
                            <></>
                        ) : (
                            <BulkUpdateTable
                                items={[]}
                                lowStockThreshold={pharmacyInventory.lowStockThreshold}
                            />
                        )}
                    </div>
                </div>
            </TooltipProvider>

            <Drawer
                open={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Add New Supplier"
            >
                <AddSupplier onClose={() => setIsAddDrawerOpen(false)} onRefresh={() => mutate()} />
            </Drawer>
        </AppShell>
    );
}
