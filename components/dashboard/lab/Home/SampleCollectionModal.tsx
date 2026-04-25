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
import { Beaker, FlaskConical, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import LabeledCombobox from "./LabeledCombobox";

interface Props {
    reportId: string;
    patientName: string;
    mutate: () => void;
    autoGenerateSampleId?: boolean;
}

const generateAutoNumber = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 90) + 10;
    return `${day}${hours}${minutes}${sequence}`;
};

export default function SampleCollectionModal({ reportId, patientName, mutate, autoGenerateSampleId }: Props) {
    const getNewId = () => autoGenerateSampleId ? generateAutoNumber() : "";
    const [open, setOpen] = useState(false);
    const [samples, setSamples] = useState<{ id: string; specimen: string }[]>([{ id: getNewId(), specimen: "Blood" }]);
    const [loading, setLoading] = useState(false);

    const [sampleType, setSampleType] = useState("")

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

    // Keep hidden rows synchronised with the toggle state updates
    useEffect(() => {
        if (!open) {
            setSamples([{ id: getNewId(), specimen: "Blood" }]);
        }
    }, [autoGenerateSampleId, open]);

    const handleCollect = async () => {
        const samplesToProcess = samples;

        // Check for duplicates within the current input list (ignoring empty strings)
        const ids = samplesToProcess.map(s => s.id.trim()).filter(id => id !== "");
        const hasDuplicates = new Set(ids).size !== ids.length;
        if (hasDuplicates) {
            toast.error("Cannot collect samples. There are identical Sample IDs in the list.", { id: 'duplicate-sample-error' });
            return;
        }

        setLoading(true);

        try {

            try {
                const checkRes = await api.get('/lab/report');
                const allReports = checkRes.data?.data || [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                for (const sample of samplesToProcess) {
                    const val = sample.id.trim();
                    if (!val) continue;

                    const isGlobalDuplicate = allReports.some((r: any) => {
                        if (r._id === reportId) return false;
                        if (!r.sampleId) return false;

                        const reportDate = new Date(r.createdAt);
                        if (reportDate < today) return false;

                        const regex = new RegExp(`\\b${val}\\b`, 'i');
                        return regex.test(r.sampleId);
                    });

                    if (isGlobalDuplicate) {
                        toast.error(`Warning: Sample ID "${val}" is already assigned to another test today.`, { id: 'duplicate-sample-error' });
                        setLoading(false);
                        return; // Halt submission
                    }
                }
            } catch (err) {
                console.error("Failed to fetch reports for duplicate check", err);
            }

            const finalSampleId = samplesToProcess.map(s => {
                const idStr = s.id.trim();
                return idStr ? `${idStr} (${s.specimen.trim()})` : s.specimen.trim();
            }).join(", ");

            await toast.promise(
                api.post(`lab/report/sample_collected/${reportId}`, { sampleId: finalSampleId, sampleType }),
                {
                    loading: "Processing...",
                    success: "Sample Collected Successfully",
                    error: "Failed to collect sample",
                }
            );
            mutate();
            setOpen(false);
            setSamples([{ id: getNewId(), specimen: "Blood" }]);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setSamples([{ id: getNewId(), specimen: "Blood" }]);
            }
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

                <div className="py-4 space-y-4">
                    {/* <div className="grid gap-2">
                        <Label htmlFor="sample-type" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                            Sample Type
                        </Label>
                        <Input
                            id="sample-type"
                            type="text"
                            placeholder="Sample Type"
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-sm focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all duration-200"
                            value={sampleType}
                            onChange={(e) => setSampleType(e.target.value)}
                        />
                    </div> */}

                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm" style={{ overflow: "visible" }}>
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
                                                        setSamples([...samples, { id: getNewId(), specimen: "Blood" }]);
                                                    }
                                                }}
                                                onBlur={async (e) => {
                                                    const val = e.target.value.trim();
                                                    if (!val) return;

                                                    // 1. Check local duplicates
                                                    const isDuplicate = samples.some((s, i) => i !== index && s.id.trim() === val);
                                                    if (isDuplicate) {
                                                        toast('Warning: Sample ID is already assigned in this list.', {
                                                            id: 'duplicate-sample-error',
                                                            icon: '⚠️',
                                                            style: {
                                                                background: '#fffbeb',
                                                                color: '#b45309',
                                                                border: '1px solid #fcd34d'
                                                            },
                                                        });
                                                        return;
                                                    }

                                                    // 2. Check global duplicates using the generic reports endpoint
                                                    try {
                                                        const res = await api.get('/lab/report');
                                                        const allReports = res.data?.data || [];

                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);

                                                        const isGlobalDuplicate = allReports.some((r: any) => {
                                                            if (r._id === reportId) return false;
                                                            if (!r.sampleId) return false;

                                                            const reportDate = new Date(r.createdAt);
                                                            if (reportDate < today) return false;

                                                            const regex = new RegExp(`\\b${val}\\b`, 'i');
                                                            return regex.test(r.sampleId);
                                                        });

                                                        if (isGlobalDuplicate) {
                                                            toast(`Warning: Sample ID "${val}" is already taken today.`, {
                                                                id: 'duplicate-sample-error',
                                                                icon: '⚠️',
                                                                style: {
                                                                    background: '#fee2e2',
                                                                    color: '#991b1b',
                                                                    border: '1px solid #fca5a5'
                                                                },
                                                            });
                                                        }
                                                    } catch (err) {
                                                        // Ignore background check errors
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
                                            {samples.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        const newSamples = samples.filter((_, i) => i !== index);
                                                        setSamples(newSamples.length ? newSamples : [{ id: getNewId(), specimen: "Blood" }]);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 transition-[#000000] p-1 rounded-md hover:bg-red-50"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
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
                        onClick={() => setSamples([...samples, { id: getNewId(), specimen: "Blood" }])}
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