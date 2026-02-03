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
import { useRouter } from "next/navigation";

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
  });

  useEffect(() => {

    if (id && doctor) {
      setPayload((prev) => ({ ...prev, patient: id, doctor }));
    }
    if (window.location.hash === "#newOrder") {
      setOpen(true);
    }
  }, []);

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
      OrderMutate();
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
      });
    }
  }, [open, user?._id]);

  const [showAllFields, setShowAllFields] = useState(false);
  const [patientName, setpatientName] = useState("")

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
          <div className="flex justify-between items-center">
            {mrn && name ? (
              <div className="flex-1 max-w-md">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Customer Name
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

            <Button className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm" onClick={() => setShowAllFields(!showAllFields)}>
              {showAllFields ? "Hide optional fields" : "Display all fields"}
            </Button>
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
      <Drawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Customer Register"
      >
        <RegisterPatient onClose={(id?: string, name?: string) => {
          setOpenCreate(false);
          setPayload((prev) => ({ ...prev, patient: id ?? "" }));
          setOpen(true)
          setpatientName(name ?? "")

        }} />
      </Drawer>
    </>
  );
}
