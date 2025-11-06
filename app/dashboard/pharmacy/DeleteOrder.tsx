import React, { useCallback, useState } from "react";
import { OrderType } from "./interface";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  selected?: OrderType | null;
  onDeleted?: () => void;
}

export default function DeleteOrder({
  open,
  setOpen,
  selected,
  onDeleted,
}: Props) {
  const [loading, setLoading] = useState(false);

  const deleteOrder = useCallback(
    async (id?: string) => {
      if (!id) {
        toast.error("Order id is missing.");
        return;
      }

      setLoading(true);
      try {
        // toast.promise expects a promise; pass axios.delete directly
        const result = await toast.promise(
          api.delete(`/pharmacy/orders/${id}`),
          {
            loading: "Deleting order...",
            success: (res) =>
              res?.data?.message ? res.data.message : "Order deleted.",
            error: (err) =>
              err?.response?.data?.message ||
              err?.message ||
              "Failed to delete order.",
          }
        );

        setOpen(false);
        onDeleted?.();
        return result;
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    },
    [setOpen, onDeleted]
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="!max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will permanently delete the order{" "}
            <strong>{selected?.mrn}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className="cursor-pointer disabled:cursor-not-allowed">Cancel</AlertDialogCancel>
          <Button
            className="bg-red-600 hover:bg-red-700 font-bold cursor-pointer disabled:cursor-not-allowed"
            onClick={() => deleteOrder(selected?._id)}
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Order"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
