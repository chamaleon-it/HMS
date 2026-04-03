import { useState } from "react";
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
import { Beaker, CheckCircle2, Edit, FileCheck2, FlaskConical, Save, Printer, X, AlertTriangle } from "lucide-react";
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
        min?: number;
        max?: number;
        womenMin?: number;
        womenMax?: number;
        childMin?: number;
        childMax?: number;
        nbMin?: number;
        nbMax?: number;
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

      const finalPayload = {
        ...payload,
        test: filteredTests,
      };

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
        const mergedReport = {
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
        <DialogContent className="sm:max-w-200 p-0 overflow-hidden gap-0">
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
                      <TableHead className="w-[15%] py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Code
                      </TableHead>
                      <TableHead className="w-[30%] py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Result Value
                      </TableHead>
                      <TableHead className="w-[30%] py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                            <span className="font-medium text-gray-900">
                              {labTest.name?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-mono text-gray-500">
                            {labTest.name?.code}
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
                                  className="pl-3 pr-12 h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
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
                            {/* <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                {labTest.name?.unit}
                              </span>
                            </div> */}
                          </div>
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                              <span className="text-sm font-medium text-gray-700">
                                {labTest.name?.unit}
                              </span>
                            </div>
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-sm font-medium text-gray-700">
                              {labTest.name?.min ?? "N/A"}{labTest.name?.unit ? labTest.name?.unit : ""} - {labTest.name?.max ?? "N/A"}{labTest.name?.unit ? labTest.name?.unit : ""}
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
