import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { fDate } from "@/lib/fDateAndTime";
import { ArrowLeft, ChevronDownIcon,  Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import SelectMedicine from "./SelectItem";

interface State {
  wholesaler: null | string;
  contactPerson: null | string;
  phoneNumber: null | string;
  deliveryAddress: null | string;
  expectedDelivery: null | string;
  paymentTerms: null | string;
  items: {
    name: string;
    quantity: number;
    notes?: string;
  }[];
  instructions?: null | string;
  partialDelivery: boolean;
  urgent: boolean;
}

function PurchaseOrder({
  onBack,
  mutate,
}: {
  onBack: () => void;
  mutate: () => void;
}) {
  const [state, setState] = useState<State>({
    wholesaler: null,
    contactPerson: null,
    phoneNumber: null,
    deliveryAddress: null,
    expectedDelivery: null,
    paymentTerms: null,
    items: [],
    instructions: null,
    partialDelivery: false,
    urgent: false,
  });

  const { data: wholesalerData } = useSWR<{
    message: string;
    data: {
      _id: string;
      name: string;
      email: string;
      phoneNumber: string | null;
      address: string | null;
      profilePic: string | null;
    }[];
  }>("/users/pharmacy_wholesaler");

  const wholesaler = wholesalerData?.data ?? [];

  const sendOrders = async () => {
    if (!state.wholesaler) {
      toast.error("Please select wholesaler.");
      return;
    }

    if (!state.contactPerson) {
      toast.error("Contact person is required.");
      return;
    }

    if (!state.phoneNumber) {
      toast.error("Phone or whatsapp is required.");
      return;
    }

    if (!state.deliveryAddress) {
      toast.error("Address is required.");
      return;
    }

    if (!state.expectedDelivery) {
      toast.error("Expected delivery is required.");
      return;
    }

    if (!state.paymentTerms) {
      toast.error("Payment terms is required.");
      return;
    }

    if (!state.items.length) {
      toast.error("Please select at least 1 item.");
      return;
    }

    if (state.items.some((e) => e.quantity === 0)) {
      toast.error("Some product has quantity is zero.");
      return;
    }

    try {
      await toast.promise(api.post("/pharmacy/purchase", state), {
        loading: "Purchase order is creating.",
        error: ({ response }) => response.data.message,
        success: ({ data }) => data.message,
      });
      setState({
        wholesaler: null,
        contactPerson: null,
        phoneNumber: null,
        deliveryAddress: null,
        expectedDelivery: null,
        paymentTerms: null,
        items: [],
        instructions: null,
        partialDelivery: false,
        urgent: false,
      });
      mutate();
      onBack();
    } catch (error) {
      console.log(error);
    }
  };

  const medicineRef = useRef<null | HTMLInputElement>(null);
  const [medicine, setMedicine] = useState<null | string>(null);

  const addItems = async (name: string) => {
    const formated = name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^A-Za-z0-9\s\-\(\),.\/+]/g, "")
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(" ");

    if (!formated) {
      return;
    }

    if (state.items.find((e) => e.name === formated)) {
      toast.error("Item already added");
      return;
    }

    setState((prev) => ({
      ...prev,
      items: [...prev.items, { name: formated, quantity: 0, unitPrice: 0 }],
    }));
    setMedicine(null);
    medicineRef.current?.focus();
  };

  const removeItems = (name: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((e) => e.name !== name),
    }));
  };

  const updateItems = (
    name: string,
    key: "quantity" | "unitPrice" | "notes",
    value: number | string
  ) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.name !== name) return item;

        switch (key) {
          case "quantity":
            return { ...item, quantity: Number(value) || 0 };
          case "unitPrice":
            return { ...item, unitPrice: Number(value) || 0 };
          case "notes":
            return { ...item, notes: String(value) };
          default:
            return item;
        }
      }),
    }));
  };

  const [openCalander, setOpenCalander] = useState(false);

  return (
    <div className="flex flex-col gap-6   p-5 ">
      {/* HEADER WITH BACK */}
      <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-gradient-to-br from-background via-background to-muted/40 border rounded-2xl p-4 lg:p-5 shadow-sm">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              className="h-9 px-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Purchase Orders</span>
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              Create Purchase Order
            </h1>
          </div>

          <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase text-muted-foreground">
                Order Date
              </span>
              <span className="font-medium text-foreground">
                {fDate(new Date())}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-auto"></div>
      </header>

      {/* SUPPLIER CARD */}
      <Card className="rounded-2xl shadow-sm border-border/60">
        <CardHeader className="pb-3 flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            Supplier / Wholesaler
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-2">
            {/* Wholesaler */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Wholesaler <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val) => {
                  setState((prev) => ({ ...prev, wholesaler: val }));
                }}
                value={state.wholesaler ?? ""}
              >
                <SelectTrigger className="rounded-md h-10">
                  <SelectValue placeholder="Select wholesaler" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg">
                  {wholesaler?.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact */}
            <div className="grid gap-2 lg:w-1/2">
              <Label className="text-sm font-medium">
                Contact person <span className="text-red-500">*</span>
              </Label>
              <Input
                className="rounded-md h-10"
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    contactPerson: e.target.value,
                  }))
                }
                value={state.contactPerson ?? ""}
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2 lg:w-1/2">
              <Label className="text-sm font-medium">
                Phone / WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                className="rounded-md h-10"
                onChange={(e) =>
                  setState((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                value={state.phoneNumber ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-2">
            {/* Expected + Terms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  Expected delivery <span className="text-red-500">*</span>
                </Label>

                <Popover open={openCalander} onOpenChange={setOpenCalander}>
                  <PopoverTrigger asChild className="mt-2">
                    <Button
                      variant="outline"
                      id="date"
                      className="w-48 justify-between font-normal"
                    >
                      {state.expectedDelivery
                        ? fDate(state.expectedDelivery)
                        : "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        state.expectedDelivery
                          ? new Date(state.expectedDelivery)
                          : undefined
                      }
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (date) {
                          setState((prev) => ({
                            ...prev,
                            expectedDelivery: date?.toISOString(),
                          }));
                        }
                        setOpenCalander(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Payment terms <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(val) => {
                    setState((prev) => ({ ...prev, paymentTerms: val }));
                  }}
                  value={state.paymentTerms ?? ""}
                >
                  <SelectTrigger className="rounded-md h-10 mt-2 max-w-[150px] w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    <SelectItem value="Cash on delivery">Cash on delivery</SelectItem>
                    <SelectItem value="7 days credit">7 days credit</SelectItem>
                    <SelectItem value="30 days credit">30 days credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Delivery address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={4}
                className="rounded-md resize-none"
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    deliveryAddress: e.target.value,
                  }))
                }
                value={state.deliveryAddress ?? ""}
              />
            </div>
            <div className=""></div>
            <div className=""></div>
          </div>
        </CardContent>
      </Card>

      {/* ITEMS CARD */}
      <Card className="rounded-2xl shadow-sm border-border/60">
        <CardHeader className="pb-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            Items
          </CardTitle>

          <SelectMedicine
            addItems={addItems}
            medicine={medicine}
            medicineRef={medicineRef}
            setMedicine={setMedicine}
          />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border overflow-x-auto">
            <Table className="min-w-[900px] text-sm">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[28%]">Item</TableHead>
                  <TableHead className="w-[10%]">Quantity</TableHead>

                  <TableHead className="w-[30%]">Notes</TableHead>
                  <TableHead className="w-[10%] text-center">Remove</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {state.items.map((row, idx) => {
                  return (
                    <TableRow key={idx}>
                      <TableCell className="">
                        <div className="text-md font-bold">
                          {row.name || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="py-4  text-right">
                        <Input
                          type="number"
                          min={1}
                          className="h-9 rounded-lg text-right"
                          value={row.quantity === 0 ? "" : row.quantity}
                          placeholder="0"
                          onFocus={(e) => (e.target.placeholder = "")}
                          onBlur={(e) => (e.target.placeholder = "0")}
                          onChange={(e) =>
                            updateItems(row.name, "quantity", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell className="py-4 align-top">
                        <Textarea
                          rows={1}
                          className="text-sm rounded-lg"
                          placeholder="Batch preference / colour / etc."
                          value={row.notes}
                          onChange={(e) =>
                            updateItems(row.name, "notes", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          onClick={() => removeItems(row.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Additional Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Special instructions to supplier
            </Label>
            <Textarea
              rows={4}
              className="rounded-xl resize-none"
              placeholder="Eg: Send only fresh stock (MFG Oct 2025 or newer). Pack 10s blister separately."
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
              value={state.instructions ?? ""}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between rounded-xl border p-4">
              <div className="text-sm">
                <div className="font-medium">Allow partial delivery</div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  Supplier can send what is available now and the rest later.
                </div>
              </div>
              <Switch
                onCheckedChange={(checked) => {
                  setState((prev) => ({ ...prev, partialDelivery: checked }));
                }}
                checked={state.partialDelivery}
              />
            </div>

            <div
              className={`flex items-start justify-between rounded-xl border p-4`}
            >
              <div className="text-sm">
                <div className="font-medium flex items-center gap-1">
                  <span>Mark as urgent</span>
                </div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  Supplier will see this order highlighted with ⚠.
                </div>
              </div>
              <Switch
                onCheckedChange={(checked) => {
                  setState((prev) => ({ ...prev, urgent: checked }));
                }}
                checked={state.urgent}
              />
            </div>
          </div>
          <div className="flex justify-end col-span-full">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="rounded-xl h-9 px-4 text-muted-foreground"
                onClick={onBack}
              >
                Cancel
              </Button>
              <Button className="rounded-xl h-9 px-4" onClick={sendOrders}>
                Send Purchase Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PurchaseOrder;
