import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phoneNumber: z.string().min(10, "Valid phone number is required"),
    contactPerson: z.string().optional(),
    designation: z.string().optional(),
    email: z.string().optional(),
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    state: z.string().optional(),
    gstin: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters"),
    msmeNumber: z.string().optional(),
    panNumber: z.string().optional(),
    dlNumber: z.string().optional(),
    dlExpiryDate: z.string().optional(),
    openingBalance: z.string().optional(),
    paymentTerms: z.string().optional(),
    isActive: z.boolean(),
    category: z.string().optional(),
    description: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export function AddSupplier({ onClose }: { onClose: () => void }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: "",
            phoneNumber: "",
            addressLine1: "",
            gstin: "",
            isActive: true,
        }
    });

    const onSubmit = async (data: SupplierFormValues) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("New Supplier Data:", data);
        toast.success("Supplier added successfully (Mock)");
        reset();
        onClose();
    };

    return (
        <div className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Seller Name *</Label>
                    <Input id="name" placeholder="Enter seller name" {...register("name")} />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input id="phoneNumber" placeholder="+91 9999999999" {...register("phoneNumber")} />
                        {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" placeholder="Name of contact person" {...register("contactPerson")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input id="designation" placeholder="e.g. Manager" {...register("designation")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" placeholder="email@example.com" {...register("email")} />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="addressLine1">Address Line 1 *</Label>
                        <Input id="addressLine1" placeholder="Building, Street" {...register("addressLine1")} />
                        {errors.addressLine1 && <p className="text-red-500 text-xs">{errors.addressLine1.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input id="addressLine2" placeholder="Area, colony" {...register("addressLine2")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="State" {...register("state")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN *</Label>
                        <Input id="gstin" placeholder="GSTIN Number" {...register("gstin")} />
                        {errors.gstin && <p className="text-red-500 text-xs">{errors.gstin.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="msmeNumber">MSME No.</Label>
                        <Input id="msmeNumber" placeholder="MSME Number" {...register("msmeNumber")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input id="panNumber" placeholder="PAN Number" {...register("panNumber")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dlNumber">DL No.</Label>
                        <Input id="dlNumber" placeholder="Drug Licence Number" {...register("dlNumber")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dlExpiryDate">DL Expiry Date</Label>
                        <Input id="dlExpiryDate" type="date" {...register("dlExpiryDate")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="openingBalance">Opening Balance</Label>
                        <Input id="openingBalance" type="number" placeholder="0.00" {...register("openingBalance")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms (In Days)</Label>
                        <Input id="paymentTerms" type="number" placeholder="30" {...register("paymentTerms")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 pt-8">
                        <Input id="isActive" type="checkbox" className="w-4 h-4 cursor-pointer" {...register("isActive")} />
                        <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" placeholder="Supplier Category" {...register("category")} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input id="description" placeholder="Any additional notes..." {...register("description")} />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white hover:bg-slate-800">
                        {isSubmitting ? "Adding..." : "Add Supplier"}
                    </Button>
                </div>
            </form>
        </div>

    );
}
