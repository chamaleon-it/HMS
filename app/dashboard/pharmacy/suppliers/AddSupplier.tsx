import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    contactPerson: z.string().min(1, "Contact person is required"),
    designation: z.string().optional(),
    email: z.string().email("Invalid email").min(1, "Email is required"),
    line1: z.string().min(1, "Address Line 1 is required"),
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

export function AddSupplier({ onClose, onRefresh }: { onClose: () => void; onRefresh?: () => void }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: "",
            phone: "",
            contactPerson: "",
            email: "",
            line1: "",
            status: "Active",
            balance: "0",
            paymentTerms: "30",
            state: "Kerala",
        }
    });

    const capitalizeWords = (str: string) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const onSubmit = async (data: SupplierFormValues) => {
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

            const response = await api.post("/suppliers", payload);

            if (response.status === 201) {
                toast.success("Supplier registered successfully");
                if (onRefresh) onRefresh();
                reset();
                onClose();
            }
        } catch (error: any) {
            console.error("Error adding supplier:", error);
            const errorMessage = error.response?.data?.message || "Failed to register supplier";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-0 font-sans">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="font-semibold">Seller Name *</Label>
                    <Input
                        id="name"
                        placeholder="Enter seller name"
                        {...register("name")}
                        onChange={(e) => {
                            setValue("name", capitalizeWords(e.target.value), { shouldValidate: true });
                        }}
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="font-semibold">Phone Number *</Label>
                        <Input id="phone" placeholder="+91 9999999999" {...register("phone")} />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="font-semibold">Contact Person *</Label>
                        <Input
                            id="contactPerson"
                            placeholder="Name of contact person"
                            {...register("contactPerson")}
                            onChange={(e) => {
                                setValue("contactPerson", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
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
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold">Email Address *</Label>
                        <Input id="email" placeholder="email@example.com" {...register("email")} />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="line1" className="font-semibold">Address Line 1 *</Label>
                        <Input
                            id="line1"
                            placeholder="Building, Street"
                            {...register("line1")}
                            onChange={(e) => {
                                setValue("line1", capitalizeWords(e.target.value), { shouldValidate: true });
                            }}
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
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gstin" className="font-semibold">GSTIN</Label>
                        <Input id="gstin" placeholder="GSTIN Number" {...register("gstin")} />
                        {errors.gstin && <p className="text-red-500 text-xs">{errors.gstin.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="msme" className="font-semibold">MSME No.</Label>
                        <Input id="msme" placeholder="MSME Number" {...register("msme")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pan" className="font-semibold">PAN Number</Label>
                        <Input id="pan" placeholder="PAN Number" {...register("pan")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dlNo" className="font-semibold">DL No.</Label>
                        <Input id="dlNo" placeholder="Drug Licence Number" {...register("dlNo")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dlExpiryDate" className="font-semibold">DL Expiry Date</Label>
                        <Input id="dlExpiryDate" type="date" {...register("dlExpiryDate")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance" className="font-semibold">Opening Balance</Label>
                        <Input id="balance" type="number" placeholder="0.00" {...register("balance")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="paymentTerms" className="font-semibold">Payment Terms (In Days)</Label>
                        <Input id="paymentTerms" type="number" placeholder="30" {...register("paymentTerms")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="font-semibold">Status</Label>
                        <select
                            id="status"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register("status")}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                    <Input id="description" placeholder="Any additional notes..." {...register("description")} />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="font-semibold">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white hover:bg-slate-800 font-semibold">
                        {isSubmitting ? "Adding..." : "Add Supplier"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
