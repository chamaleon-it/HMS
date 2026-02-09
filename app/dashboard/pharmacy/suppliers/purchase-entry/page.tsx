"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import BulkUpdateTable from "./BulkUpdateTable";
import { FilterType, ItemType } from "../../inventory/interface";
import useItems from "../../inventory/useItems";
import { TableSkeleton } from "../../components/PharmacySkeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import PharmacyHeader from "../../components/PharmacyHeader";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import Drawer from "@/components/ui/drawer";
import { AddSupplier } from "../AddSupplier";

export default function PurchaseEntryPage() {
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

    const pharmacyInventory = data?.data.pharmacy.inventory ?? {
        lowStockThreshold: 20,
    };

    return (
        <AppShell>
            <TooltipProvider>
                <div className="p-5 min-h-[calc(100vh-80px)] w-full">
                    <div className="flex flex-col gap-6">
                        <PharmacyHeader
                            title="Purchase entry"
                            subtitle="Record new purchases and update inventory"
                        >
                            <Button
                                className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md font-medium"
                                onClick={() => setIsAddDrawerOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Supplier
                            </Button>
                        </PharmacyHeader>

                        {isLoading ? (
                            <TableSkeleton rows={10} columns={9} />
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
