"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import PharmacyHeader from "../components/PharmacyHeader";
import MedicalCertificatePanel from "../billing/medical-certificate/MedicalCertificatePanel";

export default function CertificatePage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] w-full p-5 text-slate-900 dark:text-slate-100">
        <div className="mb-4 flex flex-col gap-5 print:hidden">
          <PharmacyHeader
            title="Medical Certificate"
            subtitle="Saved certificates"
          >
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="bg-(--color-synapse-light) hover:bg-(--color-synapse-light)/90 text-white rounded-xl gap-2 font-semibold shadow-xs cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              Create Certificate
            </Button>
          </PharmacyHeader>
          <MedicalCertificatePanel
            createOpen={createOpen}
            onCreateOpenChange={setCreateOpen}
          />
        </div>
      </div>
    </AppShell>
  );
}
