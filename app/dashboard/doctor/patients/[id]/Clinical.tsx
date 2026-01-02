import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fDateandTime } from "@/lib/fDateAndTime";
import React, { useCallback, useState } from "react";
import ConsultationDetails from "./ConsultationDetails";
import { ConsultationType } from "./interface";
import { Badge } from "@/components/ui/badge";

export default function Clinical({ consult }: { consult: ConsultationType[] }) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRow, setSelectedRow] = useState<null | ConsultationType>(null);

  const selectRow = useCallback((row: ConsultationType) => {
    setSelectedRow(row);
    setShowDetail(true);
  }, []);

  const closeDialog = useCallback(() => {
    setShowDetail(false);
  }, []);

  return (
    <>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-700 hover:bg-slate-700">
              <TableHead className="text-white w-[50px]">
                <Checkbox className="border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-700" />
              </TableHead>
              <TableHead className="text-white w-[50px]">SL</TableHead>
              <TableHead className="text-white">Consulted Date</TableHead>
              <TableHead className="text-white">Doctor</TableHead>
              <TableHead className="text-white">Medicine Dispensed</TableHead>
              <TableHead className="text-white">Diagnosis</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {consult?.map((row, idx) => (
              <Row
                key={row._id ?? idx}
                row={row}
                idx={idx}
                selectRow={selectRow}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ConsultationDetails
        open={showDetail}
        onOpenChange={setShowDetail}
        selectedRow={selectedRow}
        onClose={closeDialog}
      />
    </>
  );
}

const Row = React.memo(function Row({
  row,
  idx,
  selectRow,
}: {
  row: ConsultationType;
  idx: number;
  selectRow: (row: ConsultationType) => void;
}) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <Checkbox />
      </TableCell>

      <TableCell className="font-medium text-muted-foreground">
        {idx + 1}
      </TableCell>

      <TableCell className="text-muted-foreground text-sm">
        {fDateandTime(row.createdAt)}
      </TableCell>


      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{row.doctor.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.doctor.specialization}
          </span>
        </div>
      </TableCell>

      <TableCell className="max-w-[300px]">
        <div className="flex flex-wrap gap-1">
          {row.medicines?.map((m, i) => (
            <Badge
              key={m._id ?? i}
              variant="secondary"
              className="font-normal text-xs whitespace-nowrap"
            >
              {m.name.name}
            </Badge>
          ))}
        </div>
      </TableCell>

      <TableCell className="max-w-[300px]">
        <div className="flex flex-wrap gap-1">
          {row.consultationNotes.diagnosis}
        </div>
      </TableCell>



      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectRow(row)}
          className="h-8"
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
});

