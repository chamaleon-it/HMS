import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Printer, Calendar, Tag, Building2, CreditCard, Barcode, Trash2, Edit } from "lucide-react";
import { ItemType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";

export function ViewItem({ item, editItem, mutate, onClose }: { item: ItemType, editItem: () => void, mutate: () => void, onClose: () => void }) {


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
    [mutate, onClose]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const sortedBatches = item?.batches ? [...item.batches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
  const totalPages = Math.ceil(sortedBatches.length / ITEMS_PER_PAGE);
  const paginatedBatches = sortedBatches.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-2 space-y-4 text-sm max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {item.name}
            </h2>
            <Badge variant={item.status === "Active" ? "default" : "secondary"} className={item.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : ""}>
              {item.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">Gen: {item.generic}</span>
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">HSN: {item.hsnCode}</span>
          </div>
        </div>
        {/* <Button variant="outline" size="sm" className="gap-2 h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
          <Printer className="h-3.5 w-3.5" />
          Print Label
        </Button> */}
      </div>

      {/* Stock / Status - REPLACED BY NEW SALES CARDS SECTION BELOW, REMOVING OLD STOCK CARDS IF REDUNDANT, BUT USER ASKED FOR ALL UI IMPROVEMENT. LET'S KEEP STOCK BUT MODERNIZE IT OR MERGE WITH DETAILS. Let's make it a compact stat row below header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-slate-50/50 p-4">
          <div className="text-xs font-medium text-slate-500 mb-1">Current Stock</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{item.quantity}</span>
            <span className="text-sm font-medium text-slate-500">units</span>
          </div>
        </div>
        <div className="rounded-xl border bg-slate-50/50 p-4 flex flex-col justify-center">
          <div className="text-xs font-medium text-slate-500 mb-2">Availability</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.quantity > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm font-semibold text-slate-700">{item.quantity > 0 ? "In Stock" : "Out of Stock"}</span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 rounded-xl border p-4 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product Details</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="w-3 h-3" /> SKU
              </div>
              <div className="text-sm font-medium text-gray-900">{item.sku}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3" /> Supplier
              </div>
              <div className="text-sm font-medium text-gray-900">{item.supplier}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="w-3 h-3" /> Unit Price
              </div>
              <div className="text-sm font-medium text-gray-900">₹ {item.unitPrice}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" /> Expiry
              </div>
              <div className="text-sm font-medium text-gray-900">{fDate(item.expiryDate)}</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 rounded-xl border bg-slate-50 p-4 flex flex-col items-center justify-center gap-2 text-center">
          <Barcode className="h-8 w-8 text-slate-400 mb-1" />
          <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Scannable ID</div>
          <div className="w-full h-12 bg-white border rounded p-1 flex items-center justify-center">
            <div className="w-full h-full bg-[repeating-linear-gradient(90deg,black_0px,black_1px,transparent_1px,transparent_3px)] opacity-80" />
          </div>
          <div className="font-mono text-xs font-medium text-slate-700">{item.sku}</div>
        </div>
      </div>

      {/* <div className="grid grid-cols-2 gap-4">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Medicine Sales</p>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold text-gray-900">₹ 12,450</div>
              <div className="flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="mr-1 h-3 w-3" />
                +15% from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Medicine Purchase</p>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold text-gray-900">₹ 45,200</div>
              <div className="flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="mr-1 h-3 w-3" />
                +4% from last month
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          Batch History
        </h3>
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="w-[120px] h-10 text-xs font-semibold text-gray-600">Date Added</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-gray-600">Batch No</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-gray-600">Expiry</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-gray-600">Supplier</TableHead>
                <TableHead className="text-right h-10 text-xs font-semibold text-gray-600">Price</TableHead>
                <TableHead className="text-right h-10 text-xs font-semibold text-gray-600">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    No batch history found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBatches?.map((batch) => (
                  <TableRow key={batch._id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <TableCell className="text-xs py-3 font-medium text-slate-700">{fDate(batch.createdAt)}</TableCell>
                    <TableCell className="font-mono text-xs py-3 text-slate-600 bg-slate-50/50 rounded-sm w-fit px-2">{batch.batchNumber}</TableCell>
                    <TableCell className="text-xs py-3 text-slate-600">{fDate(batch.expiryDate)}</TableCell>
                    <TableCell className="text-xs py-3 text-slate-600">{batch.supplier || "-"}</TableCell>
                    <TableCell className="text-right text-xs py-3 text-slate-900 font-medium">{formatINR(batch.purchasePrice)}</TableCell>
                    <TableCell className="text-right text-xs py-3 font-medium text-purple-600 bg-purple-50/30">{batch.quantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {sortedBatches.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)?.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(page);
                }}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t mt-2">
        <Button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg gap-2" onClick={() => editItem()}>
          <Edit className="w-4 h-4" />
          Edit Item
        </Button>

        <AlertDialog >
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex-1 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Item
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="!max-w-sm rounded-xl">
            {/* ... existing alert content doesn't need much change save for maybe rounding ... */}
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will
                permanently delete the item{" "}
                <span className="font-semibold text-gray-900">
                  {item?.name}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteItem(item._id)}
                className="bg-red-600 text-white hover:bg-red-700 rounded-lg"
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
