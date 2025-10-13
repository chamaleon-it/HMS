import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import api from "@/lib/axios";
import {
  changePasswordInput,
  changePasswordSchema,
} from "@/schemas/changePasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function SecurityForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<changePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePassword = handleSubmit(async (data) => {
    try {
      await toast.promise(api.patch("/users/update_password", data), {
        loading: "Your password is updating...!",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <TabsContent value="security" className="mt-6">
      <form onSubmit={changePassword}>
        <Card className="border-0 shadow-lg ring-1 ring-black/5 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Change password, enable 2FA, and review recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="old">Current password</Label>
                <Input
                  id="old"
                  type="password"
                  placeholder="••••••••"
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New password</Label>
                <Input
                  id="new"
                  type="password"
                  placeholder="12+ chars, mix of symbols"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repeat new password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
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
                    Protect your account with OTP via Authenticator or SMS.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="rounded-xl border p-4 bg-muted/30">
                <div className="font-medium mb-1">Security tips</div>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>
                    Use 12+ characters with upper/lowercase, numbers & symbols.
                  </li>
                  <li>Do not reuse passwords from other sites.</li>
                  <li>Keep 2FA ON; store backup codes securely.</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-2 flex-wrap">
            <Button
              className="gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-700 hover:to-indigo-700 disabled:opacity-60 shadow-sm"
              type="submit"
            >
              <Save className="h-4 w-4" /> Update password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </TabsContent>
  );
}
