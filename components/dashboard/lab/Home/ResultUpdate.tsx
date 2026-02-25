import React, { useState } from "react";
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
import { Beaker, FlaskConical, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        }[];
      };
      value?: string | number;
      _id: string;
    }[];
    sampleType: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  mutate: () => void;
  buttonText?: string;
}

export default function ResultUpdate({ r, mutate, buttonText }: Props) {
  const [open, setOpen] = useState(false);

  const [payload, setPayload] = useState({
    _id: r._id,
    test: r.test
      .map((item) => ({
        _id: item._id,
        value: item.value && item?.value?.toString(),
        name: item.name,
      })),
  });

  const updateResult = async () => {
    try {
      await toast.promise(api.post("lab/report/result", payload), {
        loading: "Updating Result",
        success: "Result Updated Successfully",
        error: "Failed to Update Result",
      });

      mutate();
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to Update Result");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
          {buttonText || "Update Result"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden gap-0">
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
                    <TableHead className="w-[25%] pr-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {r?.test?.map((labTest) => (
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
                        <div className="relative max-w-[240px]">
                          {labTest.name?.type === "Lab" ? (
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
                              type="text"
                              placeholder="Enter result"
                              className="pl-3 pr-12 h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                            />
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
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                              {labTest.name?.unit}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-sm font-medium text-gray-700">
                            {labTest.name?.min ?? "0"} -{" "}
                            {labTest.name?.unit ? labTest.name?.unit : ""}{" "}
                            {labTest.name?.max ?? "N/A"}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Normal Range
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
            onClick={updateResult}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
