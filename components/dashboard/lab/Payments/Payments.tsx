"use client";

import React, { useState } from "react";
import useSWR from "swr";
import LabHeader from "../LabHeader";
import {
    Banknote,
    CreditCard,
    Wallet,
    TrendingUp,
    Calendar,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/fNumber";

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    colorClass: string;
    iconBgClass: string;
    borderClass: string;
    delay: number;
}> = ({ icon, label, value, subtext, colorClass, iconBgClass, borderClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
        <Card className={cn(
            "relative overflow-hidden border-zinc-200/60 transition-all duration-300 shadow-sm hover:shadow-md",
            borderClass
        )}>
            <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
            <div className="relative p-5 flex items-center gap-5">
                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 shrink-0",
                    iconBgClass
                )}>{icon}</div>
                <div>
                    <div className="text-3xl font-bold tracking-tight text-zinc-900">{value}</div>
                    <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
                    {subtext && <div className="text-xs text-zinc-400 mt-1">{subtext}</div>}
                </div>
            </div>
        </Card>
    </motion.div>
);

export default function Payments() {
    const { data: billingData } = useSWR<{
        message: string;
        data: {
            _id: string;
            mrn: string;
            createdAt: string;
            cash: number;
            online: number;
            insurance: number;
            items: {
                total: number;
            }[];
            patient: {
                name: string;
                mrn: string;
            };
        }[];
    }>("/billing");

    const bills = billingData?.data ?? [];

    const totalCash = bills.reduce((acc, bill) => acc + (bill.cash || 0), 0);
    const totalOnline = bills.reduce((acc, bill) => acc + (bill.online || 0), 0);
    const totalInsurance = bills.reduce((acc, bill) => acc + (bill.insurance || 0), 0);
    const totalCollection = totalCash + totalOnline + totalInsurance;

    return (
        <div className="min-h-[calc(100vh-80px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-8">
            <LabHeader
                title="Payments"
                subtitle="Financial overview and daily collection analysis"
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(), "MMMM yyyy")}
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </LabHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    delay={0.1}
                    icon={<Wallet className="h-7 w-7" />}
                    label="Total Revenue"
                    value={formatINR(totalCollection)}
                    subtext="+12% from last month"
                    colorClass="from-indigo-500/10 to-indigo-500/5"
                    iconBgClass="bg-indigo-100 text-indigo-600"
                    borderClass="hover:border-indigo-200"
                />
                <StatCard
                    delay={0.2}
                    icon={<Banknote className="h-7 w-7" />}
                    label="Cash Collection"
                    value={formatINR(totalCash)}
                    subtext={`${((totalCash / (totalCollection || 1)) * 100).toFixed(1)}% of total`}
                    colorClass="from-emerald-500/10 to-emerald-500/5"
                    iconBgClass="bg-emerald-100 text-emerald-600"
                    borderClass="hover:border-emerald-200"
                />
                <StatCard
                    delay={0.3}
                    icon={<CreditCard className="h-7 w-7" />}
                    label="Digital Payments"
                    value={formatINR(totalOnline)}
                    subtext={`${((totalOnline / (totalCollection || 1)) * 100).toFixed(1)}% of total`}
                    colorClass="from-blue-500/10 to-blue-500/5"
                    iconBgClass="bg-blue-100 text-blue-600"
                    borderClass="hover:border-blue-200"
                />
                <StatCard
                    delay={0.4}
                    icon={<TrendingUp className="h-7 w-7" />}
                    label="Insurance / Due"
                    value={formatINR(totalInsurance)}
                    subtext={`${((totalInsurance / (totalCollection || 1)) * 100).toFixed(1)}% of total`}
                    colorClass="from-amber-500/10 to-amber-500/5"
                    iconBgClass="bg-amber-100 text-amber-600"
                    borderClass="hover:border-amber-200"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg text-zinc-900">Recent Transactions</h3>
                            <p className="text-sm text-zinc-500">Latest billing activity</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent bg-zinc-50/50">
                                    <TableHead>Bill No</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Mode</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.slice(0, 5).map((bill) => (
                                    <TableRow key={bill._id} className="hover:bg-zinc-50/50">
                                        <TableCell className="font-medium text-xs text-zinc-500">#{bill._id.substring(0, 8)}</TableCell>
                                        <TableCell className="font-semibold">{bill.patient.name}</TableCell>
                                        <TableCell className="text-zinc-500">{format(new Date(bill.createdAt), "dd MMM, HH:mm")}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {bill.cash > 0 && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Cash</span>}
                                                {bill.online > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Online</span>}
                                                {bill.insurance > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Ins</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-zinc-700">
                                            ${(bill.cash + bill.online + bill.insurance).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {bills.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-zinc-400">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col gap-6"
                >
                    <div>
                        <h3 className="font-semibold text-lg text-zinc-900">Breakdown</h3>
                        <p className="text-sm text-zinc-500">Payment method distribution</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-zinc-700">Cash</span>
                                <span className="text-zinc-500">{((totalCash / (totalCollection || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(totalCash / (totalCollection || 1)) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-zinc-700">Online / Card</span>
                                <span className="text-zinc-500">{((totalOnline / (totalCollection || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(totalOnline / (totalCollection || 1)) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-zinc-700">Insurance</span>
                                <span className="text-zinc-500">{((totalInsurance / (totalCollection || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(totalInsurance / (totalCollection || 1)) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-zinc-100">
                        <Button className="w-full" variant="secondary">View Detailed Report</Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
