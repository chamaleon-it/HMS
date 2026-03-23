import api from '@/lib/axios'
import { useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2, Star, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const technicianSchema = z.object({
    name: z.string().min(1, "Name is required"),
    qualification: z.string().optional(),
    licenseNumber: z.string().optional(),
    designation: z.string().optional(),
})

type TechnicianValues = z.infer<typeof technicianSchema>

export interface TechnicianData extends TechnicianValues {
    _id: string,
    inCharge: boolean
}

const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Technician() {

    const { data: technicianResponse, mutate: technicianMutate, isLoading: technicianLoading } = useSWR<{
        data: TechnicianData[], message: string
    }>("/technician")

    const technician = technicianResponse?.data ?? []
    const [editingTechnician, setEditingTechnician] = useState<TechnicianData | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)


    const registerTechnician = async (values: TechnicianValues) => {
        try {
            await toast.promise(api.post("/technician/register", values), {
                loading: "Registering technician...",
                success: "Technician registered successfully",
                error: (err) => err?.response?.data?.message || "Failed to register technician",
            })
            technicianMutate()
            setIsDialogOpen(false)
        } catch (error) {
            console.error(error)
        }
    }


    const updateTechnician = async (values: TechnicianValues, _id: string) => {
        try {
            await toast.promise(api.patch("/technician/" + _id, values), {
                loading: "Updating technician...",
                success: "Technician updated successfully",
                error: (err) => err?.response?.data?.message || "Failed to update technician",
            })
            technicianMutate()
            setIsDialogOpen(false)
            setEditingTechnician(null)
        } catch (error) {
            console.error(error)
        }
    }


    const deleteTechnician = async (_id: string) => {
        try {
            await toast.promise(api.delete("/technician/" + _id), {
                loading: "Deleting technician...",
                success: "Technician deleted successfully",
                error: (err) => err?.response?.data?.message || "Failed to delete technician",
            })
            technicianMutate()
        } catch (error) {
            console.error(error)
        }
    }

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<TechnicianValues>({
        resolver: zodResolver(technicianSchema),
        values: editingTechnician ? {
            name: editingTechnician.name,
            qualification: editingTechnician.qualification,
            licenseNumber: editingTechnician.licenseNumber,
            designation: editingTechnician.designation,
        } : {
            name: '',
            qualification: '',
            licenseNumber: '',
            designation: '',
        }
    })

    const onSubmit = async (values: TechnicianValues) => {
        if (editingTechnician) {
            await updateTechnician(values, editingTechnician._id)
        } else {
            await registerTechnician(values)
        }
    }

    const openAddDialog = () => {
        setEditingTechnician(null)
        reset({
            name: '',
            qualification: '',
            licenseNumber: '',
            designation: '',
        })
        setIsDialogOpen(true)
    }

    const openEditDialog = (technician: TechnicianData) => {
        setEditingTechnician(technician)
        setIsDialogOpen(true)
    }


    const markAsIncharge = async (_id: string) => {
        try {
            await toast.promise(api.patch("/technician/incharge/" + _id), {
                loading: "Marking as incharge...",
                success: "Technician marked as incharge successfully",
                error: (err) => err?.response?.data?.message || "Failed to mark as incharge",
            })
            technicianMutate()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Technicians</h2>
                    <p className="text-muted-foreground">
                        Manage your lab technicians and their qualifications.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog} className="gap-2">
                            <Plus size={16} />
                            Add Technician
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTechnician ? 'Edit Technician' : 'Add Technician'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. John Doe"
                                    {...register('name')}
                                    onChange={(e) => {
                                        setValue('name', capitalizeWords(e.target.value), { shouldValidate: true })
                                    }}
                                    onBlur={(e) => {
                                        setValue('name', e.target.value.trim(), { shouldValidate: true })
                                    }}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qualification">Qualification</Label>
                                <Input
                                    id="qualification"
                                    placeholder="e.g. DMLT, BMLT, MMLT"
                                    {...register('qualification')}
                                    onChange={(e) => {
                                        setValue('qualification', capitalizeWords(e.target.value), { shouldValidate: true })
                                    }}
                                    onBlur={(e) => {
                                        setValue('qualification', e.target.value.trim(), { shouldValidate: true })
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="licenseNumber">License Number</Label>
                                <Input
                                    id="licenseNumber"
                                    placeholder="e.g. PH-12345"
                                    {...register('licenseNumber')}
                                    onChange={(e) => {
                                        setValue('licenseNumber', capitalizeWords(e.target.value), { shouldValidate: true })
                                    }}
                                    onBlur={(e) => {
                                        setValue('licenseNumber', e.target.value.trim(), { shouldValidate: true })
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    id="designation"
                                    placeholder="e.g. Chief Technician"
                                    {...register('designation')}
                                    onChange={(e) => {
                                        setValue('designation', capitalizeWords(e.target.value), { shouldValidate: true })
                                    }}
                                    onBlur={(e) => {
                                        setValue('designation', e.target.value.trim(), { shouldValidate: true })
                                    }}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingTechnician ? 'Update' : 'Register'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                <Table className="min-w-fit">
                    <TableHeader className="bg-slate-700 hover:bg-slate-700">
                        <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4">Name</TableHead>
                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Qualification</TableHead>
                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">License No.</TableHead>
                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Designation</TableHead>
                            <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {technicianLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <TableCell key={j} className="py-3 px-4">
                                            <div className="h-5 w-full animate-pulse bg-slate-100 rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : technician.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground bg-white">
                                    No technicians found. Add your first technician to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            technician.map((p, idx) => (
                                <TableRow
                                    key={p._id}
                                    className={cn(
                                        "group transition-colors",
                                        idx % 2 === 0 ? "bg-white hover:bg-white/60" : "bg-slate-50 hover:bg-slate-50/60"
                                    )}
                                >
                                    <TableCell className="py-3 pl-4 font-medium text-slate-900 flex items-center gap-2">{p.name} {p.inCharge && <CircleCheck size={14} className="text-green-500 fill-green-500/20" />}</TableCell>
                                    <TableCell className="py-3 text-slate-600">{p.qualification || <span className="text-slate-400 italic text-[11px]">Not set</span>}</TableCell>
                                    <TableCell className="py-3">
                                        {p.licenseNumber ? (

                                            p.licenseNumber

                                        ) : (
                                            <span className="text-slate-400 italic text-[11px]">Not set</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3 text-slate-600 font-medium text-[13px]">{p.designation || <span className="text-slate-400 italic text-[11px]">Not set</span>}</TableCell>
                                    <TableCell className="py-3 text-right pr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                                                    <MoreHorizontal size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 p-1 border-slate-200">
                                                <DropdownMenuItem
                                                    onClick={() => { markAsIncharge(p._id) }}
                                                    className="gap-2 text-slate-700 cursor-pointer"
                                                >
                                                    <Star size={14} className="text-amber-500 fill-amber-500/20" />
                                                    Person In Charge
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => openEditDialog(p)}
                                                    className="gap-2 text-slate-700 cursor-pointer"
                                                >
                                                    <Pencil size={14} className="text-blue-500" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deleteTechnician(p._id)}
                                                    className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
