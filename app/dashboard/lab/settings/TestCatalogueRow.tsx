import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table'
import useGetPanels from '@/data/useGetPanels';
import api from '@/lib/axios';
import { Pencil } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast';

export default function TestCatalogueRow({
    test,
    profileMutate,
}: {
    profileMutate: () => void,
    test: {
        _id: string;
        code: string;
        name: string;
        type: "" | "Lab" | "Imaging";
        panel: string;
        min?: number | undefined;
        max?: number | undefined;
        unit: string;
        estimatedTime: number;
    };
}) {


    const [open, setOpen] = React.useState(false);
    const [payload, setPayload] = useState({
        code: test.code,
        name: test.name,
        type: test.type,
        panel: test.panel,
        min: test.min,
        max: test.max,
        unit: test.unit,
        estimatedTime: test.estimatedTime,
        _id: test._id,
    })


    const updateTest = useCallback(
        async (data: {
            code: string;
            name: string;
            type: "" | "Lab" | "Imaging";
            panel: string;
            min: number | undefined;
            max: number | undefined;
            unit: string;
            estimatedTime: number;
            _id: string;
        }) => {
            try {
                await toast.promise(api.patch("/users/lab/edit_test", data), {
                    loading: "Updating Test",
                    success: "Test Updated Successfully",
                    error: "Failed to Update Test"
                })
                setOpen(false)
                profileMutate()
            } catch (error) {
                toast.error(`Failed to Update Test : ${error}`)
            }
        },
        [],
    )

    const { panels } = useGetPanels();

    return (
        <TableRow>
            <TableCell className="font-medium">{test.code}</TableCell>
            <TableCell>{test.name}</TableCell>
            <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${test.type === 'Lab' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {test.type}
                </span>
            </TableCell>
            <TableCell>{test.estimatedTime ? `${test.estimatedTime} min` : ""}</TableCell>
            <TableCell>{test.panel}</TableCell>
            <TableCell className="text-slate-500 text-xs">
                {test.min} - {test.max}
            </TableCell>
            <TableCell className="text-slate-500">{test.unit}</TableCell>
            <TableCell>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                        >
                            <Pencil className='h-4 w-4 text-slate-500' />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] lg:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Test</DialogTitle>
                            <DialogDescription>
                                Make changes to the test here. Click save when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="code" className="text-right col-span-2">
                                    Code
                                </Label>
                                <Input id="code" defaultValue={test.code} className="col-span-4" disabled />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="name" className="text-right col-span-2">
                                    Name
                                </Label>
                                <Input id="name" defaultValue={test.name} className="col-span-4" onChange={(e) => setPayload({ ...payload, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="type" className="text-right col-span-2">
                                    Type
                                </Label>
                                <Select defaultValue={test.type} onValueChange={(value: "Lab" | "Imaging") => setPayload({ ...payload, type: value })}>
                                    <SelectTrigger id="type" className="col-span-4 w-full">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lab">Lab</SelectItem>
                                        <SelectItem value="Imaging">Imaging</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="panel" className="text-right col-span-2">
                                    Panel
                                </Label>
                                <Select defaultValue={test.panel} onValueChange={(value: string) => setPayload({ ...payload, panel: value })}>
                                    <SelectTrigger id="panel" className="col-span-4 w-full">
                                        <SelectValue placeholder="Select a panel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {panels.map((panel) => (
                                            <SelectItem key={panel} value={panel}>
                                                {panel}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="min" className="text-right col-span-2">
                                    Min Value
                                </Label>
                                <Input id="min" type="number" defaultValue={test.min} className="col-span-4" onChange={(e) => setPayload({ ...payload, min: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="max" className="text-right col-span-2">
                                    Max Value
                                </Label>
                                <Input id="max" type="number" defaultValue={test.max} className="col-span-4" onChange={(e) => setPayload({ ...payload, max: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="unit" className="text-right col-span-2">
                                    Unit
                                </Label>
                                <Input id="unit" defaultValue={test.unit} className="col-span-4" onChange={(e) => setPayload({ ...payload, unit: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="estimatedTime" className="text-right col-span-2">
                                    Estimated Time (min)
                                </Label>
                                <Input id="estimatedTime" type="number" defaultValue={test.estimatedTime} className="col-span-4" onChange={(e) => setPayload({ ...payload, estimatedTime: Number(e.target.value) })} />
                            </div>

                        </div>
                        <DialogFooter>
                            <Button onClick={() => updateTest(payload)}>Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {

                    }}
                >
                    <Trash className='h-4 w-4 text-slate-500' />
                </Button> */}
            </TableCell>
        </TableRow>
    )
}
