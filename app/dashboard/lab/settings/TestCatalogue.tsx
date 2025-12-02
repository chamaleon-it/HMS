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
import { testPanel } from "@/data/testPanel";

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

  const [tests, setTests] = useState<ProfileType["lab"]["tests"]>([]);

  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      showProfilesOnPatientBill:
        profile?.lab?.catalogue?.showProfilesOnPatientBill ?? false,
      allowEditingPanelComposition:
        profile?.lab?.catalogue?.allowEditingPanelComposition ?? false,
    }));
    setTests(profile?.lab?.tests ?? []);
  }, [profile]);

  const [loading, setLoading] = useState(false);

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
    type: "Lab" | "Imaging" | "";
    panel: string;
    min?: number;
    max?: number;
    unit: string;
    estimatedTime: number;
  }>({
    code: "",
    name: "",
    type: "",
    panel: "",
    unit: "",
    estimatedTime: 0,
  });

  const addNewTest = async () => {
    try {
      if (!newTest.code || !newTest.name || !newTest.type || !newTest.unit || !newTest.panel || !newTest.estimatedTime) {
        toast.error("Please fill all required fields");
        return;
      }




      await toast.promise(api.patch("/users/lab/tests", newTest), {
        loading: "Adding test...",
        success: "Test added successfully",
        error: ({ response }) => response.data.message,
      });

      profileMutate();

      setNewTest({
        code: "",
        name: "",
        type: "",
        panel: "",
        unit: "",
        min: undefined,
        max: undefined,
        estimatedTime: 0,
      });

    } catch (error) {
      console.log(error);
      setTests(profile?.lab?.tests ?? []);
    }
  };



  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6">
          <SectionHeader
            title="Master test catalogue"
            description="Manage all individual tests, panels and profiles."
            emoji="🧬"
          />

          <div className="mt-6 grid gap-4">
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
              <div className="col-span-5 space-y-1.5">
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
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Type *</Label>
                <Select
                  value={newTest.type}
                  onValueChange={(val: "Lab" | "Imaging") => setNewTest(prev => ({ ...prev, type: val }))}
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

              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Panel *</Label>
                <Select
                  value={newTest.panel}
                  onValueChange={(val: string) => setNewTest(prev => ({ ...prev, panel: val }))}
                >
                  <SelectTrigger className="h-9 bg-slate-50 w-full">
                    <SelectValue placeholder="Select panel" />
                  </SelectTrigger>
                  <SelectContent className="w-full h-72">
                    {
                      testPanel.map((panel) => (
                        <SelectItem key={panel} value={panel}>
                          {panel}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>


              <div className="col-span-3 space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Estimated Time (Minutes) *</Label>
                <Input
                  placeholder="e.g. 30"
                  value={newTest.estimatedTime === 0 ? "" : newTest.estimatedTime}
                  type="number"
                  onChange={(e) =>
                    setNewTest((prev) => ({ ...prev, estimatedTime: Number(e.target.value) }))
                  }
                  className="h-9 bg-slate-50"
                />
              </div>

              <div className="col-span-3 space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Range Min</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newTest.min ?? ""}
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
                  value={newTest.max ?? ""}
                  onChange={(e) =>
                    setNewTest((prev) => ({ ...prev, max: Number(e.target.value) }))
                  }
                  className="h-9 bg-slate-50"
                />
              </div>
              <div className="col-span-3 space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Unit *</Label>
                <Input
                  placeholder="e.g. mg/dL"
                  value={newTest.unit}
                  onChange={(e) =>
                    setNewTest((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  className="h-9 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">

              <div className="col-span-3 flex items-end">
                <Button
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={addNewTest}
                >
                  Add Test
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Configured Tests</h4>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Estimated Time (Minutes)</TableHead>
                    <TableHead>Panel</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                        No tests configured yet. Add one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tests.map((test, idx) => (
                      <TableRow key={idx}>
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
                      </TableRow>
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

        {/* Helper Card */}
        <Card className="border border-dashed border-slate-200 bg-white/50 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold text-slate-900 mb-1">Quick Tips</h4>
            <ul className="text-[11px] text-slate-500 list-disc pl-4 space-y-1">
              <li>Use standard LOINC codes for <b>Test Code</b> if possible.</li>
              <li><b>Min/Max</b> values help in auto-flagging abnormal results.</li>
              <li>Tests added here will be available in the &quot;Add Test&quot; dropdown during billing.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
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
  emoji: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 rounded-2xl bg-cyan-50 p-2 flex items-center justify-center">
      <span className="text-lg">{emoji || "🧪"}</span>
    </div>
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
