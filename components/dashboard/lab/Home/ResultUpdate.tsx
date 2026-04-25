import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Beaker, CheckCircle2, Edit, FileCheck2, FlaskConical, Save, Printer, X, AlertTriangle, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { fDateandTime } from "@/lib/fDateAndTime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import configuration from "@/config/configuration";

function TimePicker({ date, onChange, disabled }: { date: Date | undefined; onChange: (h: number, m: number) => void; disabled?: boolean }) {
  if (!date) {
    return <div className="text-xs text-gray-400 italic font-medium w-[188px] text-center">Select a date first</div>;
  }
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  const handleHourChange = (v: string) => {
    let rawHour = parseInt(v);
    if (ampm === "PM" && rawHour < 12) rawHour += 12;
    if (ampm === "AM" && rawHour === 12) rawHour = 0;
    onChange(rawHour, minutes);
  };

  const handleMinuteChange = (v: string) => {
    onChange(hours24, parseInt(v));
  };

  const handleAmpmChange = (v: string) => {
    let newHour = hours24;
    if (v === "PM" && hours24 < 12) newHour += 12;
    if (v === "AM" && hours24 >= 12) newHour -= 12;
    onChange(newHour, minutes);
  };

  return (
    <div className="flex gap-1.5 items-center justify-end">
      <Select value={hours12.toString().padStart(2, '0')} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="w-[55px] h-7 text-xs px-2 font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-blue-400 shadow-none"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
            <SelectItem key={h} value={h.toString().padStart(2, '0')} className="text-xs font-medium cursor-pointer">{h.toString().padStart(2, '0')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs font-bold text-gray-500 pb-0.5">:</span>
      <Select value={minutes.toString().padStart(2, '0')} onValueChange={handleMinuteChange} disabled={disabled}>
        <SelectTrigger className="w-[55px] h-7 text-xs px-2 font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-blue-400 shadow-none"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) => i).map(m => (
            <SelectItem key={m} value={m.toString().padStart(2, '0')} className="text-xs font-medium cursor-pointer">{m.toString().padStart(2, '0')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={ampm} onValueChange={handleAmpmChange} disabled={disabled}>
        <SelectTrigger className="w-[60px] h-7 text-xs px-2 font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-blue-400 shadow-none"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="AM" className="text-xs font-medium cursor-pointer">AM</SelectItem>
          <SelectItem value="PM" className="text-xs font-medium cursor-pointer">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface Props {
  r: {
    _id: string;
    patient: {
      _id: string;
      name: string;
      phoneNumber: string;
      email: string;
      gender: string;
      dateOfBirth: Date;
      conditions: string[];
      blood: string;
      allergies: string;
      address: string;
      notes: string;
      createdBy: string;
      status: string;
      mrn: string;
      createdAt: Date;
      updatedAt: Date;
    };
    doctor: {
      _id: string;
      name: string;
      specialization: string | null;
    };
    lab: {
      _id: string;
      name: string;
      specialization: string | null;
    };
    date: Date;
    priority: string;
    test: {
      name: {
        code: string;
        name: string;
        type: string;
        dataType?: "number" | "text" | "boolean" | "options";
        options?: string[];
        unit?: string;
        range: {
          name: string;
          min: number | null | undefined;
          max: number | null | undefined;
          fromAge: number | null | undefined;
          toAge: number | null | undefined;
          gender: "Both" | "Male" | "Female";
          dateType: "Year" | "Month" | "Day";

        }[],
        note: string
        _id: string;
        panels: {
          _id: string;
          name: string;
          status: string;
          user: string;
          tests?: string[];
        }[];
      };
      value?: string | number;
      _id: string;
    }[];
    sampleType: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    sampleCollectedAt?: Date | null;
    testStartedAt?: Date | null;
    panels?: string[];
  };
  mutate: () => void;
  buttonText?: "Ready" | "Completed" | "Update";
  handlePrint?: (report: any) => void;
}
export default function ResultUpdate({ r, mutate, buttonText, handlePrint }: Props) {
  const [open, setOpen] = useState(false);

  const [payload, setPayload] = useState<{
    _id: string;
    test: {
      _id: string;
      value: string | number | undefined;
      name: any;
    }[];
    status?: string;
  }>({
    _id: r._id,
    test: r.test
      .map((item) => ({
        _id: item._id,
        value: item.value && item?.value?.toString(),
        name: item.name,
      })),
  });

  const [showWarning, setShowWarning] = useState(false);
  const [collectedDate, setCollectedDate] = useState<Date | undefined>(
    r.sampleCollectedAt ? new Date(r.sampleCollectedAt) : (r.createdAt ? new Date(r.createdAt) : undefined)
  );
  const [reportedDate, setReportedDate] = useState<Date | undefined>(
    r.testStartedAt ? new Date(r.testStartedAt) : (r.updatedAt ? new Date(r.updatedAt) : undefined)
  );

  // Auto-calculation logic for Lipid Profile and LFT
  useEffect(() => {
    const tests = payload.test;
    const findTest = (name: string) => tests.find(t => t.name?.name?.trim()?.toLowerCase() === name.toLowerCase());

    const tcTest = findTest("total cholesterol");
    const tgTest = findTest("triglyceride");
    const hdlTest = findTest("hdl cholesterol");
    const tpTest = findTest("total proteins");
    const saTest = findTest("serum albumin");

    const tc = tcTest?.value ? parseFloat(tcTest.value.toString()) : NaN;
    const tg = tgTest?.value ? parseFloat(tgTest.value.toString()) : NaN;
    const hdl = hdlTest?.value ? parseFloat(hdlTest.value.toString()) : NaN;
    const tp = tpTest?.value ? parseFloat(tpTest.value.toString()) : NaN;
    const sa = saTest?.value ? parseFloat(saTest.value.toString()) : NaN;

    let isChanged = false;
    const newTests = [...payload.test];

    const updateCalculatedValue = (targetName: string, value: string | number) => {
      const index = newTests.findIndex(t => t.name?.name?.trim()?.toLowerCase() === targetName.toLowerCase());
      if (index !== -1) {
        const currentVal = newTests[index].value?.toString();
        const nextVal = value.toString();
        if (currentVal !== nextVal) {
          newTests[index] = { ...newTests[index], value: nextVal };
          isChanged = true;
        }
      }
    };

    // Calculate VLDL = TRIGLYCERIDE / 5
    if (!isNaN(tg)) {
      updateCalculatedValue("vldl", (tg / 5).toFixed(2));
    }

    // Calculate LDL = TOTAL CHOLESTEROL - HDL - (TRIGLYCERIDE / 5)
    if (!isNaN(tc) && !isNaN(hdl) && !isNaN(tg)) {
      const vldl = tg / 5;
      const ldl = tc - hdl - vldl;
      updateCalculatedValue("ldl cholesterol", ldl.toFixed(2));
    }

    // Calculate Cholesterol / HDL Ratio = TOTAL CHOLESTEROL / HDL
    if (!isNaN(tc) && !isNaN(hdl) && hdl !== 0) {
      updateCalculatedValue("cholesterol / hdl ratio", (tc / hdl).toFixed(2));
    }

    // Calculate LDL / HDL Ratio = LDL / HDL
    const ldlTest = findTest("ldl cholesterol");
    const ldlVal = ldlTest?.value ? parseFloat(ldlTest.value.toString()) : NaN;
    if (!isNaN(ldlVal) && !isNaN(hdl) && hdl !== 0) {
      updateCalculatedValue("ldl / hdl ratio", (ldlVal / hdl).toFixed(2));
    }

    // Serum GLOBULIN = Total Proteins - Serum Albumin
    if (!isNaN(tp) && !isNaN(sa)) {
      const globulin = tp - sa;
      updateCalculatedValue("serum globulin", globulin.toFixed(2));

      // Albumin /Globulin(A/G) Ratio = Serum Albumin / Serum GLOBULIN
      if (globulin !== 0) {
        updateCalculatedValue("albumin /globulin(a/g) ratio", (sa / globulin).toFixed(2));
      }
    }

    if (isChanged) {
      setPayload(prev => ({ ...prev, test: newTests }));
    }
  }, [
    payload.test.find(t => t.name?.name?.trim()?.toLowerCase() === "total cholesterol")?.value,
    payload.test.find(t => t.name?.name?.trim()?.toLowerCase() === "triglyceride")?.value,
    payload.test.find(t => t.name?.name?.trim()?.toLowerCase() === "hdl cholesterol")?.value,
    payload.test.find(t => t.name?.name?.trim()?.toLowerCase() === "total proteins")?.value,
    payload.test.find(t => t.name?.name?.trim()?.toLowerCase() === "serum albumin")?.value,
  ]);




  const handleDateSelect = (type: "collected" | "reported", newDate: Date | undefined) => {
    const current = type === "collected" ? collectedDate : reportedDate;
    const setFunc = type === "collected" ? setCollectedDate : setReportedDate;

    if (!newDate) {
      setFunc(undefined);
      return;
    }

    if (current) {
      newDate.setHours(current.getHours());
      newDate.setMinutes(current.getMinutes());
      newDate.setSeconds(current.getSeconds());
    } else {
      const now = new Date();
      newDate.setHours(now.getHours(), now.getMinutes());
    }
    setFunc(newDate);
  };

  const updateTime = (type: "collected" | "reported", h: number, m: number) => {
    const current = type === "collected" ? collectedDate : reportedDate;
    const setFunc = type === "collected" ? setCollectedDate : setReportedDate;
    if (!current) return;
    const newDate = new Date(current);
    newDate.setHours(h, m, 0, 0);
    setFunc(newDate);
  };

  const handleSaveAndPrintClick = () => {
    // Check if any test results are still empty
    const hasEmptyResults = payload.test.some(t => !t.value || t.value.toString().trim() === "");

    if (hasEmptyResults) {
      setShowWarning(true);
    } else {
      // If all filled, we can completely close out and print
      updateResult(true, true);
    }
  };

  const updateResult = async (shouldPrint = false, markCompleted = false) => {
    try {
      // Filter out any tests that have completely empty/undefined values
      // This prevents backend validation errors for empty file uploads and empty text inputs
      const filteredTests = payload.test.filter((t) =>
        t.value !== undefined && t.value !== null && t.value.toString().trim() !== ""
      );

      const finalPayload: any = {
        ...payload,
        test: filteredTests,
      };

      if (collectedDate) {
        finalPayload.collectedDate = new Date(collectedDate).toISOString();
        finalPayload.sampleCollectedAt = finalPayload.collectedDate;
        finalPayload.createdAt = finalPayload.collectedDate;
      }
      if (reportedDate) {
        finalPayload.reportedDate = new Date(reportedDate).toISOString();
        finalPayload.testStartedAt = finalPayload.reportedDate;
        finalPayload.updatedAt = finalPayload.reportedDate;
      }

      if (markCompleted) {
        finalPayload.status = "Completed";
      }

      await toast.promise(api.post("lab/report/result", finalPayload), {
        loading: "Updating Result",
        success: "Result Updated Successfully",
        error: "Failed to Update Result",
      });

      mutate();
      setOpen(false);
      setShowWarning(false);

      if (shouldPrint && handlePrint) {
        // Need to pass the updated values back up to LabTable's print handler
        // otherwise it will print the old data
        const mergedReport: any = {
          ...r,
          test: r.test.map((t: any) => {
            const payloadTest = payload.test.find((pt: any) => pt._id === t._id);
            const hasValue = payloadTest?.value !== undefined && payloadTest?.value !== "" && payloadTest?.value !== null;
            return {
              ...t,
              value: hasValue ? payloadTest.value : t.value,
            };
          }),
        };
        if (collectedDate) {
          mergedReport.createdAt = new Date(collectedDate);
          mergedReport.sampleCollectedAt = new Date(collectedDate);
        }
        if (reportedDate) {
          mergedReport.updatedAt = new Date(reportedDate);
          mergedReport.testStartedAt = new Date(reportedDate);
        }
        handlePrint(mergedReport);
      }

    } catch (error) {
      console.log(error);
      toast.error("Failed to Update Result");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className={`h-8 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm border flex items-center gap-2 ${buttonText === "Ready"
              ? "text-emerald-600 bg-white border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
              : buttonText === "Completed"
                ? "text-blue-600 bg-white border-blue-100 hover:bg-blue-50 hover:text-blue-700"
                : "text-amber-600 bg-white border-amber-100 hover:bg-amber-50 hover:text-amber-700"
              }`}
          >
            {buttonText === "Ready" && <CheckCircle2 className="w-3.5 h-3.5" />}
            {buttonText === "Completed" && <FileCheck2 className="w-3.5 h-3.5" />}
            {buttonText === "Update" && <Edit className="w-3.5 h-3.5" />}
            {buttonText || "Update Result"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-225 p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100/50 text-blue-600 rounded-xl">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Update Lab Results
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  Enter the results for the lab tests performed for{" "}
                  <span className="font-medium text-gray-700">
                    {r?.patient?.name}
                  </span>
                  .
                </DialogDescription>
              </div>
              <div className="ml-auto bg-white border border-gray-100 p-3 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">Sample Collected:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-9 text-xs py-1 px-3 w-[175px] font-semibold text-gray-800 border border-gray-200 shadow-none focus-visible:ring-1 focus-visible:border-blue-400 bg-gray-50/50 hover:bg-gray-50 transition-colors justify-start text-left",
                            !collectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          {collectedDate ? <span className="truncate">{fDateandTime(collectedDate).split(",")[0]}</span> : <span>Select</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <UICalendar
                          mode="single"
                          selected={collectedDate}
                          onSelect={(d) => handleDateSelect("collected", d)}
                          disabled={{ after: new Date() }}
                          initialFocus
                        />
                        <div className="p-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between relative z-10 w-full">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Time</span>
                          <TimePicker
                            date={collectedDate}
                            disabled={!collectedDate}
                            onChange={(h, m) => updateTime("collected", h, m)}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">Result Reported:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-9 text-xs py-1 px-3 w-[175px] font-semibold text-gray-800 border border-gray-200 shadow-none focus-visible:ring-1 focus-visible:border-blue-400 bg-gray-50/50 hover:bg-gray-50 transition-colors justify-start text-left",
                            !reportedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          {reportedDate ? <span className="truncate">{fDateandTime(reportedDate).split(",")[0]}</span> : <span>Select</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <UICalendar
                          mode="single"
                          selected={reportedDate}
                          onSelect={(d) => handleDateSelect("reported", d)}
                          disabled={{ after: new Date() }}
                          initialFocus
                        />
                        <div className="p-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between relative z-10 w-full">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Time</span>
                          <TimePicker
                            date={reportedDate}
                            disabled={!reportedDate}
                            onChange={(h, m) => updateTime("reported", h, m)}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 bg-gray-50/30 max-h-[60vh] overflow-y-auto">
            <div className="">
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50 border-b border-gray-100">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-[30%] pl-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Test Details
                      </TableHead>
                      <TableHead className="w-[30%] py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Result Value
                      </TableHead>
                      <TableHead align="right" className="w-[30%] py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Unit
                      </TableHead>
                      <TableHead className="w-[25%] pr-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Reference Range
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const testOrderMap = new Map<string, number>();
                      let orderIndex = 0;

                      (r.panels || []).forEach((panelIdStr: string) => {
                        const panelId = panelIdStr.toString();
                        const panelTests = (r.test || []).filter((t: any) => t.name?.panels?.some((p: any) => p.name === panelId));

                        let orderedIds: string[] = [];
                        for (const t of panelTests) {
                          const panelDef = t.name?.panels?.find((p: any) => p.name === panelId);
                          if (panelDef?.tests?.length) {
                            orderedIds = panelDef.tests.map((testObj: any) => testObj?._id ? testObj._id.toString() : testObj.toString());
                            break;
                          }
                        }

                        if (orderedIds.length > 0) {
                          orderedIds.forEach(id => {
                            if (!testOrderMap.has(id.toString())) {
                              testOrderMap.set(id.toString(), orderIndex++);
                            }
                          });
                        } else {
                          panelTests.forEach((t: any) => {
                            if (!testOrderMap.has(t.name?._id?.toString() || "")) {
                              testOrderMap.set(t.name?._id?.toString() || "", orderIndex++);
                            }
                          });
                        }
                      });

                      const sortedTests = [...(r?.test || [])].sort((a: any, b: any) => {
                        const aId = a.name?._id?.toString() || "";
                        const bId = b.name?._id?.toString() || "";
                        const aOrder = testOrderMap.has(aId) ? testOrderMap.get(aId)! : 999999;
                        const bOrder = testOrderMap.has(bId) ? testOrderMap.get(bId)! : 999999;
                        return aOrder - bOrder;
                      });

                      return sortedTests.map((labTest) => (
                        <TableRow
                          key={labTest._id}
                          className="group hover:bg-blue-50/30 transition-all border-b border-gray-50 last:border-none"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white border border-gray-100 text-blue-600 rounded-lg shadow-sm group-hover:border-blue-100 group-hover:shadow-md transition-all">
                                <Beaker className="w-4 h-4" />
                              </div>
                              <div className="">
                                <p className="font-medium text-gray-900">
                                  {labTest.name?.name}
                                </p>
                                <p className="text-[10px]  text-gray-500">Code : {labTest.name?.code}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="relative max-w-60">
                              {labTest.name?.type === "Lab" ? (
                                labTest.name?.dataType === "options" ? (
                                  <Select
                                    value={
                                      payload.test.find(
                                        (item) => item._id === labTest._id
                                      )?.value?.toString() || ""
                                    }
                                    onValueChange={(val) =>
                                      setPayload({
                                        ...payload,
                                        test: payload.test.map((item) =>
                                          item._id === labTest._id
                                            ? { ...item, value: val }
                                            : item
                                        ),
                                      })
                                    }
                                  >
                                    <SelectTrigger
                                      id={`result-input-${labTest._id}`}
                                      className="h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();

                                          // Find current index in payload
                                          const idx = r?.test?.findIndex(t => t._id === labTest._id) ?? -1;

                                          // Try to focus the next tool
                                          if (idx >= 0 && r?.test && idx + 1 < r.test.length) {
                                            const nextTest = r.test[idx + 1];
                                            // give a small tick for any React renders to finish
                                            setTimeout(() => {
                                              const nextInput = document.getElementById(`result-input-${nextTest._id}`);
                                              if (nextInput) nextInput.focus();
                                            }, 10);
                                          }
                                        }
                                      }}
                                    >
                                      <SelectValue placeholder="Select result" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(labTest.name?.options || []).map((opt: string) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    value={
                                      payload.test.find(
                                        (item) => item._id === labTest._id
                                      )?.value
                                    }
                                    onChange={(e) =>
                                      setPayload({
                                        ...payload,
                                        test: payload.test.map((item) =>
                                          item._id === labTest._id
                                            ? { ...item, value: e.target.value }
                                            : item
                                        ),
                                      })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();

                                        // Find current index in payload
                                        const idx = r?.test?.findIndex(t => t._id === labTest._id) ?? -1;

                                        // Try to focus the next text input
                                        if (idx >= 0 && r?.test && idx + 1 < r.test.length) {
                                          const nextTest = r.test[idx + 1];
                                          // give a small tick for any React renders to finish
                                          setTimeout(() => {
                                            const nextInput = document.getElementById(`result-input-${nextTest._id}`);
                                            if (nextInput) nextInput.focus();
                                          }, 10);
                                        }
                                      }
                                    }}
                                    type="text"
                                    id={`result-input-${labTest._id}`}
                                    placeholder="Enter result"
                                    className="pl-2 pr-2 h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                  />
                                )
                              ) : (
                                <Input
                                  type="file"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      const { data } = await toast.promise(
                                        api.post("/uploads", formData),
                                        {
                                          loading: "Uploading...",
                                          success: "Uploaded successfully",
                                          error: "Failed to upload",
                                        }
                                      );
                                      const url =
                                        configuration().backendUrl + data.data.url;
                                      setPayload({
                                        ...payload,
                                        test: payload.test.map((item) =>
                                          item._id === labTest._id
                                            ? { ...item, value: url }
                                            : item
                                        ),
                                      });
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 py-4">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-sm font-medium text-gray-700">
                                {labTest.name?.unit}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-sm font-medium text-gray-700">
                                {labTest.name?.range?.[0]?.min ?? "N/A"}{labTest.name?.unit ? labTest.name?.unit : ""} - {labTest.name?.range?.[0]?.max ?? "N/A"}{labTest.name?.unit ? labTest.name?.unit : ""}
                              </span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                                Normal Range
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    })()}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-white">
            <DialogClose asChild>
              <Button variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => updateResult(false, false)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button
              onClick={handleSaveAndPrintClick}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Save & Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <AlertDialogTitle>Incomplete Results</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pl-12">
              Some results are still pending. Are you sure you want to continue printing without completing all tests?
              The order will not be moved to "Completed" status until all fields are filled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setShowWarning(false)}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <Button
              variant="secondary"
              onClick={() => {
                setShowWarning(false);
                updateResult(false, false);
              }}
            >
              Save Only
            </Button>
            <AlertDialogAction asChild>
              <Button
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  updateResult(true, false);
                }}
              >
                Continue & Print
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
