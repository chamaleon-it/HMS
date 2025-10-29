import React, { useCallback, useMemo, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function DeletePatient({
  patientName = "this patient",
  id = "",
  tableMutate,
}: {
  tableMutate: () => void;
  id: string;
  patientName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const displayName = useMemo(
    () => patientName || "this patient",
    [patientName]
  );

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      await toast.promise(api.delete(`/patients/${id}`), {
        loading: "Patient account is deleting...!",
        success: ({ data }) => data.message,
        error: ({ response }) =>
          response?.data?.message ||
          "Patient is not deleted, Please try again.",
      });
      tableMutate();
      setOpen(false);
    } catch (err) {
      console.log("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  }, [id, tableMutate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            "px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
          }
          aria-label={`Delete ${displayName}`}
        >
          Delete
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete patient</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{displayName}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={loading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleDelete}
            disabled={loading}
            aria-disabled={loading}
            aria-label={`Confirm delete ${displayName}`}
            className="ml-2 cursor-pointer"
            variant="destructive"
          >
            {loading ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="animate-spin mr-2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.25"
                  />
                  <path
                    d="M22 12a10 10 0 00-10-10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              "Delete patient"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
