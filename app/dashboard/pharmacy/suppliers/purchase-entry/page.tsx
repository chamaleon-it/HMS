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

export default function BulkUpdatePage() {
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const { data } = useSWR<{
        message: string;
        data: {
            pharmacy: {
                inventory: {
                    lowStockThreshold: number;
                    expiryAlert: number;
                    allowNegativeStock: boolean;
                };
            };
        };
    }>("/users/profile");

    const pharmacyInventory = data?.data.pharmacy.inventory ?? {
        lowStockThreshold: 20,
        expiryAlert: 90,
        allowNegativeStock: false,
    };

    const [filter, setFilter] = useState<FilterType>({
        page: 1,
        limit: 50, // Show more items for bulk update
        q: undefined,
        category: undefined,
        stock: undefined,
        expiry: undefined,
        lowStockThreshold: pharmacyInventory.lowStockThreshold,
        sortBy: "name",
        order: "asc",
    });

    const { items, total, isLoading, isValidating, mutate } = useItems({
        filter,
    });

    const handleSave = async (updates: Record<string, Partial<ItemType>>) => {
        // TODO: Implement API call to save bulk updates
        // Example: await api.post('/pharmacy/items/bulk-update', { updates });
        console.log("Bulk updates to save:", updates);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refresh data after save
        mutate();
    };

    return (
        <AppShell>
            <TooltipProvider>
                <div className="p-5 min-h-[calc(100vh-80px)] w-full">
                    <div className="flex flex-col gap-6">
                        <PharmacyHeader
                            title="Purchase entry"
                            subtitle="Update multiple inventory items at once"
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
                            // onSave={handleSave}
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
                <AddSupplier onClose={() => setIsAddDrawerOpen(false)} />
            </Drawer>
        </AppShell>
    );
}
