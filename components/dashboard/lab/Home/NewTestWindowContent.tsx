"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import PatientSelection from "./PatientSelection";
import { useAuth } from "@/auth/context/auth-context";
import { Zap, Calendar as CalendarIcon, AlertTriangle, Trash } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import useGetTest from "@/data/useGetTest";
import useGetPanels from "@/data/useGetPanels";
import DateTimePicker from "./DateTimePicker";
import { formatINR } from "@/lib/fNumber";
import TechnicianSelection from "./TechnicianSelection";
import DoctorSelection from "./DoctorSelection";
import TestSelection from "./TestSelection";
import { LabDraft, useLabDrafts } from "@/app/dashboard/lab/LabDraftContext";

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
};

const tabs = [
  { key: "Book Now", label: "Book Now", icon: Zap },
  { key: "Schedule", label: "Schedule", icon: CalendarIcon },
] as const;

export default function NewTestWindowContent({ draft }: { draft: LabDraft }) {
  const { user } = useAuth();
  const { updateDraft, removeDraft, setDraftToDelete } = useLabDrafts();
  const { panels } = useGetPanels();
  const { tests } = useGetTest();

  const payload = draft.payload;
  const bookingType = draft.bookingType;

  const setPayload = (updater: any) => {
    updateDraft(draft.id, (prev) => ({
      payload: typeof updater === 'function' ? updater(prev.payload) : { ...prev.payload, ...updater }
    }));
  };

  const setBookingType = (type: "Book Now" | "Schedule") => {
    updateDraft(draft.id, { bookingType: type });
  };

  const handleSubmit = async () => {
    if (!payload.patient) {
      toast.error("Please select patient");
      return;
    }
    let submitDate = payload.date;
    if (bookingType === "Book Now") {
      submitDate = new Date();
    }

    if (!submitDate) {
      toast.error("Please select a date");
      return;
    }
    if (payload.test.length === 0) {
      toast.error("Please select at least one test");
      return;
    }

    try {
      await toast.promise(
        api.post("/lab/report", { 
          ...payload, 
          date: submitDate.toISOString(), 
          doctor: payload.doctor === "self" ? null : payload.doctor 
        }),
        {
          loading: "Creating lab test order...",
          success: ({ data }) => data.message,
          error: ({ response }) => response.data.message,
        }
      );
      
      removeDraft(draft.id);
      window.dispatchEvent(new CustomEvent('lab-test-created'));
    } catch (error) {
      console.error(error);
    }
  };

  const grandTotal = useMemo(() => {
    const panelsTotal = payload.panels.reduce((acc, panelName) => {
      const panel = panels.find((p) => p.name === panelName);
      return acc + (panel?.price || 0);
    }, 0);

    const independentTestsTotal = payload.test
      .filter((t) => {
        const testObj = tests.find((test) => test._id === t.name);
        const belongsToPanel = testObj?.panels?.some((p) =>
          payload.panels.includes(p.name)
        );
        return !belongsToPanel;
      })
      .reduce((acc, t) => {
        const testObj = tests.find((test) => test._id === t.name);
        return acc + (testObj?.price || 0);
      }, 0);

    return panelsTotal + independentTestsTotal;
  }, [payload.panels, payload.test, panels, tests]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <PatientSelection
          input={draft.patientName}
          setInput={(val) => updateDraft(draft.id, { patientName: val })}
          setValue={(id: string, allergies?: string, name?: string) => {
            setPayload((prev: any) => ({ ...prev, patient: id }));
            if (name) updateDraft(draft.id, { patientName: name });
          }}
          register={(name) => {
             window.dispatchEvent(new CustomEvent('open-lab-register-patient', { 
               detail: { name, draftId: draft.id } 
             }));
          }}
        />
        <Button 
          variant={"outline"} 
          onClick={() => window.dispatchEvent(new CustomEvent('open-lab-register-patient', { 
            detail: { name: draft.patientName, draftId: draft.id } 
          }))} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
        >
          New Customer
        </Button>
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
                      layoutId={`tab-indicator-${draft.id}`}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(90deg,#4f46e5,#d946ef)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
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

      <div className="flex gap-2 justify-between w-full">
        <DoctorSelection
          className="max-w-72"
          setValue={(id: string | undefined) => {
            setPayload((prev: any) => ({ ...prev, doctor: id }));
          }}
          doctor={payload.doctor ?? undefined}
        />

        <TechnicianSelection
          className="max-w-72"
          setValue={(id: string) => {
            setPayload((prev: any) => ({ ...prev, technician: id }));
          }}
          technicianName={payload.technician}
        />

        <div className="flex items-end gap-2 ">
          <Button
            type="button"
            variant={payload.priority === "Urgent" ? "default" : "outline"}
            className={payload.priority === "Urgent" ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-amber-200 text-amber-600 hover:bg-amber-50"}
            onClick={(e) => {
              e.preventDefault();
              setPayload((prev: any) => ({ ...prev, priority: prev.priority === "Urgent" ? "Normal" : "Urgent" }));
            }}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Urgent
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-between w-full">
        <div className="w-[300px]">
          <TestSelection
            onSelect={(val) => {
              if (!val) return;
              const isPanel = panels.find((p) => p.name === val);
              if (isPanel) {
                setPayload((prev: any) => {
                  if (prev.panels.includes(val)) return prev;
                  let newTests: { name: string }[] = [];
                  if (isPanel.tests && isPanel.tests.length) {
                    newTests = isPanel.tests.map((t: any) => ({ name: t._id }));
                  } else {
                    newTests = tests
                      .filter((t) => t.panels?.some((p) => p.name === val))
                      .map((t) => ({ name: t._id }));
                  }
                  return {
                    ...prev,
                    panels: [...prev.panels, val],
                    test: [
                      ...prev.test,
                      ...newTests.filter((nt: any) => !prev.test.some((pt: any) => pt.name === nt.name)),
                    ],
                  };
                });
              } else {
                const testObj = tests.find((t) => t.name === val);
                if (testObj) {
                  setPayload((prev: any) => {
                    if (prev.test.find((n: any) => n.name === testObj._id)) return prev;
                    return {
                      ...prev,
                      test: [...prev.test, { name: testObj._id }],
                    };
                  });
                }
              }
            }}
            options={[
              ...panels.filter((p) => !payload.panels.includes(p.name)).map(e => e.name),
              ...tests
                .filter(
                  (t) =>
                    !t.panels?.find((p) => payload.panels.includes(p.name)) &&
                    !payload.test.some((pt: any) => pt.name === t._id)
                )
                .map((t) => t.name),
            ]}
          />
        </div>

        <div className="flex gap-2 items-center">
          {bookingType === "Schedule" && (
            <DateTimePicker
              date={payload.date}
              setDate={(date) => setPayload((prev: any) => ({ ...prev, date }))}
            />
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SL</TableHead>
            <TableHead>Test Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Estimate Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payload.panels.map((t, idx) => {
            const panelTests = tests.filter((test) =>
              test.panels?.some((panel) => panel.name === t)
            );
            const totalTime = panelTests.reduce((acc, curr) => acc + (Number(curr.estimatedTime) || 0), 0);
            return (
              <TableRow key={t}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{t}</TableCell>
                <TableCell>{formatINR(panels.find((p) => p.name === t)?.price || 0)}</TableCell>
                <TableCell>{totalTime || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPayload((prev: any) => {
                        const panelToRemove = panels.find((p) => p.name === t);
                        let relatedIds: string[] = [];
                        if (panelToRemove?.tests && panelToRemove.tests.length) {
                          relatedIds = panelToRemove.tests.map((test: any) => test._id);
                        } else {
                          relatedIds = tests
                            .filter((test) => test.panels?.some((panel) => panel.name === t))
                            .map((test) => test._id);
                        }
                        const relatedTestIds = new Set(relatedIds);
                        return {
                          ...prev,
                          panels: prev.panels.filter((panel: string) => panel !== t),
                          test: prev.test.filter((testItem: { name: string }) => !relatedTestIds.has(testItem.name)),
                        };
                      });
                    }}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {payload.test.filter((t: any) => {
            const selectedPanels = panels.filter(p => payload.panels.includes(p.name))
            const panelTests = selectedPanels.flatMap(e => e.tests).map((e: any) => e._id)
            return !panelTests.includes(t.name)
          }).map((t: any, idx: number) => (
            <TableRow key={t.name}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{tests.find((test) => test._id === t.name)?.name}</TableCell>
              <TableCell>{formatINR(tests.find((test) => test._id === t.name)?.price || 0)}</TableCell>
              <TableCell>{tests.find((test) => test._id === t.name)?.estimatedTime}</TableCell>
              <TableCell>
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    setPayload((prev: any) => ({
                      ...prev,
                      test: prev.test.filter((n: any) => n.name !== t.name),
                    }));
                  }}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div className="text-lg font-semibold text-gray-700">
          Grand Total: <span className="text-blue-600">{formatINR(grandTotal)}</span>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setDraftToDelete(draft.id);
              }}
            >
            Cancel
            </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
          >
            Book Test
          </Button>
        </div>
      </div>
    </div>
  );
}
