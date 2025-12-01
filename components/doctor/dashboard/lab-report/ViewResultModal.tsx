import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fAge, fDate } from '@/lib/fDateAndTime';
import { Activity, Clock, FileText, FlaskConical, User } from 'lucide-react';
import React from 'react';

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
            value?: string | number
        }[];
        sampleType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }
}

export default function ViewResultModal({ r }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                    View
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden gap-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100/50 text-blue-600 rounded-xl">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-gray-900">Test Results</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                                    Detailed view of lab and imaging results
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Reported: {fDate(r.date)}</span>
                        </div>
                    </div>
                </DialogHeader>

                {/* Patient Details Row */}
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{r.patient.name}</h3>
                                <p className="text-xs text-gray-500">{r.patient.mrn}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500">Gender</p>
                                <p className="text-sm font-medium text-gray-700">{r.patient.gender}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500">Age</p>
                                <p className="text-sm font-medium text-gray-700">{fAge(r.patient.dateOfBirth)} yrs</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500">Blood Type</p>
                                <p className="text-sm font-medium text-gray-700">{r.patient.blood || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50/30 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        {r.name.map((test) => (
                            <div key={test._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${test.type === 'Lab' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {test.type === 'Lab' ? <FlaskConical className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{test.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-400 font-mono">{test.code}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium border border-gray-200">{test.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pl-[52px]">
                                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Result</p>
                                                {test.type === 'Lab' ? (
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-bold text-gray-900">{test.value || "-"}</span>
                                                        <span className="text-xs font-medium text-gray-500">{test.unit}</span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {test.value ? (
                                                            <a
                                                                href={test.value.toString()}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm transition-all"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                View Report / Image
                                                            </a>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">No file uploaded</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {test.type === 'Lab' && (
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Reference Range</p>
                                                    <p className="text-sm font-mono text-gray-600">{test.min ?? "0"} - {test.max ?? "N/A"}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
