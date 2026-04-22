"use client";
import NewOrderForm from "../components/NewOrderForm";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function NewOrderPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto h-full">
          <NewOrderForm isPopup={true} />
        </div>
      </TooltipProvider>
    </div>
  );
}
