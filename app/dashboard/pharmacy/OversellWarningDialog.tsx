"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OversellWarning } from "@/lib/pharmacyReceiptLine";

export default function OversellWarningDialog({
  open,
  lines,
  onOpenChange,
  onConfirm,
  onDecline,
}: {
  open: boolean;
  lines: OversellWarning[];
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {lines.map((line) => (
                <span key={line.index} className="block mb-2">
                  {line.name}
                  <br />
                  Available quantity: {line.available} <br />
                  Entered quantity: {line.quantity}
                </span>
              ))}
              <br />
              <span className="text-destructive">
                The quantity you entered exceeds the available stock.
              </span>{" "}
              Do you want to continue anyway?
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>No</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
