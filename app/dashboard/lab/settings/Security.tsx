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

export default function Security() {
  const {
    register,
    handleSubmit,
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

    }
  });

  return (
    <form onSubmit={changePassword}>
      <Card className="border-0 shadow-lg ring-1 ring-black/5 bg-white/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
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

        </CardContent>
        <CardFooter className="justify-between gap-2 flex-wrap">
          <Button
            className="gap-2 bg-gradient-to-r from-[var(--color-cosmo-dark)] to-[var(--color-cosmo-brown)] text-white hover:from-[var(--color-cosmo-brown)] hover:to-[var(--color-cosmo-brown)] disabled:opacity-60 shadow-sm"
            type="submit"
          >
            <Save className="h-4 w-4" /> Update password
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
