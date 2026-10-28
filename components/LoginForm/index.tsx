import { useAuth } from "@/auth/context/auth-context";
import api, { tokenStore } from "@/lib/axios";
import { loginSchema } from "@/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function LoginForm({
  setView,
}: {
  setView: React.Dispatch<React.SetStateAction<"login" | "forgot" | "sent">>;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const login = handleSubmit(async (data) => {
    try {
      const { data: loginData } = await toast.promise(
        api.post("/auth/login", data),
        {
          loading: "Please wait. Logging in to your account",
          success: ({ data }) => data.message,
          error: ({ response }) => response.data.message,
        }
      );
      const { accessToken, refreshToken, user } = loginData?.data;
      const { _id, role, email, name } = user;
      setUser({ _id, email, name, role });
      tokenStore.set(accessToken, refreshToken);
    } catch (error) {

    }
  });



  return (
    <form className="mt-6 space-y-5" onSubmit={login}>
      <div>
        <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="email">
          Email
        </label>
        <div
          className={`flex h-14 items-center overflow-hidden rounded-xl border bg-white/10 shadow-inner backdrop-blur-sm transition focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[color:var(--brand-soft)] ${errors.email ? "border-red-300" : "border-white/25 hover:border-white/45"
            }`}
        >
          <span className="flex h-full w-12 shrink-0 items-center justify-center border-r border-white/15 bg-white/10">
            <Mail aria-hidden="true" className="h-[18px] w-[18px] text-white/70" />
          </span>
          <input
            id="email"
            {...register("email")}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="login-glass-input h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-white outline-none placeholder:text-white/55"
            placeholder="you@company.com"
          />
        </div>
        {errors.email && (
          <p id="login-email-error" className="mt-1.5 text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="password">
          Password
        </label>
        <div
          className={`flex h-14 items-center overflow-hidden rounded-xl border bg-white/10 shadow-inner backdrop-blur-sm transition focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[color:var(--brand-soft)] ${errors.password ? "border-red-300" : "border-white/25 hover:border-white/45"
            }`}
        >
          <span className="flex h-full w-12 shrink-0 items-center justify-center border-r border-white/15 bg-white/10">
            <Lock aria-hidden="true" className="h-[18px] w-[18px] text-white/70" />
          </span>
          <input
            id="password"
            {...register("password")}
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className="login-glass-input h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-white outline-none placeholder:text-white/55"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            aria-pressed={showPwd}
            aria-label={showPwd ? "Hide password" : "Show password"}
            title={showPwd ? "Hide password" : "Show password"}
            className="flex h-full w-12 shrink-0 items-center justify-center border-l border-white/15 bg-white/10 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
          >
            {showPwd ? (
              <EyeOff aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Eye aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="login-password-error" className="mt-1.5 text-xs text-red-300">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-white/85">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-300 text-[var(--brand)] accent-[var(--brand)] focus:ring-[color:var(--brand-soft)]"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => setView("forgot")}
          className="text-[var(--brand)] hover:text-[var(--brand-dark)] underline decoration-[rgba(201,149,106,.25)]"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl px-4 font-semibold text-white shadow-[0_10px_24px_-12px_rgba(46,27,19,0.8)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-soft)] active:scale-[.99] disabled:cursor-wait disabled:opacity-75"
        style={{
          background: "linear-gradient(90deg, var(--brand), var(--accent-end))",
        }}
      >
        <span className="transition-transform group-hover:translate-x-0.5">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isSubmitting ? "animate-pulse" : "group-hover:translate-x-1"
            }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>


    </form>
  );
}
