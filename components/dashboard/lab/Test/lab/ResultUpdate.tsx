import React, { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Activity, Beaker, FlaskConical, Save, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import api from '@/lib/axios'



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
            value: string | number;
        }[];
        sampleType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }
    mutate: () => void
}

export default function ResultUpdate({ r, mutate }: Props) {


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


        } catch (error) {
            console.log(error)
            toast.error("Failed to Update Result")
        }

    }


    return (
        <Dialog>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {r.name.filter(item => item.type === "Lab").map((labTest) => (
                            <div key={labTest._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <Beaker className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{labTest.name}</h4>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{labTest.code}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 ml-1">Result Value</label>
                                        <div className="relative">
                                            <Input
                                                value={payload.name.find((item) => item._id === labTest._id)?.value}
                                                onChange={(e) => setPayload({ ...payload, name: payload.name.map((item) => item._id === labTest._id ? { ...item, value: e.target.value } : item) })}
                                                type="text"
                                                placeholder="Enter value"
                                                className="pl-3 pr-12 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {labTest.unit}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                                        <Activity className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-medium">Ref Range:</span>
                                        <span className="font-mono text-gray-600">{labTest.min ?? "0"} - {labTest.max ?? "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
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
