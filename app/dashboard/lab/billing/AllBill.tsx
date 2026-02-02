import { Eye, Search } from "lucide-react";
import React from "react";
import Link from "next/link";
import Filters from "./Filter";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import { FilterType } from "./page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BillRow {
  status: "Paid" | "Partial" | "Unpaid";
  method: "cash" | "online" | "insurance" | "mixed";
}

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing: {
    mrn: string;
    _id: string;
    createdAt: Date;
    cash: number;
    online: number;
    insurance: number;
    items: {
      total: number;
    }[];
    patient: {
      name: string;
      mrn: string;
    };
  }[];
}

export default function AllBill({ billing, filter, setFilter }: PropsType) {
  return (
    <div className="flex flex-col gap-6">
      <Filters filter={filter} setFilter={setFilter} />

      <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
        <Table className="min-w-[1200px] text-sm">
          <TableHeader className="bg-slate-700 hover:bg-slate-700">
            <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
              <TableHead className="py-2.5 text-left pl-4 w-16 text-white font-bold text-[11px] uppercase tracking-wider">
                Sl No
              </TableHead>
              <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">
                Invoice
              </TableHead>
              <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">
                Date
              </TableHead>
              <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">
                Patient
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Items
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Total
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Paid
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Due
              </TableHead>
              <TableHead className="py-2.5 text-center text-white font-bold text-[11px] uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="py-2.5 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billing.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                      <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      No bills found
                    </p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              billing.map((b, idx) => (
                <TableRow
                  key={b._id}
                  className={
                    idx % 2 === 0
                      ? "bg-white hover:bg-white/60"
                      : "bg-slate-100 hover:bg-slate-100/60"
                  }
                >
                  <TableCell className="py-3 pl-4 text-slate-500">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-900">{b.mrn}</div>
                    <div className="text-[11px] text-slate-500 space-x-1 mt-1">
                      {Boolean(b.cash) && <MethodPill m="cash" />}
                      {Boolean(b.online) && <MethodPill m="online" />}
                      {Boolean(b.insurance) && <MethodPill m="insurance" />}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-slate-600 whitespace-nowrap">
                    {fDateandTime(b.createdAt)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium truncate text-slate-900">
                      {b.patient.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {b.patient.mrn}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums text-slate-700">
                    {b.items.length}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums font-medium text-slate-900">
                    {formatINR(b.items.reduce((a, b) => a + b.total, 0))}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums text-emerald-600 font-medium">
                    {formatINR(b.insurance + b.cash + b.online)}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums text-rose-600 font-medium">
                    {formatINR(
                      b.items.reduce((a, b) => a + b.total, 0) -
                      (b.insurance + b.cash + b.online)
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <StatusPill
                      s={(() => {
                        const total = b.items.reduce(
                          (sum, i) => sum + i.total,
                          0
                        );
                        const paid = b.cash + b.online + b.insurance;
                        return total <= paid
                          ? "Paid"
                          : paid === 0
                            ? "Unpaid"
                            : "Partial";
                      })()}
                    />
                  </TableCell>
                  <TableCell className="py-3 pr-4">
                    <div className="flex justify-end items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Link href={`/dashboard/lab/billing/${b._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Bill</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-4 py-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm rounded-xl">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-900">{Math.min(10, billing.length)}</span> of{" "}
            <span className="font-medium text-slate-900">{billing.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white"
              disabled
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const MethodPill: React.FC<{ m: BillRow["method"] }> = ({ m }) => {
  const map: Record<BillRow["method"], string> = {
    cash: "bg-slate-100 text-slate-700 border-slate-200",
    online: "bg-indigo-50 text-indigo-700 border-indigo-200",
    insurance: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    mixed: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${map[m]}`}
    >
      {m}
    </span>
  );
};

const StatusPill: React.FC<{ s: BillRow["status"] }> = ({ s }) => {
  const cls =
    s === "Paid"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "Partial"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {s}
    </span>
  );
};
