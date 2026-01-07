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
import Drawer from "@/components/ui/drawer";
import { RegisterPatient } from "./RegisterPatient";

export default function NewOrder({ mutate }: { mutate: () => void }) {
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
      console.log(error);
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
          },
        ],
        priority: "Normal",
        status: "Pending",
      });
    }
  }, [open, user?._id]);

  const [showAllFields, setShowAllFields] = useState(false);
  const [patientName, setpatientName] = useState("")

  return (
    <>
      <Button variant={"outline"} onClick={() => setOpenCreate(true)}>New Customer</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            size={"sm"}
          >
            New Order
          </Button>
        </DialogTrigger>
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
              register={() => {
                setOpenCreate(true);
                setOpen(false);
              }}
            />

            <Button className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm" onClick={() => setShowAllFields(!showAllFields)}>
              {showAllFields ? "Hide optional fields" : "Display all fields"}
            </Button>
          </div>
          <PrescriptionCard setData={setPayload} data={payload} showAllFields={showAllFields} />

          <DialogFooter>
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
        </DialogContent>
      </Dialog>
      <Drawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Customer Register"
      >
        <RegisterPatient onClose={(id?: string, name?: string) => {
          setOpenCreate(false);
          mutate()
          // setPayload((prev) => ({ ...prev, patient: id ?? "" }));
          // setOpen(true)
          // setpatientName(name ?? "")

        }} />
      </Drawer>
    </>
  );
}
