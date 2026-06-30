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
import { useAuth } from "@/auth/context/auth-context";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { PatientForm } from "@/components/shared/patient/PatientForm";
import { useRouter } from "next/navigation";

export default function NewOrder({ mutate, asDialogOnly, openDialog, setOpenDialog, initialPatient }: { mutate: () => void, asDialogOnly?: boolean, openDialog?: boolean, setOpenDialog?: (open: boolean) => void, initialPatient?: any }) {
  const { user } = useAuth();
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openDialog !== undefined ? openDialog : internalOpen;
  const setOpen = setOpenDialog !== undefined ? setOpenDialog : setInternalOpen;
  const [openCreate, setOpenCreate] = useState(false);

  const [payload, setPayload] = useState<DataType>({
    patient: "",
    doctor: user?._id ?? "",
    items: [
      {
        dosage: "1 tab",
        name: "",
        duration: "",
        food: "",
        frequency: "",
        quantity: 0,
        availableQuantity: 0,
      },
    ],
    priority: "Normal",
    status: "Pending",
  });

  const createOrder = async () => {
    try {
      if (!payload.patient) {
        toast.error("Please select patient");
        return;
      }

      if (payload.items.length === 0) {
        toast.error("Please select atleast on item");
        return;
      }

      for (const [index, item] of payload.items.entries()) {
        const { name, quantity } = item;

        if (!name?.trim()) {
          toast.error(`Item ${index + 1}: Name is required`);
          return;
        }
        if (!quantity || quantity <= 0) {
          toast.error(`Item ${index + 1}: Quantity must be greater than 0`);
          return;
        }
      }
      await toast.promise(api.post("/pharmacy/orders", payload), {
        loading: "Order is creating...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      setOpen(false);
    } catch (error) {

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
          },
        ],
        priority: "Normal",
        status: "Pending",
      });
      setpatientName("");
    } else if (open === true && initialPatient) {
      setPayload((prev) => ({ ...prev, patient: initialPatient._id }));
      setpatientName(initialPatient.name);
    }
  }, [open, user?._id, initialPatient]);

  const [showAllFields, setShowAllFields] = useState(false);
  const [patientName, setpatientName] = useState("");
  const [nameToRegister, setNameToRegister] = useState("");

  return (
    <>
{!asDialogOnly && (
  <Button
    variant="outline"
    onClick={() => {
      setNameToRegister("");
      setOpenCreate(true);
    }}
    className="bg-[var(--color-cosmo-dark)] hover:bg-[var(--color-cosmo-dark)] text-white hover:text-white mr-2"
  >
    New Patient
  </Button>
)}

<Dialog open={open} onOpenChange={setOpen}>
  {!asDialogOnly && (
    <DialogTrigger asChild>
      <Button
        className="bg-linear-to-r from-[var(--color-cosmo-copper)] to-[var(--color-cosmo-brown)] hover:from-[var(--color-cosmo-copper)] hover:to-[var(--color-cosmo-brown)] text-white shadow-md transition-all hover:shadow-lg active:scale-95"
        size="sm"
      >
        New Order
      </Button>
    </DialogTrigger>
  )}
        <DialogContent className={showAllFields ? "min-w-7xl" : "min-w-3xl"}>
          <DialogHeader>
            <DialogTitle>Add new order</DialogTitle>
            <DialogDescription>
              Create a new order for the pharmacy
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center">
            <PatientSelection
              patientName={patientName}
              setValue={(id: string) => {
                setPayload((prev) => ({ ...prev, patient: id }));
              }}
              register={(name) => {
                if (name) setNameToRegister(name);
                else setNameToRegister("");
                setOpenCreate(true);
                setOpen(false);
              }}
            />

            <Button className="bg-linear-to-r from-[var(--color-cosmo-copper)] to-[var(--color-cosmo-brown)] hover:from-[var(--color-cosmo-copper)] hover:to-[var(--color-cosmo-brown)] text-white shadow-sm" onClick={() => setShowAllFields(!showAllFields)}>
              {showAllFields ? "Hide optional fields" : "Display all fields"}
            </Button>
          </div>
          <PrescriptionCard setData={setPayload} data={payload} showAllFields={showAllFields} />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-linear-to-r from-[var(--color-cosmo-copper)] to-[var(--color-cosmo-brown)] hover:from-[var(--color-cosmo-copper)] hover:to-[var(--color-cosmo-brown)] text-white shadow-md"
              onClick={createOrder}
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <PatientForm patient={{ name: nameToRegister }} onClose={(id?: string, name?: string, allergies?: string, mrn?: string) => {
            setOpenCreate(false);
            mutate();
            setNameToRegister("");
            if (id && name) {
              router.push(
                `/dashboard/pharmacy?id=${id}&mrn=${mrn || ""}&name=${encodeURIComponent(name)}&allergies=${encodeURIComponent(allergies || "")}#newOrder`
              );
            }
          }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
