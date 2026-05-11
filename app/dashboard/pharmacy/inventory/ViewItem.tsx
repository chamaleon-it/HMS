import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Printer, Calendar, Tag, Building2, CreditCard, Barcode, Trash2, Edit, Truck, Factory, Banknote, MapPin, Percent, Hash, Layers, Coins, FileText, ShoppingCart, History, ArrowLeftRight } from "lucide-react";
import { ItemType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays, format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, FilterX, History as HistoryIcon, Barcode as BarcodeIcon } from "lucide-react";
import { PaginationBar } from "../components/PaginationBar";



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

  const [activeTab, setActiveTab] = useState<"Batch History" | "Medicine History">("Batch History");
  const [pagination, setPagination] = useState({ page: 1, limit: 5 });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);


  const tabs = useMemo(() => [
    { key: "Batch History", icon: Package },
    { key: "Medicine History", icon: History },
  ], []);

  const sortedData = useMemo(() => {
    if (activeTab === "Batch History") {
      return item?.batches ? [...item.batches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
    } else {
      let filtered = item?.soldHistory ? [...item.soldHistory] : [];
      if (dateRange?.from) {
        filtered = filtered.filter(h => {
          const d = new Date(h.date);
          if (dateRange.to) {
            return d >= startOfDay(dateRange.from!) && d <= endOfDay(dateRange.to);
          }
          return d >= startOfDay(dateRange.from!);
        });
      }

      // Grouping logic
      const groups: Record<string, { date: Date, quantity: number, unitPrice: number, total: number }> = {};
      filtered.forEach(h => {
        const d = new Date(h.date);
        const dateKey = format(d, "yyyy-MM-dd");
        const price = h.unitPrice;
        const key = `${dateKey}_${price}`;

        if (groups[key]) {
          groups[key].quantity += h.quantity;
          groups[key].total += h.total;
        } else {
          groups[key] = {
            date: d,
            quantity: h.quantity,
            unitPrice: price,
            total: h.total
          };
        }
      });

      return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }, [item, activeTab, dateRange]);

  const salesStats = useMemo(() => {
    if (activeTab !== "Medicine History") return null;
    
    let filtered = item?.soldHistory ? [...item.soldHistory] : [];
    if (dateRange?.from) {
      filtered = filtered.filter(h => {
        const d = new Date(h.date);
        if (dateRange.to) {
          return d >= startOfDay(dateRange.from!) && d <= endOfDay(dateRange.to);
        }
        return d >= startOfDay(dateRange.from!);
      });
    }

    const totalQuantitySold = filtered.reduce((acc, h) => acc + h.quantity, 0);
    const totalSales = filtered.reduce((acc, h) => acc + h.total, 0);
    const averageUnitPrice = totalQuantitySold > 0 ? totalSales / totalQuantitySold : 0;

    return { totalQuantitySold, totalSales, averageUnitPrice };
  }, [item, activeTab, dateRange]);


  const paginatedData = useMemo(() => {
    return sortedData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);
  }, [sortedData, pagination]);




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

        <div className="flex flex-col items-end gap-1">
          <div className="h-10 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center shadow-sm">
            <div className="w-32 h-full bg-[repeating-linear-gradient(90deg,black_0px,black_1px,transparent_1px,transparent_3px)] opacity-80" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <span className="font-mono tracking-wider">{item.sku}</span>
          </div>
        </div>
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
      {/* Info grid */}
      <div className="rounded-xl border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product Details</h3>
        <div className="grid grid-cols-4 gap-6">
          {/* Row 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
              </div>
              SKU
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.sku}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
              </div>
              Supplier
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.supplier}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Unit Price
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">₹ {item.unitPrice}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              MRP
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">₹ {item.mrp}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
              </div>
              Expiry
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{fDate(item.expiryDate)}</div>
          </div>

          {/* Row 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-orange-600" />
              </div>
              Category
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.category}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              Manufacturer
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.manufacturer}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-teal-600" />
              </div>
              Total Value
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{formatINR(item.quantity * item.unitPrice)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              HSN
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.hsnCode}</div>
          </div>

          {/* Row 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-pink-600" />
              </div>
              Rack
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.rackLocation || "-"}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-yellow-600" />
              </div>
              Packing
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.packing}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                <ArrowLeftRight className="w-3.5 h-3.5 text-rose-600" />
              </div>
              Sold Quantity
            </div>
            <div className="text-sm font-bold text-slate-900 pl-8">{item.soldQuantity}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-slate-100">
        <div className="relative inline-flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-full p-1 shadow-xs">
          {tabs.map(({ key, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as any);
                  setPagination({ page: 1, limit: 5 });
                }}

                className={
                  "relative flex items-center gap-2 rounded-full px-5 py-1.5 transition-all duration-300 will-change-transform cursor-pointer " +
                  (active ? "text-white" : "text-slate-500 hover:text-slate-900")
                }
                type="button"
              >
                {active && (
                  <motion.span
                    layoutId="tab-indicator-view"
                    className="absolute inset-0 rounded-full shadow-md"
                    style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  <Icon size={14} /> {key}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "Medicine History" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 rounded-full px-4 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 gap-2",
                    dateRange?.from && "border-indigo-500 bg-indigo-50 text-indigo-700"
                  )}
                >
                  <CalendarIcon size={14} />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by Date Range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden" align="end">
                <CalendarUI
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}

                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {dateRange && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDateRange(undefined);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}

                className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                title="Clear Filter"
              >
                <FilterX size={16} />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {activeTab === "Medicine History" && salesStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Quantity Sold</p>
                  <p className="text-xl font-bold text-emerald-900">{salesStats.totalQuantitySold}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Avg. Unit Price</p>
                  <p className="text-xl font-bold text-blue-900">{formatINR(salesStats.averageUnitPrice)}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Total Sales</p>
                  <p className="text-xl font-bold text-indigo-900">{formatINR(salesStats.totalSales)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">

          <Table>
            <TableHeader className="bg-slate-700 hover:bg-slate-700">
              <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                {activeTab === "Batch History" ? (
                  <>
                    <TableHead className="w-[120px] text-white font-bold text-[11px] uppercase tracking-wider py-4 pl-4">Date Added</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Batch No</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Expiry</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Supplier</TableHead>
                    <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-4">Purchase Rate</TableHead>
                    <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-4 pr-4">Qty</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="w-[200px] text-white font-bold text-[11px] uppercase tracking-wider py-4 pl-4">Sale Date</TableHead>
                    <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-4 pr-4">Quantity Sold</TableHead>
                    <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-4 pr-4">Unit Price</TableHead>
                    <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-4 pr-4">Total</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === "Batch History" ? 6 : 4} className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      {activeTab === "Batch History" ? <Barcode className="h-8 w-8 opacity-20" /> : <History className="h-8 w-8 opacity-20" />}
                      <p className="font-bold uppercase tracking-widest text-[11px]">No {activeTab.toLowerCase()} found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((data: any, idx: number) => (
                  <TableRow
                    key={data._id || idx}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-white/60"
                        : "bg-slate-100 hover:bg-slate-100/60"
                    }
                  >
                    {activeTab === "Batch History" ? (
                      <>
                        <TableCell className="text-xs py-3 pl-4 font-medium text-slate-700">{fDate(data.createdAt)}</TableCell>
                        <TableCell className="py-3">
                          <span className="font-mono text-[11px] bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-600 shadow-sm">
                            {data.batchNumber}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs py-3 text-slate-600 font-medium">{fDate(data.expiryDate)}</TableCell>
                        <TableCell className="text-xs py-3 text-slate-600">{data.supplier || "-"}</TableCell>
                        <TableCell className="text-right text-xs py-3 text-slate-900 font-bold tabular-nums">{formatINR(data.purchasePrice)}</TableCell>
                        <TableCell className="text-right text-xs py-3 font-bold text-indigo-600 bg-indigo-50/20 pr-4 tabular-nums">{data.quantity}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-xs py-3 pl-4 font-medium text-slate-700">{fDate(data.date)}</TableCell>
                        <TableCell className="text-right text-xs py-3 font-bold text-emerald-600 bg-emerald-50/20 pr-4 tabular-nums">{data.quantity}</TableCell>
                        <TableCell className="text-right text-xs py-3 font-bold text-emerald-600 bg-emerald-50/20 pr-4 tabular-nums">{formatINR(data.unitPrice)}</TableCell>
                        <TableCell className="text-right text-xs py-3 font-bold text-emerald-600 bg-emerald-50/20 pr-4 tabular-nums">{formatINR(data.total)}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-4">
          <PaginationBar
            page={pagination.page}
            limit={pagination.limit}
            total={sortedData.length}
            setFilter={setPagination as any}
          />
        </div>

      </div>

      {/* Actions */}
      < div className="flex gap-3 pt-4 border-t mt-2" >
        <Button className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg gap-2" onClick={() => editItem()}>
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

          <AlertDialogContent className="max-w-sm! rounded-xl">
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
      </div >
    </div >
  );
}
