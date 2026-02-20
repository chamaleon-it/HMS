import React, { useEffect, useState } from "react";
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
import PrescriptionCard from "./PrescriptionCard";
import { DataType } from "./interface";
import PatientSelection from "./PatientSelection";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/context/auth-context";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { RegisterPatient } from "./RegisterPatient";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import PharmacistSelection from "./PharmacistSelection";
import { cn } from "@/lib/utils";

export default function NewOrder({ OrderMutate }: { OrderMutate: () => void }) {
  const mrn = new URLSearchParams(window.location.search).get("mrn");
  const name = new URLSearchParams(window.location.search).get("name");
  const id = new URLSearchParams(window.location.search).get("id");
  const doctor = new URLSearchParams(window.location.search).get("doctor");
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const [payload, setPayload] = useState<DataType>({
    patient: "",
    doctor: user?._id ?? "",
    items: [
      {
        dosage: "1 tab",
        name: "",
        duration: "",
        food: "After food",
        frequency: "",
        quantity: 0,
        availableQuantity: 0,
        unitPrice: 0
      },
    ],
    discount: 0,
    priority: "Normal",
    status: "Pending",
    pharmacists: "",
    allergies: undefined
  });

  useEffect(() => {

    if (id && doctor) {
      setPayload((prev) => ({ ...prev, patient: id, doctor }));
    }
    if (window.location.hash === "#newOrder") {
      setOpen(true);
    }
  }, [id, doctor]);

  const createOrder = async () => {
    try {
      if (!payload.patient) {
        toast.error("Please select patient");
        return;
      }

      // Filter out empty rows
      const validItems = payload.items.filter((item) => item.name && item.name.trim() !== "");

      if (validItems.length === 0) {
        toast.error("Please select atleast on item");
        return;
      }

      for (const [index, item] of validItems.entries()) {
        const { quantity } = item;

        if (!quantity || quantity <= 0) {
          toast.error(`Item ${index + 1}: Quantity must be greater than 0`);
          return;
        }
      }
      const payloadToSubmit = { ...payload, items: validItems };
      const { data } = await toast.promise(api.post("/pharmacy/orders", payloadToSubmit), {
        loading: "Order is creating...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      setOpen(false);
      OrderMutate();
      if (data.data.billNo === "-") {
        router.push(`/dashboard/pharmacy/billing?mrn=${data.data.mrn}#new`)
      }

    } catch (error) {
      // Handle error
    }
  };

  useEffect(() => {
    if (open === false) {
      setPayload({
        patient: "",
        doctor: user?._id ?? "",
        items: [
          {
            dosage: "",
            name: "",
            duration: "",
            food: "",
            frequency: "",
            quantity: 0,
            availableQuantity: 0,
            unitPrice: 0
          },
        ],
        discount: 0,
        priority: "Normal",
        status: "Pending",
        pharmacists: ""
      });
    }
  }, [open, user?._id]);

  const [showAllFields, setShowAllFields] = useState(false);
  const [patientName, setpatientName] = useState("")
  const [hasAllergy, setHasAllergy] = useState(false);

  const router = useRouter()

  return (
    <>
      <Button variant={"outline"} onClick={() => setOpenCreate(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white">New Customer</Button>
      <Dialog open={open} onOpenChange={(value) => {
        if (!value && window.location.hash === "#newOrder") {
          router.push("/dashboard/pharmacy")
        }
        setOpen(value)
      }
      } >
        <DialogTrigger asChild>
          <Button
            className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            size={"sm"}
          >
            New Order
          </Button>
        </DialogTrigger>
        <DialogContent className={showAllFields ? "min-w-7xl" : "min-w-4xl"}>
          <DialogHeader>
            <DialogTitle>Add new order</DialogTitle>
            <DialogDescription>
              Create a new order for the pharmacy
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {mrn && name ? (
                  <div className="max-w-md">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Customer Name <span className="text-xs">*</span>
                    </label>
                    <div className="relative flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm hover:border-gray-400 transition-colors">
                      <span className="text-sm text-gray-900">
                        {name} - ({mrn})
                      </span>
                    </div>
                  </div>
                ) : (
                  <PatientSelection
                    patientName={patientName}
                    setValue={(id: string) => {
                      setPayload((prev) => ({ ...prev, patient: id }));
                    }}
                    register={() => {
                      setOpenCreate(true);
                      setOpen(false);
                    }}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
                  <div className="flex flex-col p-3.5 border border-slate-200 bg-slate-50/40 rounded-xl transition-shadow hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-slate-200/60 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><circle cx="19" cy="11" r="2" /><path d="m19 13.5 0 .5" /><path d="m19 8.5 0 .5" /></svg>
                      </div>
                      <Label className="text-sm font-semibold text-slate-700">Pharmacist In-charge</Label>
                    </div>
                    <PharmacistSelection
                      hideLabel
                      setValue={(name: string) => {
                        setPayload((prev) => ({ ...prev, pharmacists: name }));
                      }}
                      pharmacistName={payload.pharmacists}
                      className="mt-auto"
                    />
                  </div>

                  <div className={cn(
                    "flex flex-col p-3.5 border transition-all duration-300 rounded-xl hover:shadow-sm",
                    hasAllergy
                      ? "bg-amber-50/60 border-amber-200 shadow-sm shadow-amber-100/30"
                      : "bg-slate-50/40 border-slate-200"
                  )}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          hasAllergy ? "bg-amber-100 text-amber-600" : "bg-slate-200/60 text-slate-400"
                        )}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <Label htmlFor="allergy-toggle" className="text-sm font-semibold text-slate-700 cursor-pointer">
                          Patient Allergy?
                        </Label>
                      </div>
                      <Switch
                        id="allergy-toggle"
                        checked={hasAllergy}
                        onCheckedChange={setHasAllergy}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      {hasAllergy ? (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Input
                            id="allergy-input"
                            placeholder="Specify medical/food allergies..."
                            value={payload.allergies}
                            onChange={(e) => setPayload((prev) => ({ ...prev, allergies: e.target.value }))}
                            className="h-9 focus:ring-amber-500/20 focus:border-amber-400 bg-white border-amber-100 placeholder:text-slate-400 text-sm"
                          />
                          <p className="text-[10px] text-amber-600 font-medium px-1">
                            Critical for medication safety
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic px-1 animate-in fade-in duration-500">
                          Toggle if patient has known allergies
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <div className="shrink-0 pt-7">
                <Button
                  variant="outline"
                  className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
                  onClick={() => setShowAllFields(!showAllFields)}
                >
                  {showAllFields ? "Hide optional fields" : "Display all fields"}
                </Button>
              </div>
            </div>
          </div>
          <PrescriptionCard setData={setPayload} data={payload} showAllFields={showAllFields} />
          <div className="flex justify-between">
            <div className="">

              {window.location.hash === "#newOrder" && <Button onClick={() => {
                router.replace(`/dashboard/pharmacy/billing?mrn=${mrn}&name=${name}&id=${id}&doctor=${doctor}#new`)
              }} className="bg-emerald-600 hover:bg-emerald-700 text-white">No Medicine</Button>}
            </div>
            <DialogFooter >
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                onClick={createOrder}
              >
                Place Order
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <RegisterPatient onClose={(id?: string, name?: string) => {
            setOpenCreate(false);
            setPayload((prev) => ({ ...prev, patient: id ?? "" }));
            setOpen(true)
            setpatientName(name ?? "")

          }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
