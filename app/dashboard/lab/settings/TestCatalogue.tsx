import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

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
      allowEditingPanelComposition: profile?.lab?.catalogue?.allowEditingPanelComposition ?? false,
    }));
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent>
          <SectionHeader
            title="Master test catalogue"
            description="Manage all individual tests, panels and profiles."
            emoji="🧬"
          />
          <div className="space-y-5 text-sm">
            <p className="text-[12px] text-slate-500">
              All tests configured here are available across OP, IP and external
              lab orders.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeader
            title="Panels & profiles"
            description="Group common tests together for quick ordering."
            emoji="📦"
          />
          <div className="space-y-4 text-sm">
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
          <div className="flex justify-end mt-5">
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
  <div className="flex items-start gap-3 mb-4">
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
