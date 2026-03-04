"use client";

import { useState, useEffect } from "react";
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
import LabeledCombobox from "./LabeledCombobox";

interface Props {
    reportId: string;
    patientName: string;
    mutate: () => void;
}

export default function SampleCollectionModal({ reportId, patientName, mutate }: Props) {
    const [open, setOpen] = useState(false);
    const [samples, setSamples] = useState<{ id: string; specimen: string }[]>([{ id: "", specimen: "Blood" }]);
    const [loading, setLoading] = useState(false);

    const defaultSpecimens = ["Blood", "Urine", "Stool", "Sputum", "Saliva", "Swab", "Semen"];
    const [specimenOptions, setSpecimenOptions] = useState<string[]>(defaultSpecimens);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("customSpecimens");
            if (saved) {
                setSpecimenOptions(JSON.parse(saved));
            }
        } catch (error) {
            console.error(error);
        }
    }, [open]);

    const handleCollect = async () => {
        const validSamples = samples.filter(s => s.id.trim() !== "");
        if (validSamples.length === 0) {
            toast.error("Please enter at least one Sample ID");
            return;
        }

        const finalSampleId = validSamples.map(s => `${s.id.trim()} (${s.specimen.trim()})`).join(", ");

        setLoading(true);
        try {
            await toast.promise(
                api.post(`lab/report/sample_collected/${reportId}`, { sampleId: finalSampleId }),
                {
                    loading: "Processing...",
                    success: "Sample Collected Successfully",
                    error: "Failed to collect sample",
                }
            );
            mutate();
            setOpen(false);
            setSamples([{ id: "", specimen: "Blood" }]);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setSamples([{ id: "", specimen: "Blood" }]);
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
            <DialogContent className="sm:max-w-[550px]">
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

                <div className="py-4">
                    <div className="border rounded-md" style={{ overflow: "visible" }}>
                        <table className="w-full text-sm text-left border-collapse" style={{ overflow: "visible" }}>
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 font-medium w-12 text-center border-b">Sl No.</th>
                                    <th className="px-4 py-3 font-medium border-b">Sample ID</th>
                                    <th className="px-4 py-3 font-medium border-b">Specimen</th>
                                    <th className="px-4 py-3 font-medium w-16 text-center border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {samples.map((sample, index) => (
                                    <tr key={index} className="bg-white hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-center text-gray-500 font-medium">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <Input
                                                placeholder="e.g. S-1234"
                                                value={sample.id}
                                                className="h-[50px] rounded-xl border-slate-200 bg-white px-3 text-sm focus-visible:border-emerald-400 focus-visible:ring-1 focus-visible:ring-emerald-400"
                                                onChange={(e) => {
                                                    const newSamples = [...samples];
                                                    newSamples[index].id = e.target.value;
                                                    setSamples(newSamples);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && index === samples.length - 1) {
                                                        setSamples([...samples, { id: "", specimen: "Blood" }]);
                                                    }
                                                }}
                                                autoFocus={index === 0}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-[200px] z-10">
                                                <LabeledCombobox
                                                    label="Specimen"
                                                    value={sample.specimen}
                                                    options={specimenOptions}
                                                    onChange={(val) => {
                                                        const newSamples = [...samples];
                                                        newSamples[index].specimen = val;
                                                        setSamples(newSamples);
                                                    }}
                                                    onSelect={(val) => {
                                                        // Persist new custom specimen names globally only on explicit selection
                                                        const trimmedVal = val.trim();
                                                        if (trimmedVal && !specimenOptions.find(o => o.toLowerCase() === trimmedVal.toLowerCase())) {
                                                            const newOptions = [...specimenOptions, trimmedVal];
                                                            setSpecimenOptions(newOptions);
                                                            try {
                                                                localStorage.setItem("customSpecimens", JSON.stringify(newOptions));
                                                            } catch (e) {
                                                                console.error("Failed to save custom specimens", e);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (samples.length > 1) {
                                                        setSamples(samples.filter((_, i) => i !== index));
                                                    } else {
                                                        setSamples([{ id: "", specimen: "Blood" }]);
                                                    }
                                                }}
                                                className="h-8 w-8 p-0 hover:bg-red-50"
                                                title="Remove"
                                            >
                                                <X className="w-4 h-4 text-red-500 hover:text-red-700" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSamples([...samples, { id: "", specimen: "Blood" }])}
                        className="mt-4 w-full border-dashed text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 h-9 font-medium"
                    >
                        + Add Another Sample
                    </Button>
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
