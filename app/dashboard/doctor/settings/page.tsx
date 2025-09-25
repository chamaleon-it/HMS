"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  ChevronsUpDown,
  Check,
  Upload,
  Shield,
  Save,
  Lock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppShell from "@/components/layout/app-shell";

// --- Demo specialization data (grouped & searchable) ---
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

// --- Pure helper for password strength so we can test it ---
export function calcPasswordStrength(pwd: string) {
  let s = 0;
  if (pwd.length >= 8) s += 1;
  if (pwd.length >= 12) s += 1;
  if (/[A-Z]/.test(pwd)) s += 1;
  if (/[a-z]/.test(pwd)) s += 1;
  if (/\d/.test(pwd)) s += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) s += 1;
  const score = Math.min(s, 5);
  const label =
    ["Very weak", "Weak", "Okay", "Good", "Strong", "Very strong"][score] || "";
  const percent = (score / 5) * 100;
  return { score, label, percent } as const;
}

function usePasswordStrength(pwd: string) {
  return React.useMemo(() => calcPasswordStrength(pwd), [pwd]);
}

export default function SettingsPage() {
  const [tab, setTab] = React.useState("profile");

  // Profile state
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [signature, setSignature] = React.useState<string | null>(null);
  const [name, setName] = React.useState("Dr. Nadisha");
  const [email, setEmail] = React.useState("doctor@example.com");
  const [phone, setPhone] = React.useState("+91 98765 43210");
  const [clinic, setClinic] = React.useState("Mark Hospital");

  // Specialization state
  const [openSpec, setOpenSpec] = React.useState(false);
  const [specialty, setSpecialty] = React.useState<string>("Internal Medicine");

  // Security state
  const [oldPwd, setOldPwd] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
  const [confirmPwd, setConfirmPwd] = React.useState("");
  const [twoFA, setTwoFA] = React.useState(true);
  const { percent, label } = usePasswordStrength(newPwd);

  const canSavePwd =
    newPwd && confirmPwd && newPwd === confirmPwd && oldPwd && percent >= 40;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSignature(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onSaveProfile() {
    // TODO: replace with API call
    console.log({ name, email, phone, clinic, specialty, avatar, signature });
  }

  function onSavePassword() {
    // TODO: replace with secure API call
    console.log({ oldPwd, newPwd });
  }

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b pb-5 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div>
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-xs text-muted-foreground">
                  Manage your profile, specialization, and security
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">Mark Hospital</Badge>
              <Badge variant="secondary">HIPAA-ready</Badge>
              <Badge variant="outline">ISO 27001-minded</Badge>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="pt-10"
        >
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full bg-white rounded-xl p-1 shadow-sm border h-12 items-stretch">
              <TabsTrigger
                value="profile"
                className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
              >
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
              >
                <Lock className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="mt-6">
              <Card className="border-0 shadow-lg ring-1 ring-black/5 bg-white/80 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Update your display info shown to patients and staff.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-3 pt-2">
                  {/* LEFT: All text fields in one column */}
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Full Name"
                        className="h-9"
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 …"
                          className="h-9"
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@clinic.com"
                          className="h-9"
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
                          value={clinic}
                          onChange={(e) => setClinic(e.target.value)}
                          placeholder="Your clinic name"
                          className="h-9"
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
                              {specialty || "Select specialization"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command
                              filter={(value: string, search: string) =>
                                value
                                  .toLowerCase()
                                  .includes(search.toLowerCase())
                                  ? 1
                                  : 0
                              }
                            >
                              <CommandInput placeholder="Search specialties…" />
                              <CommandEmpty>No match found.</CommandEmpty>
                              {SPECIALTIES.map((grp) => (
                                <CommandGroup
                                  key={grp.group}
                                  heading={grp.group}
                                >
                                  {grp.items.map((item) => (
                                    <CommandItem
                                      key={item}
                                      value={item}
                                      onSelect={(v: string) => {
                                        setSpecialty(v);
                                        setOpenSpec(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          specialty === item
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
                  </div>

                  {/* RIGHT: Profile photo & signature in second column */}
                  <div className="grid gap-2">
                    <div className="p-2.5 rounded-xl border bg-slate-50">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-20 w-20 ring-2 ring-muted-foreground/10">
                          {avatar ? (
                            <AvatarImage src={avatar} alt="avatar" />
                          ) : (
                            <AvatarFallback>DN</AvatarFallback>
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
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                            {avatar && (
                              <Button
                                variant="ghost"
                                className="text-rose-600 hover:bg-rose-50"
                                onClick={() => setAvatar(null)}
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
                          {signature ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={signature}
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
                            onChange={handleSignatureChange}
                            className="hidden"
                          />
                          {signature && (
                            <Button
                              variant="ghost"
                              className="text-rose-600 hover:bg-rose-50"
                              onClick={() => setSignature(null)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tip: Use a transparent PNG on white background for
                          best results.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    onClick={onSaveProfile}
                    className="gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-700 hover:to-indigo-700 shadow-sm"
                  >
                    <Save className="h-4 w-4" /> Save changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="mt-6">
              <Card className="border-0 shadow-lg ring-1 ring-black/5 bg-white/80 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Change password, enable 2FA, and review recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-1">
                      <Label htmlFor="old">Current password</Label>
                      <Input
                        id="old"
                        type="password"
                        value={oldPwd}
                        onChange={(e) => setOldPwd(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="new">New password</Label>
                      <Input
                        id="new"
                        type="password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="12+ chars, mix of symbols"
                      />
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={false}
                          animate={{ width: `${percent}%` }}
                          className={cn(
                            "h-full",
                            percent < 40
                              ? "bg-red-500"
                              : percent < 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          )}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength: {label}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="confirm">Confirm new password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="Repeat new password"
                      />
                      {newPwd && confirmPwd && newPwd !== confirmPwd && (
                        <p className="text-xs text-red-600">
                          Passwords do not match.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border p-4">
                      <div>
                        <div className="font-medium">
                          Two‑factor authentication (2FA)
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Protect your account with OTP via Authenticator or
                          SMS.
                        </p>
                      </div>
                      <Switch checked={twoFA} onCheckedChange={setTwoFA} />
                    </div>
                    <div className="rounded-xl border p-4 bg-muted/30">
                      <div className="font-medium mb-1">Security tips</div>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>
                          Use 12+ characters with upper/lowercase, numbers &
                          symbols.
                        </li>
                        <li>Do not reuse passwords from other sites.</li>
                        <li>Keep 2FA ON; store backup codes securely.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-2 flex-wrap">
                  <div className="text-xs text-muted-foreground">
                    Last password change: 90 days ago
                  </div>
                  <Button
                    disabled={!canSavePwd}
                    onClick={onSavePassword}
                    className="gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-700 hover:to-indigo-700 disabled:opacity-60 shadow-sm"
                  >
                    <Save className="h-4 w-4" /> Update password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppShell>
  );
}
