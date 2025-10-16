import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TabsContent } from "@/components/ui/tabs";
import configuration from "@/config/configuration";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  UpdateSettingsInput,
  updateSettingsSchema,
} from "@/schemas/updateSettingsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Save, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";
import Appointments from "./Appointments";

export default function ProfileForm() {
  const { data: userData, mutate } = useSWR<{
    message: string;
    data: {
      email: string;
      name: string;
      phoneNumber: string | null;
      profilePic: string | null;
      hospital: string | null;
      specialization: string | null;
      signature: string | null;
      availability?: {
        startDate?: string;
        endDate?: string;
        startTime?: string;
        endTime?: string;
        days?: string[];
        rounds?: {
          label: string;
          start: string;
          end: string;
        }[];
      };
    };
  }>("/users/profile");

  const { register, handleSubmit, watch, setValue, reset,formState:{errors} } =
    useForm<UpdateSettingsInput>({
      resolver: zodResolver(updateSettingsSchema),
      defaultValues: {
        name: userData?.data.name,
        phoneNumber: userData?.data.phoneNumber || "+91",
        email: userData?.data.email,
        hospital: userData?.data.hospital || null,
        specialization: userData?.data.specialization || null,
        profilePic: userData?.data.profilePic || null,
        signature: userData?.data.signature || null,
        availability: userData?.data.availability,
      },
    });

    console.log(errors);

  const values = watch();

  useEffect(() => {
    reset({
      name: userData?.data.name,
      phoneNumber: userData?.data.phoneNumber || "+91",
      email: userData?.data.email,
      hospital: userData?.data.hospital || null,
      specialization: userData?.data.specialization || null,
      profilePic: userData?.data.profilePic || null,
      signature: userData?.data.signature || null,
      availability: userData?.data.availability,
    });
  }, [userData?.data,reset]);

  const updateUser = handleSubmit(async (data) => {
    try {
      await toast.promise(api.patch("/users", data), {
        loading: "Your profile is updating...!",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      mutate();
    } catch (error) {
      console.log(error);
    }
  });
  const [openSpec, setOpenSpec] = useState(false);

  return (
    <TabsContent value="profile" className="mt-6">
      <form onSubmit={updateUser}>
        <Card className="border-0 shadow-lg ring-1 ring-black/5 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your display info shown to patients and staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-3 pt-2">
            <div className="grid gap-2">
              <div className="grid gap-0">
                <Label
                  htmlFor="name"
                  className="mb-0.5 text-[13px] leading-tight text-slate-700"
                >
                  Full name
                </Label>
                <Input
                  id="name"
                  placeholder="Dr. Full Name"
                  className="h-9"
                  {...register("name")}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-0">
                  <Label
                    htmlFor="phone"
                    className="mb-0.5 text-[13px] leading-tight text-slate-700"
                  >
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+91 …"
                    className="h-9"
                    {...register("phoneNumber")}
                  />
                </div>
                <div className="grid gap-0">
                  <Label
                    htmlFor="email"
                    className="mb-0.5 text-[13px] leading-tight text-slate-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@clinic.com"
                    className="h-9"
                    {...register("email")}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-0">
                  <Label
                    htmlFor="clinic"
                    className="mb-0.5 text-[13px] leading-tight text-slate-700"
                  >
                    Clinic / Hospital
                  </Label>
                  <Input
                    id="clinic"
                    placeholder="Your clinic name"
                    className="h-9"
                    {...register("hospital")}
                  />
                </div>
                <div className="grid gap-0">
                  <Label className="mb-0.5 text-[13px] leading-tight text-slate-700">
                    Primary specialization
                  </Label>
                  <Popover open={openSpec} onOpenChange={setOpenSpec}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSpec}
                        className="w-full justify-between border-slate-200 hover:bg-slate-50 text-slate-700 h-9"
                      >
                        {values.specialization || "Select specialization"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command
                        filter={(value, search) =>
                          value.toLowerCase().includes(search.toLowerCase())
                            ? 1
                            : 0
                        }
                      >
                        <CommandInput placeholder="Search specialties…" />
                        <CommandEmpty>No match found.</CommandEmpty>
                        {SPECIALTIES.map((grp) => (
                          <CommandGroup key={grp.group} heading={grp.group}>
                            {grp.items.map((item) => (
                              <CommandItem
                                key={item}
                                value={item}
                                onSelect={(v) => {
                                  setValue("specialization", v);
                                  setOpenSpec(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    values.specialization === item
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {item}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Appointments
                  setValue={setValue}
                  availability={userData?.data.availability}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="p-2.5 rounded-xl border bg-slate-50">
                <div className="flex items-start gap-3">
                  <Avatar className="h-20 w-20 ring-2 ring-muted-foreground/10">
                    {values.profilePic ? (
                      <AvatarImage
                        src={configuration().backendUrl + values.profilePic}
                        alt="avatar"
                      />
                    ) : (
                      <AvatarFallback>
                        {values.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-1.5">
                    <Label htmlFor="avatar">Profile photo</Label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="avatar"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white text-slate-700 cursor-pointer hover:bg-slate-50"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          try {
                            if (e.target.files?.length) {
                              const file = e.target.files[0];
                              const formData = new FormData();
                              formData.append("file", file);
                              const { data } = await toast.promise(
                                api.post("/uploads", formData),
                                {
                                  loading: "Profile photo is uploading...",
                                  success: "Profile photo is uploaded",
                                  error: ({ response }) =>
                                    response.data.message,
                                }
                              );
                              setValue("profilePic", data.data.url);
                            } else {
                              toast.error("Please select a file.");
                            }
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                      />
                      {values.profilePic && (
                        <Button
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          type="button"
                          onClick={() => {
                            setValue("profilePic", null);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG/JPG up to 2MB. Square images look best.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border bg-slate-50">
                <div className="space-y-1.5">
                  <Label htmlFor="signature">Doctor signature</Label>
                  <div className="border rounded-lg p-3 flex items-center justify-center min-h-[80px] bg-white">
                    {values.signature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={configuration().backendUrl + values.signature}
                        alt="signature preview"
                        className="max-h-24 object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No signature uploaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="signature"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white text-slate-700 cursor-pointer hover:bg-slate-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload signature</span>
                    </label>
                    <Input
                      id="signature"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        try {
                          if (e.target.files?.length) {
                            const file = e.target.files[0];
                            const formData = new FormData();
                            formData.append("file", file);
                            const { data } = await toast.promise(
                              api.post("/uploads", formData),
                              {
                                loading: "Signature is uploading...",
                                success: "Signature is uploaded",
                                error: ({ response }) => response.data.message,
                              }
                            );
                            setValue("signature", data.data.url);
                          } else {
                            toast.error("Please select a file.");
                          }
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    />
                    {values.signature && (
                      <Button
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50"
                        type="button"
                        onClick={() => {
                          setValue("signature", null);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: Use a transparent PNG on white background for best
                    results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button className="gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-700 hover:to-indigo-700 shadow-sm">
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </TabsContent>
  );
}

const SPECIALTIES: Array<{ group: string; items: string[] }> = [
  {
    group: "General",
    items: [
      "General Medicine",
      "Family Medicine",
      "Internal Medicine",
      "Emergency Medicine",
    ],
  },
  {
    group: "Surgical",
    items: [
      "General Surgery",
      "Orthopedics",
      "Neurosurgery",
      "Cardiothoracic Surgery",
      "Urology",
      "Plastic Surgery",
    ],
  },
  {
    group: "Women & Child",
    items: [
      "Obstetrics & Gynecology",
      "Pediatrics",
      "Neonatology",
      "Fertility / Reproductive Medicine",
    ],
  },
  {
    group: "Medicine Subspecialties",
    items: [
      "Cardiology",
      "Endocrinology",
      "Gastroenterology",
      "Nephrology",
      "Neurology",
      "Pulmonology",
      "Rheumatology",
      "Hematology",
      "Oncology",
    ],
  },
  {
    group: "Diagnostics",
    items: ["Radiology", "Pathology", "Microbiology", "Anesthesiology"],
  },
  {
    group: "Others",
    items: [
      "Dermatology",
      "Psychiatry",
      "ENT",
      "Ophthalmology",
      "Dentistry",
      "Physiotherapy",
      "Diet & Nutrition",
    ],
  },
];
