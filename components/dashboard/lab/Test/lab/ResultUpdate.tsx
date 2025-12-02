import React, { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Beaker, FlaskConical, Save, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'



interface Props {
    r: {
        _id: string;
        patient: {
            _id: string;
            name: string;
            phoneNumber: string;
            email: string;
            gender: string;
            dateOfBirth: Date;
            conditions: string[];
            blood: string;
            allergies: string;
            address: string;
            notes: string;
            createdBy: string;
            status: string;
            mrn: string;
            createdAt: Date;
            updatedAt: Date;
        };
        doctor: {
            _id: string;
            name: string;
            specialization: string | null;
        };
        lab: {
            _id: string;
            name: string;
            specialization: string | null;
        };
        date: Date;
        priority: string;
        name: {
            code: string;
            name: string;
            unit: string;
            min?: number | undefined;
            max?: number | undefined;
            type: string;
            _id: string;
            value?: string | number;
        }[];
        sampleType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }
    mutate: () => void
}

export default function ResultUpdate({ r, mutate }: Props) {

    const [open, setOpen] = useState(false)

    const [payload, setPayload] = useState({
        _id: r._id,
        name: r.name.filter((item) => item.type === "Lab").map((item) => ({ _id: item._id, value: item.value && item?.value?.toString(), name: item.name })),
    })

    const updateResult = async () => {
        for (const item of payload.name) {
            if (!item.value || item?.value?.toString().trim() === "") {
                toast.error(`Please provide a report/image for ${item.name}`);
                return;
            }
        }

        try {
            await toast.promise(api.post("lab/report/result", payload), {
                loading: "Updating Result",
                success: "Result Updated Successfully",
                error: "Failed to Update Result"
            })

            mutate()
            setOpen(false)

        } catch (error) {
            console.log(error)
            toast.error("Failed to Update Result")
        }

    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                    Update Result
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden gap-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100/50 text-blue-600 rounded-xl">
                            <FlaskConical className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">Update Lab Results</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 mt-0.5">
                                Enter the results for the lab tests performed for <span className="font-medium text-gray-700">{r.patient.name}</span>.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-gray-50/30 max-h-[60vh] overflow-y-auto">
                    <div className="">
                        <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Test</TableHead>
                                        <TableHead className="w-[100px]">Code</TableHead>
                                        <TableHead>Result Value</TableHead>
                                        <TableHead className="text-right">Reference Range</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {r.name.filter(item => item.type === "Lab").map((labTest) => (
                                        <TableRow key={labTest._id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="font-medium flex items-center gap-3 py-3.5">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <Beaker className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm">{labTest.name}</span>
                                            </TableCell>
                                            <TableCell className="font-mono text-gray-600 text-sm py-3.5">{labTest.code}</TableCell>
                                            <TableCell className="py-3.5">
                                                <div className="relative max-w-[200px]">
                                                    <Input
                                                        value={payload.name.find((item) => item._id === labTest._id)?.value}
                                                        onChange={(e) => setPayload({ ...payload, name: payload.name.map((item) => item._id === labTest._id ? { ...item, value: e.target.value } : item) })}
                                                        type="text"
                                                        placeholder="Enter value"
                                                        className="pl-3 pr-12 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {labTest.unit}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-gray-600 py-3.5">
                                                <span className="font-mono">{labTest.min ?? "0"} - {labTest.max ?? "N/A"}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-white">
                    <DialogClose asChild>
                        <Button variant="outline" className="gap-2">
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={updateResult} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 shadow-lg">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
