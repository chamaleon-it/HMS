import { Button } from "@/components/ui/button";
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
import { useState, useEffect, useMemo } from "react";
import {
    AlertTriangle,
    Pencil,
    Trash,
} from "lucide-react";
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
import TestSelection from "./TestSelection";

interface EditTestProps {
    report: any;
    mutate: () => void;
}

export default function EditTest({ report, mutate }: EditTestProps) {
    const { panels } = useGetPanels();
    const { tests } = useGetTest();

    const [open, setOpen] = useState(false);
    const [payload, setPayload] = useState<{
        test: { name: string }[];
        panels: string[];
        date: Date | undefined;
        priority: string;
    }>({
        test: [],
        panels: [],
        date: undefined,
        priority: "Normal",
    });

    useEffect(() => {
        if (open) {
            setPayload({
                test: report.test?.map((t: any) => ({ name: t.name?._id || t.name })) || [],
                panels: report.panels || [],
                date: new Date(report.date || report.createdAt),
                priority: report.priority || "Normal",
            });
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!payload.date) {
            toast.error("Please select a date");
            return;
        }
        if (payload.test.length === 0) {
            toast.error("Please select at least one test");
            return;
        }

        try {
            await toast.promise(
                api.put(`/lab/report/${report._id}`, { ...payload, date: payload.date.toISOString() }),
                {
                    loading: "Updating lab test order",
                    success: ({ data }) => data?.message || "Order updated successfully",
                    error: (err) => err?.response?.data?.message || "Failed to update order",
                }
            );
            setOpen(false);
            mutate();
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={"outline"}
                    size="sm"
                    className="h-8 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-100"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="min-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit Test Order</DialogTitle>
                    <DialogDescription>Update tests for {report?.patient?.name}</DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 justify-between w-full mt-4">
                    <div className="w-[400px]">
                        <TestSelection

                            onSelect={(val) => {
                                if (!val) return;

                                // Check if it's a panel
                                const isPanel = panels.find((p) => p.name === val);
                                if (isPanel) {
                                    setPayload((prev) => {
                                        const panelExists = prev.panels.includes(val);
                                        if (panelExists) return prev;

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
                                    // Must be a test
                                    const testObj = tests.find((t) => t.name === val);
                                    if (testObj) {
                                        setPayload((prev) => {
                                            const exist = prev.test.find((n) => n.name === testObj._id);
                                            if (exist) return prev;
                                            return {
                                                ...prev,
                                                test: [...prev.test, { name: testObj._id }],
                                            };
                                        });
                                    }
                                }
                            }}
                            options={[
                                ...panels.filter((p) => !payload.panels.includes(p.name)).map(e => ({ label: e.name, value: e.name, type: 'Panel', department: e.department })),
                                ...tests
                                    .filter(
                                        (t) =>
                                            !t.panels?.find((p) => payload.panels.includes(p.name)) &&
                                            !payload.test.some((pt) => pt.name === t._id)
                                    )
                                    .map((t) => ({ label: t.name, value: t.name, type: 'Test', department: t.department })),
                            ]}
                        />
                    </div>

                    <div className="flex gap-2 items-center">
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
                        <DateTimePicker
                            date={payload.date}
                            setDate={(date) => setPayload((prev) => ({ ...prev, date }))}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SL</TableHead>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Estimate Time</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payload.panels.map((t, idx) => (
                            <TableRow key={t}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-800">{t}</span>
                                        {panels.find(p => p.name === t)?.department && <span className="text-[10px] uppercase font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{panels.find(p => p.name === t)?.department}</span>}
                                        <span className="text-[10px] uppercase font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">PANEL</span>
                                    </div>
                                </TableCell>
                                <TableCell>{formatINR(panels.find((p) => p.name === t)?.price || 0)}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setPayload((prev) => {
                                                if (!prev.panels.includes(t)) return prev;

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
                                        <Trash className="h-2 w-2 text-red-500" />
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
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-800">{tests.find((test) => test._id === t.name)?.name}</span>
                                        {tests.find((test) => test._id === t.name)?.department && <span className="text-[10px] uppercase font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{tests.find((test) => test._id === t.name)?.department}</span>}
                                        <span className="text-[10px] uppercase font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">TEST</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatINR(tests.find((test) => test._id === t.name)?.price || 0)}
                                </TableCell>
                                <TableCell>
                                    {tests.find((test) => test._id === t.name)?.estimatedTime}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant={"ghost"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setPayload((prev) => ({
                                                ...prev,
                                                test: prev.test.filter((n) => n.name !== t.name),
                                            }));
                                        }}
                                    >
                                        <Trash className="h-2 w-2 text-red-500" size={"sm"} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-end items-center mt-4 pr-4">
                    <div className="text-lg font-semibold text-gray-700">
                        Grand Total: <span className="text-blue-600">{formatINR(grandTotal)}</span>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleSubmit}
                    >
                        Update Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
