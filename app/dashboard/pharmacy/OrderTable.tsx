import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState } from "react";
import { OrderType } from "./interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fDateandTime } from "@/lib/fDateAndTime";
import UpdateMedicines from "./UpdateMedicines";

export default function OrderTable({
  handleView,
  orders,
  handleDelete,
  OrderMutate,
}: {
  handleView: (rx: OrderType) => void;
  orders: OrderType[];
  handleDelete: (rx: OrderType) => void;
  OrderMutate: () => void;
}) {


  const [updateOrder, setUpdateOrder] = useState<OrderType | null>(null)
  const [openUpdate, setOpenUpdate] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden">

      <Table>
        <TableHeader className="bg-slate-700 hover:bg-slate-700">
          <TableRow className="bg-slate-700 hover:bg-slate-700">
            <TableHead className="text-white font-semibold">
              <Checkbox />
            </TableHead>
            <TableHead className="text-white font-semibold">Sl No</TableHead>
            <TableHead className="text-white font-semibold">RX ID</TableHead>
            <TableHead className="text-white font-semibold">Patient</TableHead>
            <TableHead className="text-white font-semibold">Items</TableHead>
            <TableHead className="text-white font-semibold">Priority</TableHead>
            <TableHead className="text-white font-semibold">Status</TableHead>
            <TableHead className="text-left text-white font-semibold">
              Assigned To
            </TableHead>

            <TableHead className="text-left text-white font-semibold">
              Created At
            </TableHead>
            <TableHead className="text-right text-white font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((r: OrderType, idx) => (
            <TableRow
              key={r._id}
              className={
                idx % 2 === 0
                  ? "bg-white hover:bg-slate-50/60"
                  : "bg-slate-50 hover:bg-slate-100"
              }
            >
              <TableCell>
                <Checkbox />
              </TableCell>

              <TableCell>{idx + 1}</TableCell>
              <TableCell className="font-medium">{r?.mrn}</TableCell>
              <TableCell>{r?.patient?.name} <br /> <span className="text-xs">({r?.patient?.mrn})</span></TableCell>
              <TableCell>{r?.items?.length}</TableCell>
              <TableCell>
                <PriorityBadge priority={r?.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={r?.status} />
              </TableCell>
              <TableCell className="text-left">
                {r?.assignedTo ? (
                  <Badge className={"bg-emerald-100 text-emerald-700"}>
                    {r?.assignedTo}
                  </Badge>
                ) : (
                  <span className="text-slate-500">Unassigned</span>
                )}
              </TableCell>
              <TableCell>{fDateandTime(r?.createdAt)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleView(r)} className="cursor-pointer">
                  View
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setUpdateOrder(r); setOpenUpdate(true) }} className="cursor-pointer">
                  Update
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleDelete(r)}
                  className="bg-red-600 hover:bg-red-600 font-bold cursor-pointer"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {updateOrder && <UpdateMedicines open={openUpdate} setOpen={v => { setOpenUpdate(v); setUpdateOrder(null) }} order={updateOrder} OrderMutate={OrderMutate} />}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    STAT: "bg-rose-100 text-rose-700",
    VIP: "bg-purple-100 text-purple-700",
    Routine: "bg-sky-100 text-sky-700",
  };
  return (
    <Badge className={map[priority] || "bg-slate-100 text-slate-700"}>
      {priority}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Filling: "bg-blue-100 text-blue-700",
    "Clinical Check": "bg-amber-100 text-amber-700",
    Ready: "bg-emerald-100 text-emerald-700",
  };
  return (
    <Badge className={map[status] || "bg-slate-100 text-slate-700"}>
      {status}
    </Badge>
  );
}
