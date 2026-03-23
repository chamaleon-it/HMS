import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fAge, fDate } from '@/lib/fDateAndTime';
import { Activity, Clock, Eye, FileText, FlaskConical, User } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
        test: {
            name: {
                code: string;
                name: string;
                type: string;
                unit?: string;
                min?: number;
                max?: number;
                womenMin?: number;
                womenMax?: number;
                childMin?: number;
                childMax?: number;
                nbMin?: number;
                nbMax?: number;
                _id: string;
                panels?: {
                    _id: string;
                    name: string;
                    status: string;
                    user: string;
                    tests?: string[];
                }[];
            }
            value?: string | number
            _id: string;
        }[];
        sampleType: string;
        status: string;
        technician: string;
        createdAt: Date;
        updatedAt: Date;
        panels?: string[];
    }
}

export default function ViewResultModal({ r }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-blue-600 border-blue-100 hover:bg-blue-50 transition-colors shadow-sm inline-flex items-center"
                >
                    <Eye className="w-4 h-4" />
                </Button>
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
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Report No.</h3>
                                {/* @ts-ignore */}
                                <p className="text-xs text-gray-500">{String(r?.mrn).padStart(4, "0")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{r?.patient?.name}</h3>
                                <p className="text-xs text-gray-500">{r?.patient?.mrn}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="grid grid-cols-4 gap-x-8 gap-y-1">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500">Gender</p>
                                <p className="text-sm font-medium text-gray-700">{r?.patient?.gender}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500">Age</p>
                                <p className="text-sm font-medium text-gray-700">{fAge(r?.patient?.dateOfBirth)} yrs</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500">Blood Type</p>
                                <p className="text-sm font-medium text-gray-700">{r?.patient?.blood || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500">Technician</p>
                                <p className="text-sm font-medium text-gray-700">{r?.technician || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50/30 max-h-[60vh] overflow-y-auto">
                    <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50 border-b border-gray-100">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[30%] pl-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Test Details
                                    </TableHead>
                                    <TableHead className="w-[15%] py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Code
                                    </TableHead>
                                    <TableHead className="w-[30%] py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Result Value
                                    </TableHead>
                                    <TableHead className="w-[25%] pr-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Reference Range
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(() => {
                                    const testOrderMap = new Map<string, number>();
                                    let orderIndex = 0;

                                    (r.panels || []).forEach((panelIdStr: string) => {
                                        const panelId = panelIdStr.toString();
                                        const panelTests = (r.test || []).filter((t: any) => t.name?.panels?.some((p: any) => p.name === panelId));

                                        let orderedIds: string[] = [];
                                        for (const t of panelTests) {
                                            const panelDef = t.name?.panels?.find((p: any) => p.name === panelId);
                                            if (panelDef?.tests?.length) {
                                                orderedIds = panelDef.tests.map((testObj: any) => testObj?._id ? testObj._id.toString() : testObj.toString());
                                                break;
                                            }
                                        }

                                        if (orderedIds.length > 0) {
                                            orderedIds.forEach(id => {
                                                if (!testOrderMap.has(id.toString())) {
                                                    testOrderMap.set(id.toString(), orderIndex++);
                                                }
                                            });
                                        } else {
                                            panelTests.forEach((t: any) => {
                                                if (!testOrderMap.has(t.name?._id?.toString() || "")) {
                                                    testOrderMap.set(t.name?._id?.toString() || "", orderIndex++);
                                                }
                                            });
                                        }
                                    });

                                    const sortedTests = [...(r?.test || [])].sort((a: any, b: any) => {
                                        const aId = a.name?._id?.toString() || "";
                                        const bId = b.name?._id?.toString() || "";
                                        const aOrder = testOrderMap.has(aId) ? testOrderMap.get(aId)! : 999999;
                                        const bOrder = testOrderMap.has(bId) ? testOrderMap.get(bId)! : 999999;
                                        return aOrder - bOrder;
                                    });

                                    return sortedTests.map((test) => (
                                        <TableRow
                                            key={test._id}
                                            className="group hover:bg-blue-50/30 transition-all border-b border-gray-50 last:border-none"
                                        >
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 bg-white border border-gray-100 rounded-lg shadow-sm group-hover:border-blue-100 group-hover:shadow-md transition-all ${test.name?.type === 'Lab' ? 'text-blue-600' : 'text-purple-600'}`}>
                                                        {test.name?.type === 'Lab' ? <FlaskConical className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {test.name?.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-mono text-gray-500">
                                                    {test.name?.code}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {test.name?.type === 'Lab' ? (
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-semibold text-gray-900">{test.value || "-"}</span>
                                                        <span className="text-xs font-medium text-gray-500">{test.name?.unit}</span>
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
                                            </TableCell>
                                            <TableCell className="pr-6 py-4 text-right">
                                                {test.name?.type === 'Lab' && (
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {test.name?.min ?? "0"} -{" "}
                                                            {test.name?.unit ? test.name?.unit + " " : ""}
                                                            {test.name?.max ?? "N/A"}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                                                            Normal Range
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                })()}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
