"use client";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useLabDrafts } from "@/app/dashboard/lab/LabDraftContext";

interface NewTestProps {
  mutate?: () => void;
}

export default function NewTest({ mutate }: NewTestProps) {
  const { addDraft } = useLabDrafts();

  useEffect(() => {
    const handleRefresh = () => mutate?.();
    window.addEventListener('lab-test-created', handleRefresh);
    return () => window.removeEventListener('lab-test-created', handleRefresh);
  }, [mutate]);

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        onClick={() => addDraft({}, "Book Now")}
        className="rounded-full px-4 py-2 h-auto font-medium text-white shadow-sm"
        style={{ background: "linear-gradient(90deg, #4f46e5, #ec4899)" }}
      >
        <Plus size={16} className="mr-2" /> Add Test
      </Button>
    </div>
  );
}
