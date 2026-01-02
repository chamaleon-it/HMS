import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table'
import api from '@/lib/axios';
import { formatINR } from '@/lib/fNumber';
import { Pencil } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast';

export default function TestCatalogueRow({
    test,
    testMutate,
}: {
    test: {
        _id: string
        code: string;
        name: string;
        price: number;
        type: "Lab" | "Imaging";
        min?: number;
        max?: number;
        womenMin?: number;
        womenMax?: number;
        childMin?: number;
        childMax?: number;
        nbMin?: number;
        nbMax?: number;
        unit?: string;
        estimatedTime?: number;
        panels: { name: string }[]
    };
    testMutate: () => void
}) {


    const [open, setOpen] = React.useState(false);
    const [payload, setPayload] = useState({
        code: test.code,
        name: test.name,
        type: test.type,
        price: test.price,
        panel: test.panels,
        min: test.min,
        max: test.max,
        womenMin: test.womenMin,
        womenMax: test.womenMax,
        childMin: test.childMin,
        childMax: test.childMax,
        nbMin: test.nbMin,
        nbMax: test.nbMax,
        unit: test.unit,
        estimatedTime: test.estimatedTime,
        _id: test._id,
    })


    const updateTest = useCallback(
        async (data: {
            code: string;
            name: string;
            price: number;
            type: "" | "Lab" | "Imaging";
            min?: number;
            max?: number;
            womenMin?: number;
            womenMax?: number;
            childMin?: number;
            childMax?: number;
            nbMin?: number;
            nbMax?: number;
            unit?: string;
            estimatedTime?: number;
        }) => {
            try {
                await toast.promise(api.patch(`/lab/panels/test/${payload._id}`, data), {
                    loading: "Updating Test",
                    success: "Test Updated Successfully",
                    error: "Failed to Update Test"
                })
                setOpen(false)
                testMutate()
            } catch (error) {
                toast.error(`Failed to Update Test : ${error}`)
            }
        },
        [],
    )



    return (
        <TableRow>
            <TableCell className="font-medium">{test.code}</TableCell>
            <TableCell>{test.name}</TableCell>
            <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${test.type === 'Lab' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {test.type}
                </span>
            </TableCell>
            <TableCell>{formatINR(test.price)}</TableCell>
            <TableCell>{test.estimatedTime ? `${test.estimatedTime} min` : ""}</TableCell>
            <TableCell>{test.panels?.map((panel) => panel.name).join(", ")}</TableCell>
            <TableCell className="text-slate-500 text-xs">
                Normal :{test.min} - {test.max}
                <br />
                Women : {test.womenMin} - {test.womenMax}
                <br />
                Child : {test.childMin} - {test.childMax}
                <br />
                NB : {test.nbMin} - {test.nbMax}
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
                                <Label htmlFor="price" className="text-right col-span-2">
                                    Price
                                </Label>
                                <Input id="price" type="number" defaultValue={test.price} className="col-span-4" onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} />
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
                                <Label htmlFor="womenMin" className="text-right col-span-2">
                                    Women Min
                                </Label>
                                <Input id="womenMin" type="number" defaultValue={test.womenMin} className="col-span-4" onChange={(e) => setPayload({ ...payload, womenMin: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="womenMax" className="text-right col-span-2">
                                    Women Max
                                </Label>
                                <Input id="womenMax" type="number" defaultValue={test.womenMax} className="col-span-4" onChange={(e) => setPayload({ ...payload, womenMax: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="childMin" className="text-right col-span-2">
                                    Child Min
                                </Label>
                                <Input id="childMin" type="number" defaultValue={test.childMin} className="col-span-4" onChange={(e) => setPayload({ ...payload, childMin: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="childMax" className="text-right col-span-2">
                                    Child Max
                                </Label>
                                <Input id="childMax" type="number" defaultValue={test.childMax} className="col-span-4" onChange={(e) => setPayload({ ...payload, childMax: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="nbMin" className="text-right col-span-2">
                                    Newborn Min
                                </Label>
                                <Input id="nbMin" type="number" defaultValue={test.nbMin} className="col-span-4" onChange={(e) => setPayload({ ...payload, nbMin: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="nbMax" className="text-right col-span-2">
                                    Newborn Max
                                </Label>
                                <Input id="nbMax" type="number" defaultValue={test.nbMax} className="col-span-4" onChange={(e) => setPayload({ ...payload, nbMax: Number(e.target.value) })} />
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
