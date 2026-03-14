import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import TestCatalogueRow from "./TestCatalogueRow";
import useGetPanels from "@/data/useGetPanels";
import useSWR from "swr";
import AddTestsToPanelDialog from "./AddTestsToPanelDialog";
import RemoveTestsFromPanelDialog from "./RemoveTestsFromPanelDialog";
import { formatINR } from "@/lib/fNumber";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TestCatalogue({
  profile,
  profileMutate,
}: {
  profile?: ProfileType;
  profileMutate: () => void;
}) {
  const [payload, setPayload] = useState({
    showProfilesOnPatientBill: false,
    allowEditingPanelComposition: false,
  });



  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      showProfilesOnPatientBill:
        profile?.lab?.catalogue?.showProfilesOnPatientBill ?? false,
      allowEditingPanelComposition:
        profile?.lab?.catalogue?.allowEditingPanelComposition ?? false,
    }));
  }, [profile]);

  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isAddTestsDialogOpen, setIsAddTestsDialogOpen] = useState(false);
  const [isRemoveTestsDialogOpen, setIsRemoveTestsDialogOpen] = useState(false);
  const [isNewTestModalOpen, setIsNewTestModalOpen] = useState(false);
  const [isNewPanelModalOpen, setIsNewPanelModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const updateCatalogueSettings = async () => {
    try {
      setLoading(true);
      await toast.promise(api.patch("/users/lab/catalogue", payload), {
        loading: "Updating catalogue settings...!",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      profileMutate();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const [newTest, setNewTest] = useState<{
    code: string;
    name: string;
    price: number;
    type: "Lab" | "Imaging" | "";
    min?: number;
    max?: number;
    womenMin?: number;
    womenMax?: number;
    childMin?: number;
    childMax?: number;
    nbMin?: number;
    nbMax?: number;
    unit?: string;
    estimatedTime?: string;
    dataType: "number" | "text" | "boolean"
  }>({
    code: "",
    name: "",
    price: 0,
    type: "",
    dataType: "number"
  });

  const addNewTest = async () => {
    try {
      if (!newTest.code || !newTest.name || !newTest.type || !newTest.price) {
        toast.error("Please fill all required fields");
        return;
      }
      let finalPayload = { ...newTest };
      if (newTest.estimatedTime && typeof newTest.estimatedTime === 'string') {
        const [hoursStr, minutesStr] = newTest.estimatedTime.split(':');
        const hours = parseInt(hoursStr || '0', 10);
        const minutes = parseInt(minutesStr || '0', 10);
        finalPayload.estimatedTime = (hours * 60 + minutes) as any;
      }

      await toast.promise(api.post("/lab/panels/create_test", finalPayload), {
        loading: "Adding test...",
        success: "Test added successfully",
        error: ({ response }) => response.data.message,
      });

      testMutate();

      setNewTest({
        code: "",
        name: "",
        price: 0,
        type: "",
        dataType: "number"
      });
      setIsNewTestModalOpen(false);

    } catch (error) {
      console.log(error);
    }
  };

  const { panels, mutate: panelMutate } = useGetPanels();


  const { data, mutate: testMutate } = useSWR<{
    message: string;
    data: {
      _id: string;
      code: string;
      name: string;
      type: "Lab" | "Imaging";
      dataType: "number" | "text" | "boolean"
      price: number;
      min?: number;
      max?: number;
      womenMin?: number;
      womenMax?: number;
      childMin?: number;
      childMax?: number;
      nbMin?: number;
      nbMax?: number;
      unit?: string;
      estimatedTime?: string;
      panels: {
        name: string;
      }[]
    }[]
  }>("/lab/panels/tests");

  const tests = data?.data ?? [];
  const filteredTests = tests.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <SectionHeader
              title="Master test catalogue"
              description="Manage all individual tests, panels and profiles."
              emoji="🧬"
            />
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 bg-slate-50"
              />
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                onClick={() => setIsNewTestModalOpen(true)}
              >
                Add New Test
              </Button>
            </div>
          </div>

          <Dialog open={isNewTestModalOpen} onOpenChange={setIsNewTestModalOpen}>
            <DialogContent className="sm:max-w-200 max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Test</DialogTitle>
                <DialogDescription>Create a new lab or imaging test in the catalogue.</DialogDescription>
              </DialogHeader>
              <div className="mt-2 grid gap-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Test Code *</Label>
                    <Input
                      placeholder="e.g. CBC"
                      value={newTest.code}
                      onChange={(e) =>
                        setNewTest((prev) => ({ ...prev, code: e.target.value }))
                      }
                      className="h-9 bg-slate-50"
                    />
                  </div>
                  <div className="col-span-4 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Test Name *</Label>
                    <Input
                      placeholder="e.g. Complete Blood Count"
                      value={newTest.name}
                      onChange={(e) =>
                        setNewTest((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="h-9 bg-slate-50"
                    />
                  </div>


                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Price *</Label>
                    <Input
                      placeholder="e.g. 100"
                      value={newTest.price || ""}
                      onFocus={(e) => e.target.placeholder = ""}
                      onBlur={(e) => e.target.placeholder = "e.g. 100"}
                      onChange={(e) =>
                        setNewTest((prev) => ({ ...prev, price: Number(e.target.value) }))
                      }
                      className="h-9 bg-slate-50"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Type *</Label>
                    <Select
                      value={newTest.type}
                      onValueChange={(val: "Lab" | "Imaging") => setNewTest(prev => ({ ...prev, type: val, dataType: val === "Lab" ? "number" : "text" }))}
                    >
                      <SelectTrigger className="h-9 bg-slate-50 w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lab">Lab Test</SelectItem>
                        <SelectItem value="Imaging">Imaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>






                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Estimated Duration (HH:MM)</Label>
                    <Input
                      placeholder="HH:MM"
                      value={newTest.estimatedTime || ""}
                      type="text"
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 4) val = val.slice(0, 4);
                        if (val.length >= 3) val = `${val.slice(0, 2)}:${val.slice(2)}`;
                        setNewTest((prev) => ({ ...prev, estimatedTime: val }));
                      }}
                      className="h-9 bg-slate-50"
                    />
                  </div>

                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Unit</Label>
                    <Input
                      placeholder="e.g. mg/dL"
                      value={newTest.unit}
                      onChange={(e) =>
                        setNewTest((prev) => ({ ...prev, unit: e.target.value }))
                      }
                      className="h-9 bg-slate-50"
                    />
                  </div>

                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Data Type *</Label>
                    <Select
                      value={newTest.dataType}
                      onValueChange={(val: "number" | "text" | "boolean") => setNewTest(prev => ({ ...prev, dataType: val }))}
                    >
                      <SelectTrigger className="h-9 bg-slate-50 w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="boolean">Positive/Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newTest.dataType === "number" && <>

                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Range Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTest.min || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, min: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />
                    </div>



                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Range Max</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={newTest.max || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, max: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />
                    </div>




                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Women Range Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTest.womenMin || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, womenMin: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Women Range Max</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={newTest.womenMax || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, womenMax: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />
                    </div>

                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Child Range Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTest.childMin || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, childMin: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Child Range Max</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={newTest.childMax || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, childMax: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />
                    </div>


                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Newborn Range Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTest.nbMin || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, nbMin: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Newborn Range Max</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={newTest.nbMax || ""}
                        onChange={(e) =>
                          setNewTest((prev) => ({ ...prev, nbMax: Number(e.target.value) }))
                        }
                        className="h-9 bg-slate-50"
                      />

                    </div>
                  </>}

                  <div className="grid grid-cols-12 gap-4 col-span-full mt-4">
                    <div className="col-span-full flex justify-end items-end w-full gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsNewTestModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={addNewTest}
                      >
                        Save Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-8">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Configured Tests</h4>
            <div className="rounded-lg border border-slate-200 overflow-y-auto max-h-[calc(100vh-270px)]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
                  <TableRow>
                    <TableHead >Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>ETA (Minutes)</TableHead>
                    <TableHead>Panels</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500 text-xs">
                        {searchQuery ? "No tests found matching search criteria." : "No tests configured yet. Add one above."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTests.map((test, idx) => (
                      <TestCatalogueRow
                        key={idx}
                        test={test}
                        testMutate={testMutate}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">

        <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <SectionHeader
                title="Panels & Profiles"
                description="Manage all panels and group tests together."
                emoji="📦"
              />
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setIsNewPanelModalOpen(true)}
              >
                Add New Panel
              </Button>
            </div>

            <Dialog open={isNewPanelModalOpen} onOpenChange={setIsNewPanelModalOpen}>
              <DialogContent className="sm:max-w-150">
                <DialogHeader>
                  <DialogTitle>Add New Panel</DialogTitle>
                  <DialogDescription>Create a new panel in the catalogue.</DialogDescription>
                </DialogHeader>
                <AddPanelForm onSuccess={() => {
                  panelMutate();
                  setIsNewPanelModalOpen(false);
                }} onCancel={() => setIsNewPanelModalOpen(false)} />
              </DialogContent>
            </Dialog>

            <div className="mt-8">
              <h4 className="text-sm font-medium text-slate-900 mb-4">Configured Panels</h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead align="right" className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>

                    {panels.map((panel, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{panel.name}</TableCell>
                        <TableCell>{formatINR(panel.price)}</TableCell>
                        <TableCell align="right" className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            className="h-9 bg-slate-50"
                            onClick={() => {
                              setActivePanel(panel.name);
                              setIsAddTestsDialogOpen(true);
                            }}
                          >
                            Add Tests
                          </Button>

                          <Button
                            variant="outline"
                            className="h-9 bg-slate-50"
                            onClick={() => {
                              setActivePanel(panel.name);
                              setIsRemoveTestsDialogOpen(true);
                            }}
                          >
                            Remove Tests
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>

        </Card>


        <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <SectionHeader
              title="Panels & profiles"
              description="Group common tests together for quick ordering."
              emoji="📦"
            />
            <div className="space-y-4 text-sm mt-4">
              <FieldRow
                label="Show profiles on patient bill"
                description="Show only profile name instead of individual tests."
              >
                <Switch
                  checked={payload.showProfilesOnPatientBill}
                  onCheckedChange={(v) =>
                    setPayload((prev) => ({
                      ...prev,
                      showProfilesOnPatientBill: v,
                    }))
                  }
                />
              </FieldRow>
              <FieldRow
                label="Allow editing panel composition"
                description="Permit lab admin to add/remove tests from predefined panels."
              >
                <Switch
                  checked={payload.allowEditingPanelComposition}
                  onCheckedChange={(v) =>
                    setPayload((prev) => ({
                      ...prev,
                      allowEditingPanelComposition: v,
                    }))
                  }
                />
              </FieldRow>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                size="default"
                className="h-9 gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                onClick={updateCatalogueSettings}
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? "Updating" : "Save Catalogue"}
              </Button>
            </div>
          </CardContent>
        </Card>


      </div>

      <AddTestsToPanelDialog
        panelName={activePanel || ""}
        allTests={tests}
        open={isAddTestsDialogOpen}
        onOpenChange={setIsAddTestsDialogOpen}
        onSuccess={() => {
          panelMutate();
          testMutate();
        }}
      />

      <RemoveTestsFromPanelDialog
        panelName={activePanel || ""}
        allTests={tests}
        open={isRemoveTestsDialogOpen}
        onOpenChange={setIsRemoveTestsDialogOpen}
        onSuccess={() => {
          panelMutate();
          testMutate();
        }}
      />
    </div>
  );
}

const SectionHeader = ({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji?: string;
}) => (
  <div className="flex items-start gap-3">
    {emoji && <div className="mt-1 rounded-2xl bg-cyan-50 p-2 flex items-center justify-center">
      <span className="text-lg">{emoji || "🧪"}</span>
    </div>}
    <div>
      <h3 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="text-xs text-slate-500 leading-snug">{description}</p>
    </div>
  </div>
);

const FieldRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] md:text-sm font-medium text-slate-800">
          {label}
        </p>
        {description && (
          <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-1 max-w-sm flex justify-end">{children}</div>
    </div>
    <div className="mt-1 h-px bg-slate-200" />
  </div>
);



const AddPanelForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {


  const [payload, setPayload] = useState({
    name: "",
    price: 0,
  })
  const [loading, setLoading] = useState(false)

  const addPanel = async () => {
    try {
      if (!payload.name) {
        toast.error("Please enter a name");
        return;
      }
      setLoading(true)
      await toast.promise(api.post("/lab/panels", payload), {
        loading: "Adding panel...",
        success: "Panel added successfully",
        error: ({ response }) => response.data.message,
      })
      setPayload({
        name: "",
        price: 0,
      })
      onSuccess()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return <div className="mt-4 grid gap-4">
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-6 space-y-1.5">
        <Label className="text-xs font-medium text-slate-700">Name *</Label>
        <Input className="h-9 bg-slate-50" placeholder="e.g. CBC Panel" value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} />
      </div>
      <div className="col-span-12 md:col-span-6 space-y-1.5">
        <Label className="text-xs font-medium text-slate-700">Price *</Label>
        <Input type="number" className="h-9 bg-slate-50" placeholder="e.g. 500" value={payload.price || ""} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} />
      </div>
      <div className="col-span-full flex justify-end items-end w-full gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={addPanel} disabled={loading}>{loading ? "Adding..." : "Save Panel"}</Button>
      </div>
    </div>
  </div>
}
