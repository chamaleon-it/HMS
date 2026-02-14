import api from '@/lib/axios'
import React, { useState } from 'react'
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
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const pharmacistSchema = z.object({
    name: z.string().min(1, "Name is required"),
    qualification: z.string().optional(),
    licenseNumber: z.string().optional(),
    designation: z.string().optional(),
})

type PharmacistValues = z.infer<typeof pharmacistSchema>

interface PharmacistData extends PharmacistValues {
    _id: string
}

const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Pharmacist() {


    const { data: pharmacistResponse, mutate: pharmacistMutate, isLoading: pharmacistLoading } = useSWR<{
        data: PharmacistData[], message: string
    }>("/pharmacist")

    const pharmacist = pharmacistResponse?.data ?? []
    const [editingPharmacist, setEditingPharmacist] = useState<PharmacistData | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)


    const registerPharmacist = async (values: PharmacistValues) => {
        try {
            await toast.promise(api.post("/pharmacist/register", values), {
                loading: "Registering pharmacist...",
                success: "Pharmacist registered successfully",
                error: (err) => err?.response?.data?.message || "Failed to register pharmacist",
            })
            pharmacistMutate()
            setIsDialogOpen(false)
        } catch (error) {
            console.error(error)
        }
    }


    const updatePharmacist = async (values: PharmacistValues, _id: string) => {
        try {
            await toast.promise(api.patch("/pharmacist/" + _id, values), {
                loading: "Updating pharmacist...",
                success: "Pharmacist updated successfully",
                error: (err) => err?.response?.data?.message || "Failed to update pharmacist",
            })
            pharmacistMutate()
            setIsDialogOpen(false)
            setEditingPharmacist(null)
        } catch (error) {
            console.error(error)
        }
    }


    const deletePharmacist = async (_id: string) => {
        try {
            await toast.promise(api.delete("/pharmacist/" + _id), {
                loading: "Deleting pharmacist...",
                success: "Pharmacist deleted successfully",
                error: (err) => err?.response?.data?.message || "Failed to delete pharmacist",
            })
            pharmacistMutate()
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
    } = useForm<PharmacistValues>({
        resolver: zodResolver(pharmacistSchema),
        values: editingPharmacist ? {
            name: editingPharmacist.name,
            qualification: editingPharmacist.qualification,
            licenseNumber: editingPharmacist.licenseNumber,
            designation: editingPharmacist.designation,
        } : {
            name: '',
            qualification: '',
            licenseNumber: '',
            designation: '',
        }
    })

    const onSubmit = async (values: PharmacistValues) => {
        if (editingPharmacist) {
            await updatePharmacist(values, editingPharmacist._id)
        } else {
            await registerPharmacist(values)
        }
    }

    const openAddDialog = () => {
        setEditingPharmacist(null)
        reset({
            name: '',
            qualification: '',
            licenseNumber: '',
            designation: '',
        })
        setIsDialogOpen(true)
    }

    const openEditDialog = (pharmacist: PharmacistData) => {
        setEditingPharmacist(pharmacist)
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pharmacists</h2>
                    <p className="text-muted-foreground">
                        Manage your pharmacy staff and their qualifications.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog} className="gap-2">
                            <Plus size={16} />
                            Add Pharmacist
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingPharmacist ? 'Edit Pharmacist' : 'Add Pharmacist'}</DialogTitle>
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
                                    placeholder="e.g. B.Pharm, M.Pharm"
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
                                    placeholder="e.g. Chief Pharmacist"
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
                                    {editingPharmacist ? 'Update' : 'Register'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Qualification</TableHead>
                            <TableHead className="font-semibold">License No.</TableHead>
                            <TableHead className="font-semibold">Designation</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pharmacistLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-5 w-full animate-pulse bg-slate-100 rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : pharmacist.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No pharmacists found. Add your first pharmacist to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pharmacist.map((p) => (
                                <TableRow key={p._id} className="group transition-colors hover:bg-slate-50/50">
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>{p.qualification || <span className="text-slate-400 italic text-xs">Not set</span>}</TableCell>
                                    <TableCell>
                                        {p.licenseNumber ? (
                                            <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                                {p.licenseNumber}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-400 italic text-xs">Not set</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{p.designation || <span className="text-slate-400 italic text-xs">Not set</span>}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm">
                                                    <MoreHorizontal size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem
                                                    onClick={() => openEditDialog(p)}
                                                    className="gap-2"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deletePharmacist(p._id)}
                                                    className="gap-2 text-red-600 focus:text-red-600"
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
