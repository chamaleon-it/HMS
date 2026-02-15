"use client";

import { useSearchParams } from "next/navigation";
import ViewBill from "../ViewBill";
import React, { Suspense } from "react";
import AppShell from "@/components/layout/app-shell";

function SingleBillContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500">
                Invalid Invoice ID
            </div>
        );
    }

    return <ViewBill id={id} />;
}

export default function SingleBillPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SingleBillContent />
        </Suspense>
    );
}
