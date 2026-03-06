import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/auth/context/auth-context";
import {
    Calendar as CalendarIcon,
    Trash,
    Zap,
    AlertTriangle,
    User,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import useGetTest from "@/data/useGetTest";
import useGetPanels from "@/data/useGetPanels";
import LabeledCombobox from "./LabeledCombobox";
import DateTimePicker from "./DateTimePicker";
import { formatINR } from "@/lib/fNumber";

interface BookNowModalProps {
    patient: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mutate?: () => void;
    doctor?:string | null
}

const theme = {
    from: "#4f46e5",
    to: "#ec4899",
};

export default function BookNowModal({
    patient,
    open,
    onOpenChange,
    mutate,
    doctor
}: BookNowModalProps) {
    const { user } = useAuth();
    const { panels } = useGetPanels();
    const { tests } = useGetTest();

    const [bookingType, setBookingType] = useState<"Book Now" | "Schedule">(
        "Book Now"
    );

    const [payload, setPayload] = useState<{
        patient: string;
        doctor: string;
        lab: string;
        test: { name: string }[];
        panels: string[];
        date: Date | undefined;
        priority: "Normal" | "Urgent";
        sampleType: string;
        status: string;
    }>({
        patient: "",
        doctor: user?._id ?? "",
        lab: user?._id ?? "",
        test: [],
        panels: [],
        date: new Date(),
        priority: "Normal",
        sampleType: "Other",
        status: "Upcoming",
    });

    useEffect(() => {
        if (patient?._id && open) {
            setPayload((prev) => ({
                ...prev,
                patient: patient._id,
                doctor: doctor ||  user?._id || "",
                lab: user?._id ?? "",
                test: [],
                panels: [],
                date: new Date(),
                priority: "Normal",
            }));
        }
    }, [patient, open, user]);

    const tabs = [
        { key: "Book Now", label: "Book Now", icon: Zap },
        { key: "Schedule", label: "Schedule", icon: CalendarIcon },
    ] as const;

    const handleSubmit = async () => {
        if (!payload.patient) {
            toast.error("Patient details missing");
            return;
        }
        let submitDate = payload.date;
        if (bookingType === "Book Now") {
            submitDate = new Date();
        }

        if (!submitDate) {
            toast.error("Please select a date");
            return;
        }
        if (payload.test.length === 0 && payload.panels.length === 0) {
            toast.error("Please select at least one test or panel");
            return;
        }

        try {
            await toast.promise(
                api.post("/lab/report", { ...payload, date: submitDate.toISOString() }),
                {
                    loading: "Creating lab test order...",
                    success: ({ data }) => data.message,
                    error: ({ response }) => response.data.message,
                }
            );
            onOpenChange(false);
            mutate?.();
        } catch (error) {
            console.log(error);
        }
    };

    const grandTotal = useMemo(() => {
        const panelsTotal = payload.panels.reduce((acc, panelName) => {
            const panel = panels.find((p) => p.name === panelName);
            return acc + (panel?.price || 0);
        }, 0);

        const independentTestsTotal = payload.test
            .filter((t) => {
                const testObj = tests.find((test) => test._id === t.name);
                const belongsToPanel = testObj?.panels?.some((p) =>
                    payload.panels.includes(p.name)
                );
                return !belongsToPanel;
            })
            .reduce((acc, t) => {
                const testObj = tests.find((test) => test._id === t.name);
                return acc + (testObj?.price || 0);
            }, 0);

        return panelsTotal + independentTestsTotal;
    }, [payload.panels, payload.test, panels, tests]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-4xl">
                <DialogHeader>
                    <DialogTitle>Quick Test Booking</DialogTitle>
                    <DialogDescription>Create a new lab order for {patient?.name}</DialogDescription>
                </DialogHeader>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{patient?.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{patient?.mrn} • {patient?.phoneNumber}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 shadow-xs">
                            {tabs.map(({ key, label, icon: Icon }) => {
                                const active = bookingType === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setBookingType(key)}
                                        className={
                                            "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium " +
                                            (active ? "text-white" : "text-gray-600 hover:bg-slate-50")
                                        }
                                        type="button"
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="tab-indicator-book-now"
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    background: "linear-gradient(90deg,#4f46e5,#d946ef)",
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 40,
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon size={16} /> {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-between w-full">
                    <div className="flex-1">
                        <LabeledCombobox
                            label="Select a Test or Panel"
                            value=""
                            clearOnSelect={true}
                            onSelect={(val) => {
                                if (!val) return;

                                const isPanel = panels.find((p) => p.name === val);
                                if (isPanel) {
                                    setPayload((prev) => {
                                        if (prev.panels.includes(val)) return prev;
                                        const newTests = tests
                                            .filter((t) => t.panels?.some((p) => p.name === val))
                                            .map((t) => ({ name: t._id }));

                                        return {
                                            ...prev,
                                            panels: [...prev.panels, val],
                                            test: [
                                                ...prev.test,
                                                ...newTests.filter(
                                                    (nt) => !prev.test.some((pt) => pt.name === nt.name)
                                                ),
                                            ],
                                        };
                                    });
                                } else {
                                    const testObj = tests.find((t) => t.name === val);
                                    if (testObj) {
                                        setPayload((prev) => {
                                            if (prev.test.find((n) => n.name === testObj._id)) return prev;
                                            return {
                                                ...prev,
                                                test: [...prev.test, { name: testObj._id }],
                                            };
                                        });
                                    }
                                }
                            }}
                            options={[
                                ...panels.filter((p) => !payload.panels.includes(p.name)).map(e => e.name),
                                ...tests
                                    .filter(
                                        (t) =>
                                            !t.panels?.find((p) => payload.panels.includes(p.name)) &&
                                            !payload.test.some((pt) => pt.name === t._id)
                                    )
                                    .map((t) => t.name),
                            ]}
                        />
                    </div>

                    <div className="flex gap-2 items-end pb-0.5">
                        <Button
                            type="button"
                            variant={payload.priority === "Urgent" ? "default" : "outline"}
                            className={payload.priority === "Urgent" ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-amber-200 text-amber-600 hover:bg-amber-50"}
                            onClick={(e) => {
                                e.preventDefault();
                                setPayload(prev => ({ ...prev, priority: prev.priority === "Urgent" ? "Normal" : "Urgent" }));
                            }}
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Urgent
                        </Button>
                        {bookingType === "Schedule" && (
                            <DateTimePicker
                                date={payload.date}
                                setDate={(date) => setPayload((prev) => ({ ...prev, date }))}
                            />
                        )}
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-12">SL</TableHead>
                                <TableHead>Test Name</TableHead>
                                <TableHead className="text-right w-32">Price</TableHead>
                                <TableHead className="w-20 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payload.panels.length === 0 && payload.test.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                                        No tests selected. Please select a test from the dropdown above.
                                    </TableCell>
                                </TableRow>
                            )}
                            {payload.panels.map((t, idx) => (
                                <TableRow key={t}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell className="font-medium text-slate-900">
                                        <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded border border-indigo-100 mr-2 uppercase font-bold">Panel</span>
                                        {t}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatINR(panels.find((p) => p.name === t)?.price || 0)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                setPayload((prev) => {
                                                    const relatedTestIds = new Set(
                                                        tests
                                                            .filter((test) =>
                                                                test.panels?.some((panel) => panel.name === t)
                                                            )
                                                            .map((test) => test._id)
                                                    );

                                                    return {
                                                        ...prev,
                                                        panels: prev.panels.filter((panel) => panel !== t),
                                                        test: prev.test.filter(
                                                            (testItem) => !relatedTestIds.has(testItem.name)
                                                        ),
                                                    };
                                                });
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {payload.test.filter(t => {
                                const found = tests.find((test) => test._id === t.name)
                                const panelExist = found?.panels?.find(p => payload.panels.includes(p.name))
                                return !panelExist
                            }).map((t, idx) => (
                                <TableRow key={t.name}>
                                    <TableCell>{payload.panels.length + idx + 1}</TableCell>
                                    <TableCell className="text-slate-700">
                                        {tests.find((test) => test._id === t.name)?.name}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatINR(tests.find((test) => test._id === t.name)?.price || 0)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                setPayload((prev) => ({
                                                    ...prev,
                                                    test: prev.test.filter((n) => n.name !== t.name),
                                                }));
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end items-center px-4 py-2 bg-slate-50/50 rounded-lg">
                    <div className="text-lg font-bold text-slate-800">
                        Grand Total: <span className="text-indigo-600 ml-2">{formatINR(grandTotal)}</span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="outline" className="px-8">Cancel</Button>
                    </DialogClose>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                        onClick={handleSubmit}
                    >
                        Confirm Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
