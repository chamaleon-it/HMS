import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import React, { useRef, useEffect } from "react";
import { Supplier } from "./interface";

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    contactPerson: z.string().optional(),
    designation: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    gstin: z.string().optional(),
    msme: z.string().optional(),
    pan: z.string().optional(),
    dlNo: z.string().optional(),
    dlExpiryDate: z.string().optional(),
    balance: z.string().optional(),
    paymentTerms: z.string().optional(),
    status: z.enum(["Active", "Inactive"]),
    description: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export function EditSupplier({
    supplier,
    onClose,
    onRefresh
}: {
    supplier: Supplier;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
        setValue,
    } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: supplier.name || "",
            phone: supplier.phone || "",
            contactPerson: supplier.contactPerson || "",
            designation: supplier.designation || "",
            email: supplier.email || "",
            line1: supplier.address?.line1 || "",
            line2: supplier.address?.line2 || "",
            city: supplier.address?.city || "",
            state: supplier.address?.state || "Kerala",
            gstin: supplier.gstin || "",
            msme: supplier.msme || "",
            pan: supplier.pan || "",
            dlNo: supplier.dlNo || "",
            dlExpiryDate: supplier.dlExpiryDate ? new Date(supplier.dlExpiryDate).toISOString().split('T')[0] : "",
            balance: String(supplier.balance || 0),
            paymentTerms: String(supplier.paymentTerms || 30),
            status: supplier.status || "Active",
            description: supplier.description || "",
        }
    });

    const capitalizeWords = (str: string) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const onSubmit = async (data: SupplierFormValues) => {
        if (!isDirty) {
            toast('No changes detected', { icon: 'ℹ️' });
            onClose();
            return;
        }

        try {
            const payload = {
                name: data.name,
                phone: data.phone,
                contactPerson: data.contactPerson,
                designation: data.designation,
                email: data.email,
                address: {
                    line1: data.line1,
                    line2: data.line2,
                    city: data.city,
                    state: data.state,
                },
                gstin: data.gstin,
                msme: data.msme,
                pan: data.pan,
                dlNo: data.dlNo,
                dlExpiryDate: data.dlExpiryDate ? new Date(data.dlExpiryDate).toISOString() : undefined,
                balance: Number(data.balance) || 0,
                paymentTerms: Number(data.paymentTerms) || 30,
                description: data.description,
                status: data.status,
            };

            const response = await api.patch(`/suppliers/${supplier._id}`, payload);

            if (response.status === 200 || response.status === 204) {
                toast.success("Supplier updated successfully");
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (error: any) {
            console.error("Error updating supplier:", error);
            const errorMessage = error.response?.data?.message || "Failed to update supplier";
            toast.error(errorMessage);
        }
    };

    // Refs for keyboard navigation
    const refs = {
        name: useRef<HTMLInputElement>(null),
        phone: useRef<HTMLInputElement>(null),
        contactPerson: useRef<HTMLInputElement>(null),
        designation: useRef<HTMLInputElement>(null),
        email: useRef<HTMLInputElement>(null),
        line1: useRef<HTMLInputElement>(null),
        line2: useRef<HTMLInputElement>(null),
        city: useRef<HTMLInputElement>(null),
        state: useRef<HTMLInputElement>(null),
        gstin: useRef<HTMLInputElement>(null),
        msme: useRef<HTMLInputElement>(null),
        pan: useRef<HTMLInputElement>(null),
        dlNo: useRef<HTMLInputElement>(null),
        dlExpiryDate: useRef<HTMLInputElement>(null),
        balance: useRef<HTMLInputElement>(null),
        paymentTerms: useRef<HTMLInputElement>(null),
        status: useRef<HTMLSelectElement>(null),
        description: useRef<HTMLInputElement>(null),
        submitButton: useRef<HTMLButtonElement>(null),
    };

    const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            nextRef.current?.focus();
        }
    };

    return (
        <div className="p-0 font-sans">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="font-semibold">Supplier Name *</Label>
                    <Input
                        id="name"
                        placeholder="Enter supplier name"
                        {...register("name")}
                        ref={(e) => {
                            register("name").ref(e);
                            refs.name.current = e;
                        }}
                        onKeyDown={(e) => handleKeyDown(e, refs.phone)}
                        autoFocus
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="font-semibold">Phone Number *</Label>
                        <Input
                            id="phone"
                            placeholder="+91 9999999999"
                            {...register("phone")}
                            ref={(e) => {
                                register("phone").ref(e);
                                refs.phone.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.contactPerson)}
                        />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="font-semibold">Contact Person</Label>
                        <Input
                            id="contactPerson"
                            placeholder="Name of contact person"
                            {...register("contactPerson")}
                            onChange={(e) => {
                                setValue("contactPerson", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
                            ref={(e) => {
                                register("contactPerson").ref(e);
                                refs.contactPerson.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.designation)}
                        />
                        {errors.contactPerson && <p className="text-red-500 text-xs">{errors.contactPerson.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="designation" className="font-semibold">Designation</Label>
                        <Input
                            id="designation"
                            placeholder="e.g. Manager"
                            {...register("designation")}
                            onChange={(e) => {
                                setValue("designation", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
                            ref={(e) => {
                                register("designation").ref(e);
                                refs.designation.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.email)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold">Email Address</Label>
                        <Input
                            id="email"
                            placeholder="email@example.com"
                            {...register("email")}
                            ref={(e) => {
                                register("email").ref(e);
                                refs.email.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.line1)}
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="line1" className="font-semibold">Address Line 1</Label>
                        <Input
                            id="line1"
                            placeholder="Building, Street"
                            {...register("line1")}
                            onChange={(e) => {
                                setValue("line1", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
                            ref={(e) => {
                                register("line1").ref(e);
                                refs.line1.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.line2)}
                        />
                        {errors.line1 && <p className="text-red-500 text-xs">{errors.line1.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="line2" className="font-semibold">Address Line 2</Label>
                        <Input
                            id="line2"
                            placeholder="Area, colony"
                            {...register("line2")}
                            onChange={(e) => {
                                setValue("line2", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
                            ref={(e) => {
                                register("line2").ref(e);
                                refs.line2.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.city)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city" className="font-semibold">City</Label>
                        <Input
                            id="city"
                            placeholder="City"
                            {...register("city")}
                            onChange={(e) => {
                                setValue("city", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
                            ref={(e) => {
                                register("city").ref(e);
                                refs.city.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.state)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state" className="font-semibold">State</Label>
                        <Input
                            id="state"
                            placeholder="State"
                            {...register("state")}
                            onChange={(e) => {
                                setValue("state", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
                            ref={(e) => {
                                register("state").ref(e);
                                refs.state.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.gstin)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gstin" className="font-semibold">GSTIN</Label>
                        <Input
                            id="gstin"
                            placeholder="GSTIN Number"
                            {...register("gstin")}
                            ref={(e) => {
                                register("gstin").ref(e);
                                refs.gstin.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.msme)}
                        />
                        {errors.gstin && <p className="text-red-500 text-xs">{errors.gstin.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="msme" className="font-semibold">MSME No.</Label>
                        <Input
                            id="msme"
                            placeholder="MSME Number"
                            {...register("msme")}
                            ref={(e) => {
                                register("msme").ref(e);
                                refs.msme.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.pan)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pan" className="font-semibold">PAN Number</Label>
                        <Input
                            id="pan"
                            placeholder="PAN Number"
                            {...register("pan")}
                            ref={(e) => {
                                register("pan").ref(e);
                                refs.pan.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.dlNo)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dlNo" className="font-semibold">DL No.</Label>
                        <Input
                            id="dlNo"
                            placeholder="Drug Licence Number"
                            {...register("dlNo")}
                            ref={(e) => {
                                register("dlNo").ref(e);
                                refs.dlNo.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.dlExpiryDate)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dlExpiryDate" className="font-semibold">DL Expiry Date</Label>
                        <Input
                            id="dlExpiryDate"
                            type="date"
                            {...register("dlExpiryDate")}
                            ref={(e) => {
                                register("dlExpiryDate").ref(e);
                                refs.dlExpiryDate.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.balance)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance" className="font-semibold">Opening Balance</Label>
                        <Input
                            id="balance"
                            type="number"
                            placeholder="0.00"
                            {...register("balance")}
                            ref={(e) => {
                                register("balance").ref(e);
                                refs.balance.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.paymentTerms)}
                            disabled
                        />
                        <p className="text-[10px] text-slate-400">Opening balance cannot be changed after creation.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="paymentTerms" className="font-semibold">Payment Terms (In Days)</Label>
                        <Input
                            id="paymentTerms"
                            type="number"
                            placeholder="30"
                            {...register("paymentTerms")}
                            ref={(e) => {
                                register("paymentTerms").ref(e);
                                refs.paymentTerms.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.status)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="font-semibold">Status</Label>
                        <select
                            id="status"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register("status")}
                            ref={(e) => {
                                register("status").ref(e);
                                refs.status.current = e;
                            }}
                            onKeyDown={(e) => handleKeyDown(e, refs.description)}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                    <Input
                        id="description"
                        placeholder="Any additional notes..."
                        {...register("description")}
                        ref={(e) => {
                            register("description").ref(e);
                            refs.description.current = e;
                        }}
                        onKeyDown={(e) => handleKeyDown(e, refs.submitButton)}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="font-semibold">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !isDirty}
                        className="bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                        ref={refs.submitButton}
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
