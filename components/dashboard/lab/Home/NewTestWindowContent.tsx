"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PatientSelection from "./PatientSelection";
import { Trash } from "lucide-react";
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
import useGetGroups from "@/data/useGetGroups";
import { formatINR } from "@/lib/fNumber";
import DoctorSelection from "./DoctorSelection";
import TechnicianSelection from "./TechnicianSelection";
import TestSelection from "./TestSelection";
import { LabDraft, useLabDrafts } from "@/app/dashboard/lab/LabDraftContext";

export default function NewTestWindowContent({ draft }: { draft: LabDraft }) {
  const { updateDraft, removeDraft, setDraftToDelete } = useLabDrafts();
  const { panels } = useGetPanels();
  const { tests } = useGetTest();
  const { groups } = useGetGroups();

  const payload = draft.payload;

  const setPayload = (updater: any) => {
    updateDraft(draft.id, (prev) => ({
      payload: typeof updater === 'function' ? updater(prev.payload) : { ...prev.payload, ...updater }
    }));
  };

  const handleSubmit = async () => {
    if (!payload.patient) {
      toast.error("Please select patient");
      return;
    }
    // Book Now only — always submit with current time
    const submitDate = new Date();

    if (payload.test.length === 0) {
      toast.error("Please select at least one test");
      return;
    }

    try {
      await toast.promise(
        api.post("/lab/report", {
          ...payload,
          date: submitDate.toISOString(),
          doctor: !payload.doctor || payload.doctor === "self" ? null : payload.doctor,
          technician: payload.technician || undefined,
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
    const groupsTotal = (payload.groups || []).reduce((acc, groupName) => {
      const group = groups.find((g) => g.name === groupName);
      return acc + (group?.price || 0);
    }, 0);

    const groupTestIds = new Set<string>();
    const groupPanelNames = new Set<string>();

    (payload.groups || []).forEach((groupName) => {
      const group = groups.find((g) => g.name === groupName);
      if (group) {
        group.tests?.forEach((t) => groupTestIds.add(t._id));
        group.panels?.forEach((p) => groupPanelNames.add(p.name));
      }
    });

    const panelsTotal = payload.panels.reduce((acc, panelName) => {
      if (groupPanelNames.has(panelName)) return acc;
      const panel = panels.find((p) => p.name === panelName);
      return acc + (panel?.price || 0);
    }, 0);

    const selectedPanelNames = [
      ...payload.panels,
      ...Array.from(groupPanelNames),
    ];
    const panelTestIds = new Set<string>();
    selectedPanelNames.forEach((panelName) => {
      const panel = panels.find((p) => p.name === panelName);
      if (panel) {
        if (panel.tests && panel.tests.length) {
          panel.tests.forEach((t) => panelTestIds.add(t._id));
        } else {
          tests
            .filter((t) => t.panels?.some((p) => p.name === panelName))
            .forEach((t) => panelTestIds.add(t._id));
        }
      }
    });

    const independentTestsTotal = payload.test
      .filter((t) => {
        return !panelTestIds.has(t.name) && !groupTestIds.has(t.name);
      })
      .reduce((acc, t) => {
        const testObj = tests.find((test) => test._id === t.name);
        return acc + (testObj?.price || 0);
      }, 0);

    return groupsTotal + panelsTotal + independentTestsTotal;
  }, [payload.groups, payload.panels, payload.test, panels, tests, groups]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PatientSelection
          patientName={draft.patientName}
          autoFocus
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-0.5 items-stretch">
          <div className="flex flex-col gap-1.5 p-2.5 border border-slate-200 bg-slate-50/40 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-slate-200/60 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stethoscope"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
              </div>
              <Label className="text-xs font-semibold text-slate-700">Doctor</Label>
            </div>
            <DoctorSelection
              hideLabel
              doctor={payload.doctor ?? undefined}
              doctorName={payload.doctorName}
              setValue={(id: string | undefined) => {
                setPayload((prev: any) => ({ ...prev, doctor: id ?? null }));
              }}
              onNameChange={(name: string) => {
                setPayload((prev: any) => ({ ...prev, doctorName: name }));
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5 p-2.5 border border-slate-200 bg-slate-50/40 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-slate-200/60 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><circle cx="19" cy="11" r="2" /><path d="m19 13.5 0 .5" /><path d="m19 8.5 0 .5" /></svg>
              </div>
              <Label className="text-xs font-semibold text-slate-700">Technician In-charge</Label>
            </div>
            <TechnicianSelection
              hideLabel
              technicianName={payload.technician}
              setValue={(name: string) => {
                setPayload((prev: any) => ({ ...prev, technician: name }));
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-between w-full">
        <div className="w-[300px]">
          <TestSelection
            onSelect={(val) => {
              if (!val) return;
              const isGroup = groups.find((g) => g.name === val);
              if (isGroup) {
                setPayload((prev: any) => {
                  if (prev.groups?.includes(val)) return prev;
                  const groupTests = isGroup.tests || [];
                  const groupPanels = isGroup.panels || [];

                  let groupPanelTests: any[] = [];
                  groupPanels.forEach((gp) => {
                    if (gp.tests && gp.tests.length) {
                      groupPanelTests.push(...gp.tests.map((t: any) => ({ name: t._id || t })));
                    } else {
                      const foundPanel = panels.find((p) => p.name === gp.name);
                      if (foundPanel && foundPanel.tests) {
                        groupPanelTests.push(...foundPanel.tests.map((t: any) => ({ name: t._id || t })));
                      }
                    }
                  });

                  const newTests = [
                    ...groupTests.map((t: any) => ({ name: t._id })),
                    ...groupPanelTests,
                  ];

                  return {
                    ...prev,
                    groups: [...(prev.groups || []), val],
                    panels: [...prev.panels, ...groupPanels.map((p) => p.name).filter((name) => !prev.panels.includes(name))],
                    test: [
                      ...prev.test,
                      ...newTests.filter((nt: any) => !prev.test.some((pt: any) => pt.name === nt.name)),
                    ],
                  };
                });
                return;
              }

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
              ...groups.filter((g) => !payload.groups?.includes(g.name)).map(e => e.name),
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

        <div className="flex gap-2 items-center" />
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
          {(payload.groups || []).map((groupName, idx) => {
            const group = groups.find((g) => g.name === groupName);
            return (
              <TableRow key={groupName}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-800">{groupName}</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full ml-2">
                    Package Group
                  </span>
                </TableCell>
                <TableCell>{formatINR(group?.price || 0)}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPayload((prev: any) => {
                        const groupToRemove = groups.find((g) => g.name === groupName);
                        const relatedTestIds = new Set(groupToRemove?.tests?.map((t: any) => t._id) || []);
                        const relatedPanelNames = new Set(groupToRemove?.panels?.map((p: any) => p.name) || []);
                        return {
                          ...prev,
                          groups: prev.groups.filter((g: string) => g !== groupName),
                          panels: prev.panels.filter((pName: string) => !relatedPanelNames.has(pName)),
                          test: prev.test.filter((tItem: { name: string }) => !relatedTestIds.has(tItem.name)),
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
          {payload.panels.filter((panelName) => {
            const isInGroup = (payload.groups || []).some((gName) => {
              const g = groups.find((group) => group.name === gName);
              return g?.panels?.some((p: any) => p.name === panelName);
            });
            return !isInGroup;
          }).map((t, idx) => {
            const panelTests = tests.filter((test) =>
              test.panels?.some((panel) => panel.name === t)
            );
            const totalTime = panelTests.reduce((acc, curr) => acc + (Number(curr.estimatedTime) || 0), 0);
            return (
              <TableRow key={t}>
                <TableCell>{(payload.groups?.length || 0) + idx + 1}</TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-800">{t}</span>
                  {panels.find((p) => p.name === t)?.department && (
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-100/80 border border-blue-200 px-2 py-0.5 rounded-full ml-2 uppercase">
                      {panels.find((p) => p.name === t)?.department}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-600 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full ml-2 uppercase">
                    Panel
                  </span>
                </TableCell>
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
            const groupPanelNames = new Set<string>();
            const groupTestIds = new Set<string>();
            (payload.groups || []).forEach((gName) => {
              const g = groups.find(group => group.name === gName);
              g?.panels?.forEach((p: any) => groupPanelNames.add(p.name));
              g?.tests?.forEach((test: any) => groupTestIds.add(test._id));
            });
            const allSelectedPanels = Array.from(new Set([...payload.panels, ...Array.from(groupPanelNames)]));
            const selectedPanelsData = panels.filter(p => allSelectedPanels.includes(p.name));
            const panelTests = selectedPanelsData.flatMap(e => e.tests || []).map((e: any) => e._id || e.toString());
            return !panelTests.includes(t.name) && !groupTestIds.has(t.name);
          }).map((t: any, idx: number) => (
            <TableRow key={t.name}>
              <TableCell>{(payload.groups?.length || 0) + payload.panels.filter(p => {
                return !(payload.groups || []).some(gName => {
                  const g = groups.find(group => group.name === gName);
                  return g?.panels?.some((p: any) => p.name === p);
                });
              }).length + idx + 1}</TableCell>
              <TableCell>
                <span className="font-semibold text-slate-800">{tests.find((test) => test._id === t.name)?.name}</span>
                {tests.find((test) => test._id === t.name)?.department && (
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded-full ml-2 uppercase">
                    {tests.find((test) => test._id === t.name)?.department}
                  </span>
                )}
              </TableCell>
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
