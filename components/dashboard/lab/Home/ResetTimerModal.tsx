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
import { Clock, RotateCcw, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface Props {
    reportId: string;
    patientName: string;
    mutate: () => void;
}

const formatMinutesToHHMM = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export default function ResetTimerModal({ reportId, patientName, mutate }: Props) {
    const [open, setOpen] = useState(false);
    const [duration, setDuration] = useState(60); // minutes
    const [displayDuration, setDisplayDuration] = useState(formatMinutesToHHMM(duration));
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (duration === 0) {
            toast.error("Duration must be greater than 0");
            return;
        }

        setLoading(true);
        try {
            await toast.promise(
                api.post(`lab/report/reset_timer/${reportId}`, { duration }),
                {
                    loading: "Resetting Timer...",
                    success: "Timer Reset Successfully",
                    error: "Failed to reset timer",
                }
            );
            mutate();
            setOpen(false);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-white text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 gap-1.5 text-xs font-semibold shadow-sm transition-all duration-200"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Timer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle>Reset Timer</DialogTitle>
                            <DialogDescription>
                                Set additional reporting duration for <span className="font-semibold text-gray-900">{patientName}</span>.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="duration" className="text-sm font-medium">Extension Duration (HH:MM)</Label>
                        <Input
                            id="duration"
                            placeholder="HH:MM"
                            value={displayDuration}
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 4) val = val.slice(0, 4);
                                if (val.length >= 3)
                                    val = `${val.slice(0, 2)}:${val.slice(2)}`;
                                setDisplayDuration(val);

                                // Sync with minutes if valid
                                const match = val.match(/^(\d{1,2}):([0-5]\d)$/);
                                if (match) {
                                    const h = parseInt(match[1]);
                                    const m = parseInt(match[2]);
                                    setDuration(h * 60 + m);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleReset();
                            }}
                            className="h-9 bg-slate-50/50 border-gray-200 focus:ring-amber-500/20 focus:border-amber-500"
                            autoFocus
                        />
                        <p className="text-[11px] text-gray-500 italic">Enter the total extra time required to provide the results.</p>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50/50 px-6 py-4 -mx-6 -mb-6 border-t border-gray-100">
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={loading} className="text-gray-500 hover:text-gray-700">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleReset}
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-100"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Confirm Extension
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
