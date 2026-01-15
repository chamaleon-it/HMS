import { useAuth } from "@/auth/context/auth-context";
import api, { tokenStore } from "@/lib/axios";
import { loginSchema } from "@/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Shield } from "lucide-react";
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
      console.log(error);
    }
  });



  return (
    <form className="mt-5 space-y-4" onSubmit={login}>
      <div>
        <label className="block text-slate-700 text-sm mb-1" htmlFor="email">
          Email
        </label>
        <div
          className={`flex items-center rounded-lg bg-white border ${errors.email ? "border-red-400" : "border-slate-300"
            } focus-within:ring-4 focus-within:ring-[color:var(--brand-soft)] focus-within:border-[var(--brand)] hover:border-slate-400 transition`}
        >
          <Mail className="ml-3 mr-2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="email"
            {...register("email")}
            type="email"
            autoComplete="email"
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 px-3.5 py-2.5 outline-none"
            placeholder="you@company.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-slate-700 text-sm mb-1" htmlFor="password">
          Password
        </label>
        <div
          className={`flex items-center rounded-lg bg-white border ${errors.password ? "border-red-400" : "border-slate-300"
            } focus-within:ring-4 focus-within:ring-[color:var(--brand-soft)] focus-within:border-[var(--brand)] hover:border-slate-400 transition`}
        >
          <Lock className="ml-3 mr-2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="password"
            {...register("password")}
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 px-3.5 py-2.5 outline-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-700">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-300 text-[var(--brand)] focus:ring-[color:var(--brand-soft)]"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => setView("forgot")}
          className="text-[var(--brand)] hover:text-[var(--brand-dark)] underline decoration-[rgba(37,99,235,.25)]"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-white font-medium transition active:scale-[.99] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-soft)] shadow-[0_6px_20px_-6px_rgba(37,99,235,0.6)] hover:shadow-[0_12px_30px_-10px_rgba(37,99,235,0.75)]"
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

      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-[var(--brand)]" />
          <span>HIPAA-ready</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-[var(--brand)]" />
          <span>HL7&reg; FHIR</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-[var(--brand)]" />
          <span>ISO 27001</span>
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] text-slate-400">
        Badges indicate design readiness; formal compliance depends on your
        deployment & policies.
      </p>
    </form>
  );
}
