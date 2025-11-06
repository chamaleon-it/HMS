import { Button } from "@/components/ui/button";
import { ItemType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export function ViewItem({ item,editItem,mutate,onClose }: { item: ItemType,editItem:()=>void,mutate:()=>void,onClose:()=>void }) {


  const deleteItem = useCallback(
    async (_id: string) => {
      await toast.promise(api.delete(`/pharmacy/items/${_id}`), {
        loading: "Item is deleting...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      if (mutate) {
        mutate();
      }
      onClose()
    },
    [mutate,onClose]
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold text-gray-900">
            {item.name}
          </div>
          <div className="text-xs text-gray-500">(Gen: {item.generic})</div>
          <div className="text-[11px] text-gray-400">HSN: {item.hsnCode}</div>
        </div>
        <Button variant="ghost" className="text-xs text-purple-600">
          Print Label
        </Button>
      </div>

      {/* Stock / Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3 bg-gray-50">
          <div className="text-[11px] text-gray-500">Current Stock</div>
          <div className="text-lg font-bold text-gray-900">
            {item.quantity} units
          </div>
        </div>
        <div className="rounded-lg border p-3 bg-gray-50">
          <div className="text-[11px] text-gray-500">Status</div>
          <div
            className={`inline-flex items-center gap-1 text-[13px] font-medium ${
              item.status === "Active" ? "text-green-600" : "text-gray-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                item.status === "Active" ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {item.status}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="rounded-lg border p-3">
        <div className="grid grid-cols-2 gap-y-2 text-[12px] text-gray-600">
          <div className="font-medium text-gray-800">SKU</div>
          <div>{item.sku}</div>

          <div className="font-medium text-gray-800">Category</div>
          <div>{item.category}</div>

          <div className="font-medium text-gray-800">Supplier</div>
          <div>{item.supplier}</div>

          <div className="font-medium text-gray-800">Expiry</div>
          <div>{fDate(item.expiryDate)}</div>

          <div className="font-medium text-gray-800">Unit Price</div>
          <div>₹ {item.unitPrice}</div>
        </div>
      </div>

      {/* Barcode mock */}
      <div className="rounded-lg border p-3 flex flex-col items-center gap-2">
        <div className="text-[11px] text-gray-500">Barcode / Label</div>
        <div className="w-40 h-10 bg-[repeating-linear-gradient(90deg,black_0px,black_2px,white_2px,white_4px)] rounded" />
        <div className="text-[11px] tracking-wider text-gray-700">
          {item.sku}
        </div>
      </div>

      {/* Movement History */}
      {/* <div className="rounded-lg border p-3">
        <div className="text-xs font-semibold text-gray-800 mb-2">
          Stock Movements
        </div>
        <div className="space-y-2 text-[12px] text-gray-600">
          
          <div className="flex justify-between">
            <span className="text-green-600 font-medium">+40 received</span>
            <span className="text-gray-400">28 Oct 2025 • by Admin</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 font-medium">-3 dispensed</span>
            <span className="text-gray-400">27 Oct 2025 • Rx #5521</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 font-medium">
              -2 wastage (expired)
            </span>
            <span className="text-gray-400">10 Oct 2025</span>
          </div>
        </div>
      </div> */}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button className="bg-purple-600 text-white flex-1" onClick={()=>editItem()}>Edit Item</Button>
        
        


         <AlertDialog >
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1">
          Delete
        </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent  className="!max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the item{" "}
                              <span className="font-semibold">
                                {item?.name}
                              </span>
                              .
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteItem(item._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete Item
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
      </div>
    </div>
  );
}
