import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table'
import { formatINR } from '@/lib/fNumber';
import { Eye, Pencil, Trash2, Plus, Search } from 'lucide-react';
import React, { useCallback, useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export default function PanelCatalogueRow({
    panel,
    idx,
    tests,
    onAddTests,
    onRemoveTests,
    panelMutate,
}: {
    panel: { name: string; price: number };
    idx: number;
    tests: any[];
    onAddTests: () => void;
    onRemoveTests: () => void;
    panelMutate: () => void;
}) {

    const initialPanelTests = tests.filter(t => t.panels?.some((p: any) => p.name === panel.name));
    
    // Default estimated time derived from sum of test estimated times
    const defaultEstimatedTime = initialPanelTests.reduce((sum, t) => sum + (Number(t.estimatedTime) || 0), 0);

    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    
    // Edit Modal State
    const [payload, setPayload] = useState({
        name: panel.name,
        price: panel.price,
        estimatedTime: defaultEstimatedTime
    });
    
    const [selectedTests, setSelectedTests] = useState<any[]>(initialPanelTests);
    const [searchTestQuery, setSearchTestQuery] = useState("");
    const [addTestDropdownOpen, setAddTestDropdownOpen] = useState(false);

    // Sync Edit State when modal opens
    useEffect(() => {
        if (editOpen) {
            setSelectedTests(initialPanelTests);
            setPayload({
                name: panel.name,
                price: panel.price,
                estimatedTime: defaultEstimatedTime
            });
            setSearchTestQuery("");
        }
    }, [editOpen, initialPanelTests.length, panel.name, panel.price, defaultEstimatedTime]);

    const updatePanel = useCallback(async () => {
        toast.error("Panel update action triggered (Backend update disabled/not implemented)");
        setEditOpen(false);
    }, []);

    const deletePanel = useCallback(async () => {
        toast.success("Panel delete action triggered (Backend deletion disabled/not implemented)");
        setDeleteOpen(false);
    }, []);

    const handleAddTest = (test: any) => {
        if (!selectedTests.find(t => t._id === test._id)) {
            setSelectedTests([...selectedTests, test]);
        }
        setSearchTestQuery("");
        setAddTestDropdownOpen(false);
    }

    const availableTestsToAdd = tests
        .filter(t => !selectedTests.find(st => st._id === t._id))
        .filter(t => t.name.toLowerCase().includes(searchTestQuery.toLowerCase()) || t.code?.toLowerCase().includes(searchTestQuery.toLowerCase()));

    const formatRange = (t: any) => {
        const ranges = [];
        if (t.min !== null || t.max !== null) ranges.push(`N: ${t.min || 0}-${t.max || 0}`);
        if (t.womenMin !== null || t.womenMax !== null) ranges.push(`F: ${t.womenMin || 0}-${t.womenMax || 0}`);
        if (t.childMin !== null || t.childMax !== null) ranges.push(`C: ${t.childMin || 0}-${t.childMax || 0}`);
        if (t.nbMin !== null || t.nbMax !== null) ranges.push(`NB: ${t.nbMin || 0}-${t.nbMax || 0}`);
        
        return ranges.length > 0 ? ranges.join(' | ') : 'N/A';
    }

    return (
        <TableRow>
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{panel.name}</TableCell>
            <TableCell>{formatINR(panel.price)}</TableCell>
            <TableCell>{defaultEstimatedTime > 0 ? `${defaultEstimatedTime} Minutes` : "N/A"}</TableCell>
            <TableCell align="right">
                <div className="flex gap-2 items-center justify-end">
                    
                    <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Eye className='h-4 w-4 text-slate-500' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Panel Details: {panel.name}</DialogTitle>
                                <DialogDescription>
                                    View panel overview and included tests.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Name</Label>
                                        <p className="font-medium text-sm">{panel.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Price</Label>
                                        <p className="font-medium text-sm">{formatINR(panel.price)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Estimated Duration</Label>
                                        <p className="font-medium text-sm">{defaultEstimatedTime > 0 ? `${defaultEstimatedTime} Minutes` : "N/A"}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1 mt-2">
                                    <Label className="text-slate-800 font-bold mb-2 block">Included Tests ({initialPanelTests.length})</Label>
                                    <div className="rounded-md border border-slate-200 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead>Test Name</TableHead>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead>Reference Range</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {initialPanelTests.length > 0 ? initialPanelTests.map(t => (
                                                    <TableRow key={t._id}>
                                                        <TableCell className="font-medium text-xs">{t.name} <span className="text-slate-400">({t.code})</span></TableCell>
                                                        <TableCell className="text-xs">{t.unit || 'N/A'}</TableCell>
                                                        <TableCell className="text-slate-500 text-xs">{formatRange(t)}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-4 text-xs text-slate-400">No tests in this panel.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Pencil className='h-4 w-4 text-slate-500' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Panel: {panel.name}</DialogTitle>
                                <DialogDescription>
                                    Modify panel details and tests.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-3 items-start gap-4 p-4 bg-slate-50 border rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor={`panel-name-${idx}`}>Name</Label>
                                        <Input id={`panel-name-${idx}`} value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`panel-price-${idx}`}>Price (₹)</Label>
                                        <Input id={`panel-price-${idx}`} type="number" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`panel-eta-${idx}`}>ETA (Minutes)</Label>
                                        <Input id={`panel-eta-${idx}`} type="number" value={payload.estimatedTime} onChange={(e) => setPayload({ ...payload, estimatedTime: Number(e.target.value) })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-800 font-bold mb-2 block border-b pb-2">Modify Tests in Panel</Label>
                                    <div className="rounded-md border border-slate-200 overflow-hidden">
                                        <div 
                                            className="max-h-[300px] overflow-y-auto w-full"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            <Table>
                                                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                                    <TableRow>
                                                        <TableHead className="w-[100px] bg-slate-50">Code</TableHead>
                                                        <TableHead className="bg-slate-50">Test Name</TableHead>
                                                        <TableHead className="w-[150px] text-right bg-slate-50">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedTests.map(t => (
                                                        <TableRow key={t._id}>
                                                            <TableCell className="text-xs text-slate-500">{t.code}</TableCell>
                                                            <TableCell className="font-medium text-sm">{t.name}</TableCell>
                                                            <TableCell className="text-right py-1">
                                                                <Button size="sm" variant="ghost" onClick={() => setSelectedTests(selectedTests.filter(st => st._id !== t._id))}>
                                                                    <Trash2 className='h-4 w-4 text-red-500' />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="border-t bg-slate-50/30">
                                            <Table>
                                                <TableBody>
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableCell className="py-2" colSpan={3}>
                                                            <Popover open={addTestDropdownOpen} onOpenChange={setAddTestDropdownOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        aria-expanded={addTestDropdownOpen}
                                                                        className="w-full justify-start text-muted-foreground font-normal hover:bg-white bg-white h-10 shadow-sm"
                                                                    >
                                                                        <Search className="mr-2 h-4 w-4 opacity-50" />
                                                                        {selectedTests.length === tests.length ? "All tests added to panel..." : "Search and add test to panel..."}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-[800px] p-0" align="start">
                                                                    <Command>
                                                                        <CommandInput placeholder="Type test name or code..." className="h-11" />
                                                                        <CommandList onWheel={(e) => e.stopPropagation()}>
                                                                            <CommandEmpty>No test found.</CommandEmpty>
                                                                            <CommandGroup>
                                                                                {tests
                                                                                    .filter(t => !selectedTests.find(st => st._id === t._id))
                                                                                    .map((t) => (
                                                                                    <CommandItem
                                                                                        key={t._id}
                                                                                        value={t.name + " " + t.code}
                                                                                        onSelect={() => {
                                                                                            handleAddTest(t);
                                                                                        }}
                                                                                        className="flex justify-between items-center cursor-pointer py-2 px-3"
                                                                                    >
                                                                                        <div className="flex flex-col">
                                                                                            <span className="font-medium">{t.name}</span>
                                                                                            <span className="text-xs text-muted-foreground">{t.code} | {t.unit || 'No unit'}</span>
                                                                                        </div>
                                                                                        <Plus className="h-4 w-4 text-emerald-500 opacity-70" />
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </CommandList>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 italic">Select tests from the combobox to add them to this panel. Hit enter on search to add the top result.</p>
                                </div>

                            </div>
                            <DialogFooter>
                                <Button onClick={updatePanel}>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Trash2 className='h-4 w-4 text-slate-500 hover:text-red-500' />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Panel</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{panel.name}</strong>? This will not delete the associated tests.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={deletePanel} className="bg-red-600 hover:bg-red-700 text-white">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </TableCell>
        </TableRow>
    )
}
