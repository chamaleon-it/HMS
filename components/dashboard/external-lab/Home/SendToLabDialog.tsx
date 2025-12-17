"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Props {
    testName: string;
    patientName: string;
    onSuccess?: () => void;
}

export default function SendToLabDialog({ testName, patientName, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        labId: "",
        courierName: "",
        trackingNumber: "",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success(`Test sent to ${formData.labId === "lab1" ? "Sunrise Path Lab" : "City Diagnostics"}`);
            setOpen(false);
            setFormData({ labId: "", courierName: "", trackingNumber: "", notes: "" });
            if (onSuccess) onSuccess();
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Send className="h-3 w-3" />
                    Send to Lab
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Send Test to External Lab</DialogTitle>
                    <DialogDescription>
                        Assign <span className="font-medium text-foreground">{testName}</span> for <span className="font-medium text-foreground">{patientName}</span> to an external partner.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="lab">Select External Lab</Label>
                            <Select
                                value={formData.labId}
                                onValueChange={(val) => setFormData({ ...formData, labId: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a lab partner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lab1">Sunrise Path Lab</SelectItem>
                                    <SelectItem value="lab2">City Diagnostics</SelectItem>
                                    <SelectItem value="lab3">HealthCheck Plus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="courier">Courier Service</Label>
                                <Input
                                    id="courier"
                                    placeholder="e.g. FedEx, Local"
                                    value={formData.courierName}
                                    onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tracking">Tracking Number</Label>
                                <Input
                                    id="tracking"
                                    placeholder="Reference ID"
                                    value={formData.trackingNumber}
                                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes / Instructions</Label>
                            <Input
                                id="notes"
                                placeholder="Special handling instructions..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading || !formData.labId}>
                            {loading ? "Sending..." : "Confirm & Send"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
