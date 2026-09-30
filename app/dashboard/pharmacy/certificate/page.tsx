"use client";

import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "../components/PharmacyHeader";
import MedicalCertificatePanel from "../billing/medical-certificate/MedicalCertificatePanel";

export default function CertificatePage() {
  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] w-full p-5 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col gap-5">
          <PharmacyHeader
            title="Medical Certificate"
            subtitle="Create, save, and print medical certificates"
          />
          <MedicalCertificatePanel />
        </div>
      </div>
    </AppShell>
  );
}
