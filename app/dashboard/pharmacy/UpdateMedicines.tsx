import React, { useState } from 'react'
import { OrderType } from './interface';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fAge, fDateandTime } from '@/lib/fDateAndTime';
import PrescriptionCard from './PrescriptionCard';
import UpdatePrescriptionCard from './UpdatePrescriptionCard';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    order: OrderType;
    OrderMutate: () => void;
}

export default function UpdateMedicines({ open, setOpen, order, OrderMutate }: Props) {

    const [updatePayload, setUpdatePayload] = useState<OrderType>(order)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="!max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Update Medicines — {order?.mrn}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[75vh] overflow-auto pr-1 pb-16">
                    {/* Patient + Bill Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                        {/* Patient card */}
                        <div className="border rounded-lg p-3 md:col-span-2">
                            <div className="text-xs uppercase tracking-wide text-slate-500">
                                Patient
                            </div>
                            <div className="font-semibold text-lg flex items-center gap-1">
                                <p>{order?.patient?.name}</p> -{" "}
                                <span className="text-sm">({order?.patient?.mrn})</span>
                            </div>
                            <div className="text-sm text-slate-700">
                                Age/Gender: {fAge(order?.patient?.dateOfBirth)} /{" "}
                                {order?.patient?.gender} • Ph:
                                {order?.patient?.phoneNumber}
                            </div>
                            <div className="text-sm text-slate-700">
                                Address: {order?.patient?.address}
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                                Doctor: {order?.doctor?.name} • Specialization:{" "}
                                {order?.doctor?.specialization}
                            </div>
                        </div>

                        {/* Bill card */}
                        <div className="border rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-slate-600">
                                    Date:{" "}
                                    <span className="font-medium">
                                        {fDateandTime(order?.createdAt)}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-600">
                                    RX ID: <span className="font-medium">{order?.mrn}</span>
                                </div>
                            </div>
                            <div className="ml-3 bg-white p-1 rounded border">
                                <Barcode value={order?.mrn ?? ""} />
                            </div>
                        </div>
                    </div>

                    {updatePayload && <UpdatePrescriptionCard setData={setUpdatePayload} data={updatePayload} />}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={async () => {
                            updatePayload?.items?.forEach((m) => {
                                if (m.quantity === 0) {
                                    toast.error("Quantity cannot be 0");
                                    return;
                                }
                            })

                            const payload = { ...updatePayload, patient: order?.patient._id, doctor: order?.doctor._id }
                            try {
                                await toast.promise(api.patch(`pharmacy/orders/update`, payload), {
                                    loading: "Updating...",
                                    success: "Updated successfully",
                                    error: "Failed to update"
                                })
                                setOpen(false);
                                OrderMutate();

                            } catch (error) {
                                toast.error("Failed to update : " + error);
                            }
                        }}>Update</Button>
                    </div>
                </div>


            </DialogContent>
        </Dialog>
    )
}



function Barcode({ value }: { value: string }) {
    const bars = Array.from(value || "").map(
        (ch, i) => ((ch.charCodeAt(0) + i) % 7) + 2
    );
    const totalW = bars.reduce((a, b) => a + b + 1, 0);
    let x = 0;
    return (
        <svg width={totalW} height={48} className="bg-white">
            {bars.map((w, i) => {
                const rect = (
                    <rect key={i} x={x} y={0} width={w} height={48} fill="#000" />
                );
                x += w + 1;
                return rect;
            })}
        </svg>
    );
}