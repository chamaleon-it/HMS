import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fAge } from "@/lib/fDateAndTime";
import { Download, FileText, Plus, Printer, Share2, User2 } from "lucide-react";
import React from "react";
import { PatientType } from "./interface";

export default function Header({
  mask,
  blurIDsClass,
  showPHI,
  setOpenAddNote,
  patient,
}: {
  mask: (val: string) => string;
  blurIDsClass: "" | "blur-sm";
  showPHI: boolean;
  setOpenAddNote: React.Dispatch<React.SetStateAction<boolean>>;
  patient: PatientType | undefined;
}) {
  return (
    <div className="p-5 flex items-center gap-3 md:gap-4">
      <User2 className="h-9 w-9 md:h-10 md:w-10" />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-base md:text-xl font-semibold">
            {mask(patient?.name ?? "")}{" "}
            <span className={blurIDsClass}>(MRN: {patient?.mrn})</span>
          </h1>
          {patient?.dateOfBirth && (
            <Badge variant="secondary" className="rounded-full">
              Age {fAge(patient?.dateOfBirth)}
            </Badge>
          )}
          {patient?.gender && (
            <Badge variant="secondary" className="rounded-full">
              {patient?.gender}
            </Badge>
          )}
          {patient?.blood && (
            <Badge variant="outline" className="rounded-full">
              {patient?.blood}ve
            </Badge>
          )}
          {patient?.allergies && (
            <Badge className="rounded-full bg-amber-500 text-black">
              Allergy
            </Badge>
          )}
          {patient?.insurance && (
            <Badge className="rounded-full bg-blue-500">
              Insurance: {patient.insurance}
            </Badge>
          )}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          <span className={blurIDsClass}>
            {showPHI ? patient?.phoneNumber : "+91 ******"}
          </span>{" "}
          {patient?.uhid && ". "}
          {patient?.uhid && (
            <span className={blurIDsClass}>UHID : {patient?.uhid}</span>
          )}
        </p>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert("Print triggered (hook to /print)")}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print summary / prescription</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Share</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => alert("Downloading PDF...")}>
              {" "}
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => alert("Email modal -> send summary")}
            >
              {" "}
              <FileText className="h-4 w-4 mr-2" />
              Email summary
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          className={"bg-[#6E59F9] hover:bg-[#5b46f4]"}
          onClick={() => setOpenAddNote(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
    </div>
  );
}
