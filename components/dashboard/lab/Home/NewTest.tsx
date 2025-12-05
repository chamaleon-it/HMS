import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PatientSelection from "./PatientSelection";
import { useState } from "react";
import { useAuth } from "@/auth/context/auth-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { combineToIST, fDate } from "@/lib/fDateAndTime";
import { Calendar as CalendarIcon, ChevronDownIcon, Trash, Zap } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useSWR from "swr";
import api from "@/lib/axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

export default function NewTest({ mutate }: { mutate: () => void }) {

    const { user } = useAuth()

    const [openCombobox, setOpenCombobox] = useState(false);
    const [, setOpenCreate] = useState(false);
    const [open, setOpen] = useState(false);
    const [openDate, setOpenDate] = useState(false);
    const [bookingType, setBookingType] = useState<"Book Now" | "Schedule">("Book Now");

    const tabs = [
        { key: "Book Now", label: "Book Now", icon: Zap },
        { key: "Schedule", label: "Schedule", icon: CalendarIcon },
    ] as const;
    const [payload, setPayload] = useState<{
        patient: string;
        doctor: string;
        lab: string;
        name: {
            code: string;
            name: string;
            type: 'Lab' | 'Imaging';
            unit: string;
            _id: string;
            max?: number;
            min?: number;
        }[];
        date: Date | undefined;
        priority: string;
        sampleType: string;
        status: string;

    }>({
        patient: "",
        doctor: user?._id ?? "",
        lab: user?._id ?? "",
        name: [],
        date: new Date(),
        priority: "Normal",
        sampleType: "Other",
        status: "Pending"
    });



    const { data: LabData } = useSWR<{
        message: string;
        data: {
            _id: string;
            name: string;
            tests: {
                code: string;
                name: string;
                type: "Lab" | "Imaging";
                min?: number;
                max?: number;
                unit: string;
                _id: string;
            }[];
        }[];
    }>("/users/lab");

    const Labs = LabData?.data.find(l => l._id === user?._id);
    const Tests = Labs?.tests ?? [];


    const handleSubmit = async () => {
        if (!payload.patient) {
            toast.error("Please select patient")
            return
        }
        let submitDate = payload.date;
        if (bookingType === "Book Now") {
            submitDate = new Date();
        }

        if (!submitDate) {
            toast.error("Please select a date")
            return
        }
        if (payload.name.length === 0) {
            toast.error("Please select at least one date")
            return
        }

        try {
            await toast.promise(api.post("/lab/report", { ...payload, date: submitDate }), {
                loading: "We are create new lab test order",
                success: ({ data }) => data.message,
                error: ({ response }) => response.data.message
            })
            setOpen(false)
            mutate()
            setPayload({
                patient: "",
                doctor: user?._id ?? "",
                lab: user?._id ?? "",
                name: [],
                date: new Date(),
                priority: "Normal",
                sampleType: "Other",
                status: "Pending"
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size={"sm"}
                >New Test</Button>
            </DialogTrigger>

            <DialogContent className="min-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add new test</DialogTitle>
                    <DialogDescription>
                        Create a new test
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-between items-center">
                    <PatientSelection
                        setValue={(id: string) => {
                            setPayload((prev) => ({ ...prev, patient: id }));
                        }}
                        register={() => {
                            setOpenCreate(true);
                            setOpen(false);
                        }}
                    />
                    <div className="flex flex-col gap-3">
                        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
                            {tabs.map(({ key, label, icon: Icon }) => {
                                const active = bookingType === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setBookingType(key)}
                                        className={
                                            "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer " +
                                            (active ? "text-white" : "text-gray-700")
                                        }
                                        type="button"
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="tab-indicator-1"
                                                className="absolute inset-0 rounded-full"
                                                style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon size={16} /> {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>


                    </div>
                </div>


                <div className="flex gap-2 justify-between">
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCombobox}
                                className="w-[300px] justify-between"
                            >
                                Select a Test
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Search test..." />
                                <CommandList className="max-h-[400px]">
                                    <CommandEmpty>No test found.</CommandEmpty>
                                    <CommandGroup>
                                        {Tests.map((test) => (
                                            <CommandItem
                                                key={test._id}
                                                value={test.name}
                                                onSelect={() => {
                                                    const exist = payload.name.find((n) => n._id === test._id);
                                                    if (exist) {
                                                        setOpenCombobox(false);
                                                        return;
                                                    }
                                                    setPayload((prev) => ({
                                                        ...prev,
                                                        name: prev.name ? [...prev.name, test] : [test],
                                                    }));
                                                    setOpenCombobox(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        payload.name.some((n) => n._id === test._id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {test.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {bookingType === "Schedule" && (
                        <>

                            <div className="flex gap-2">
                                <Popover open={openDate} onOpenChange={setOpenDate}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-48 justify-between font-normal"
                                        >
                                            {payload.date ? fDate(payload.date) : "Select date"}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={payload.date}
                                            captionLayout="dropdown"
                                            startMonth={new Date(2025, 0)}
                                            endMonth={new Date(2027, 0)}
                                            onSelect={(date) => {
                                                setPayload((prev) => ({ ...prev, date }));
                                                setOpenDate(false)
                                            }}
                                            disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="time"
                                    id="time-picker"
                                    step="1800"
                                    defaultValue={`${new Date().getHours()}:${new Date().getMinutes()}`}
                                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    onChange={e => {
                                        if (payload.date) {
                                            const newDate = combineToIST(payload.date, e.target.value)
                                            setPayload(prev => ({ ...prev, date: newDate }))
                                        } else {
                                            toast.error("Select date first")
                                        }
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SL</TableHead>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Min Range</TableHead>
                            <TableHead>Max Range</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            payload.name.map((t, idx) => <TableRow key={t._id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{t.name}</TableCell>
                                <TableCell>{t?.min}</TableCell>
                                <TableCell>{t?.max}</TableCell>
                                <TableCell>{t?.unit}</TableCell>
                                <TableCell>
                                    <Button variant={"ghost"} className="cursor-pointer" onClick={() => {
                                        setPayload(prev => ({
                                            ...prev, name:
                                                prev.name.filter(n => n._id !== t._id)
                                        }))
                                    }}>
                                        <Trash className="h-2 w-2 text-red-500" size={"sm"} />
                                    </Button>
                                </TableCell>
                            </TableRow>)
                        }

                    </TableBody>
                </Table>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
                        New Test
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}