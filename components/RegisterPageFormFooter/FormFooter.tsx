import { Shield } from "lucide-react";
import React from "react";

export default function FormFooter() {
  return (
    <>
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-[var(--brand)]" />
          <span>HIPAA-ready</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-[var(--brand)]" />
          <span>HL7&reg; FHIR</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-[var(--brand)]" />
          <span>ISO 27001</span>
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] text-slate-400">
        Badges indicate design readiness; formal compliance depends on your
        deployment & policies.
      </p>
    </>
  );
}
