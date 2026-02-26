"use client";

import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Beaker, FlaskConical, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface Props {
    reportId: string;
    patientName: string;
    mutate: () => void;
}

export default function SampleCollectionModal({ reportId, patientName, mutate }: Props) {
    const [open, setOpen] = useState(false);
    const [sampleId, setSampleId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCollect = async () => {
        if (!sampleId.trim()) {
            toast.error("Please enter a Sample ID");
            return;
        }

        setLoading(true);
        try {
            await toast.promise(
                api.post(`lab/report/sample_collected/${reportId}`, { sampleId }),
                {
                    loading: "Processing...",
                    success: "Sample Collected Successfully",
                    error: "Failed to collect sample",
                }
            );
            mutate();
            setOpen(false);
            setSampleId("");
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setSampleId("");
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 gap-2 h-8 text-xs font-semibold shadow-sm transition-all duration-200"
                >
                    <FlaskConical className="w-3.5 h-3.5" />
                    Sample Collected
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Beaker className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle>Collect Sample</DialogTitle>
                            <DialogDescription>
                                Enter the Sample ID for <span className="font-semibold text-gray-900">{patientName}</span>.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="sampleId">Sample ID</Label>
                        <Input
                            id="sampleId"
                            placeholder="Enter Sample ID (e.g. S-1234)"
                            value={sampleId}
                            onChange={(e) => setSampleId(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCollect();
                            }}
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleCollect}
                        disabled={loading}
                        className="bg-linear-to-br from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Confirm Collection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
