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

export default function NewOrder({ OrderMutate }: { OrderMutate: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const [payload, setPayload] = useState<DataType>({
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
        const { name, dosage, frequency, food, duration, quantity } = item;

        if (!name?.trim()) {
          toast.error(`Item ${index + 1}: Name is required`);
          return;
        }
        if (!dosage?.trim()) {
          toast.error(`Item ${index + 1}: Dosage is required`);
          return;
        }
        if (!frequency?.trim()) {
          toast.error(`Item ${index + 1}: Frequency is required`);
          return;
        }
        if (!food?.trim()) {
          toast.error(`Item ${index + 1}: Food instruction is required`);
          return;
        }
        if (!duration?.trim()) {
          toast.error(`Item ${index + 1}: Duration is required`);
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
      OrderMutate();
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
  }, [open,user?._id]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            size={"sm"}
          >
            New Order
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-7xl">
          <DialogHeader>
            <DialogTitle>Add new order</DialogTitle>
            <DialogDescription>
              Create a new order for the pharmacy
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center">
            <PatientSelection
              setValue={(id: string) => {
                setPayload((prev) => ({ ...prev, patient: id }));
              }}
              register={() => {
                setOpenCreate(true);
                setOpen(false);
              }}
            />
          </div>
          <PrescriptionCard setData={setPayload} data={payload} />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
        <RegisterPatient onClose={() => setOpenCreate(false)} />
      </Drawer>
    </>
  );
}
