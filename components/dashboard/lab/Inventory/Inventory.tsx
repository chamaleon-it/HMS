"use client";

import React, { useState } from "react";
import LabHeader from "../LabHeader";
import {
    Warehouse,
    Search,
    Plus,
    Filter,
    AlertTriangle,
    CheckCircle2,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
const INVENTORY_ITEMS = [
    { id: 1, name: "Glucose Reagent Kit", category: "Biochemistry", batch: "BIO-2024-001", expiry: "2025-12-31", quantity: 45, unit: "Kits", status: "In Stock" },
    { id: 2, name: "HbA1c Cartridges", category: "Hematology", batch: "HEM-2024-042", expiry: "2024-10-15", quantity: 5, unit: "Box", status: "Low Stock" },
    { id: 3, name: "Urine Test Strips", category: "Clinical Pathology", batch: "CP-2023-112", expiry: "2025-06-20", quantity: 120, unit: "Vials", status: "In Stock" },
    { id: 4, name: "Needles 22G", category: "Consumables", batch: "CON-2024-888", expiry: "2027-01-01", quantity: 500, unit: "Pcs", status: "In Stock" },
    { id: 5, name: "Sample Tubes (EDTA)", category: "Consumables", batch: "CON-2024-999", expiry: "2026-05-10", quantity: 1200, unit: "Pcs", status: "In Stock" },
    { id: 6, name: "Cholesterol Reagent", category: "Biochemistry", batch: "BIO-2023-555", expiry: "2024-08-01", quantity: 2, unit: "Kits", status: "Critical" },
    { id: 7, name: "Microscope Slides", category: "Microbiology", batch: "MIC-2024-111", expiry: "N/A", quantity: 20, unit: "Box", status: "Low Stock" },
];

export default function Inventory() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const filteredItems = INVENTORY_ITEMS.filter(item =>
        (filter === "All" || item.category === filter) &&
        (item.name.toLowerCase().includes(search.toLowerCase()) || item.batch.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-[calc(100vh-80px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
            <LabHeader
                title="Lab Inventory"
                subtitle="Manage reagents, kits, and consumables"
            >
                <div className="flex items-center gap-2">
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4" /> Add Item
                    </Button>
                </div>
            </LabHeader>

            {/* Stats Overview (Simplified) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm custom-stat-card">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">5</div>
                        <div className="text-xs text-zinc-500 uppercase font-medium">In Stock Items</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm custom-stat-card">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">2</div>
                        <div className="text-xs text-zinc-500 uppercase font-medium">Low Stock Alerts</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500 shadow-sm custom-stat-card">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">7</div>
                        <div className="text-xs text-zinc-500 uppercase font-medium">Total Categories</div>
                    </div>
                </Card>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
            >
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search items, batches..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                                    <Filter className="h-4 w-4" />
                                    {filter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilter("All")}>All</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("Biochemistry")}>Biochemistry</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("Hematology")}>Hematology</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("Consumables")}>Consumables</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50">
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Batch No</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                    <TableCell className="font-medium text-zinc-900">{item.name}</TableCell>
                                    <TableCell className="text-zinc-500">{item.category}</TableCell>
                                    <TableCell className="text-zinc-500 family-mono text-xs">{item.batch}</TableCell>
                                    <TableCell className="text-zinc-500">{item.expiry}</TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-zinc-700">{item.quantity}</span>
                                        <span className="text-xs text-zinc-400 ml-1">{item.unit}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            item.status === "In Stock" ? "outline" :
                                                item.status === "Low Stock" ? "secondary" : "destructive"
                                        } className={cn(
                                            item.status === "In Stock" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                            item.status === "Low Stock" && "bg-amber-50 text-amber-700 border-amber-200",
                                            item.status === "Critical" && "bg-red-50 text-red-700 border-red-200",
                                        )}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredItems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                                        No inventory items found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </motion.div>
        </div>
    );
}
