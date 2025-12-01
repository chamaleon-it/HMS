import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import configuration from '@/config/configuration';
import api from '@/lib/axios';
import { ImageIcon, Save, Scan, Upload, X } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';


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
            value: string | number
        }[];
        sampleType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }
}

export default function ResultUpdate({ r }: Props) {


    const [payload, setPayload] = useState({
        _id: r._id,
        name: r.name.filter((item) => item.type === "Imaging").map((item) => ({ _id: item._id, value: item.value.toString(), name: item.name })),
    })

    const updateResult = async () => {
        for (const item of payload.name) {
            if (!item.value || item.value.toString().trim() === "") {
                toast.error(`Please provide a report/image for ${item.name}`);
                return;
            }
        }

        try {
            const { data } = await toast.promise(api.post("lab/report/result", payload), {
                loading: "Updating Result",
                success: "Result Updated Successfully",
                error: "Failed to Update Result"
            })

            console.log(data)


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
                        <div className="p-2.5 bg-purple-100/50 text-purple-600 rounded-xl">
                            <Scan className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">Update Imaging Results</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 mt-0.5">
                                Upload the imaging reports and files for <span className="font-medium text-gray-700">{r.patient.name}</span>.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-gray-50/30 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {r.name.filter(item => item.type === "Imaging").map((test) => (
                            <div key={test._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-fuchsia-50 text-fuchsia-600 rounded-lg group-hover:bg-fuchsia-100 transition-colors">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{test.name}</h4>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{test.code}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 ml-1">Upload Report/Image</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Upload className="h-4 w-4 text-gray-400 group-hover/input:text-purple-500 transition-colors" />
                                            </div>
                                            <Input
                                                type="file"
                                                className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 text-xs text-gray-600"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        const { data } = await toast.promise(
                                                            api.post('/uploads', formData),
                                                            {
                                                                loading: 'Uploading...',
                                                                success: 'Uploaded successfully',
                                                                error: 'Failed to upload'
                                                            }
                                                        )
                                                        const url = configuration().backendUrl + data.data.url;
                                                        setPayload((prev) => ({
                                                            ...prev,
                                                            name: prev.name.map((item) => item._id === test._id ? { ...item, value: url } : item),
                                                        }))

                                                    }
                                                }}
                                            />
                                        </div>
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
                    <Button type="button" onClick={updateResult} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100 shadow-lg">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
