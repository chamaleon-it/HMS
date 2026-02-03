import FormFooter from "@/components/RegisterPageFormFooter";
import { CircleUser, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/schemas/signupSchema";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function Form() {
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const signup = handleSubmit(async (data) => {
    try {
      await toast.promise(api.post("/users", data), {
        loading: "Please wait. account is creating.",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <form className="mt-5 space-y-4" onSubmit={signup}>
      <div>
        <label className="block text-slate-700 text-sm mb-1" htmlFor="name">
          Full Name
        </label>
        <div
          className={`flex items-center rounded-lg bg-white border ${errors.name ? "border-red-400" : "border-slate-300"
            } focus-within:ring-4 focus-within:ring-(--brand-soft) focus-within:border-(--brand) hover:border-slate-400 transition`}
        >
          <CircleUser className="ml-3 mr-2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 px-3.5 py-2.5 outline-none"
            placeholder="Enter your full name"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>



      <div>
        <label className="block text-slate-700 text-sm mb-1" htmlFor="email">
          Email
        </label>
        <div
          className={`flex items-center rounded-lg bg-white border ${errors.email ? "border-red-400" : "border-slate-300"
            } focus-within:ring-4 focus-within:ring-(--brand-soft) focus-within:border-(--brand) hover:border-slate-400 transition`}
        >
          <Mail className="ml-3 mr-2 h-4.5 w-4.5 text-slate-400" />

          <input
            id="email"
            type="email"
            autoComplete="email"
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 px-3.5 py-2.5 outline-none"
            placeholder="you@company.com"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-slate-700 text-sm mb-1" htmlFor="i'm a ">
          I&apos;m a
        </label>
        <div
          className={`flex items-center rounded-lg bg-white border max-w-36 ${errors.role ? "border-red-400" : "border-slate-300"
            } focus-within:ring-4 focus-within:ring-(--brand-soft) focus-within:border-(--brand) hover:border-slate-400 transition`}
        >

          <select
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 px-3.5 py-2.5 outline-none max-w-32"
            {...register("role")}
          >
            <option value="">I&apos;m a</option>
            <option value="Doctor">Doctor</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Pharmacy Wholesaler">Pharmacy Wholesaler</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
        {errors.role && (
          <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div>
        <label className="block text-slate-700 text-sm mb-1" htmlFor="password">
          Password
        </label>
        <div
          className={`flex items-center rounded-lg bg-white border ${errors.password ? "border-red-400" : "border-slate-300"
            } focus-within:ring-4 focus-within:ring-(--brand-soft) focus-within:border-(--brand) hover:border-slate-400 transition`}
        >
          <Lock className="ml-3 mr-2 h-4.5 w-4.5 text-slate-400" />

          <input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 px-3.5 py-2.5 outline-none"
            placeholder="••••••••"
            {...register("password")}
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

      <div>
        <label
          className="block text-slate-700 text-sm mb-1"
          htmlFor="confirmPassword"
        >
          Confirm Password
        </label>
        <div
          className={`flex items-center rounded-lg bg-white border ${errors.confirmPassword ? "border-red-400" : "border-slate-300"
            } focus-within:ring-4 focus-within:ring-(--brand-soft) focus-within:border-(--brand) hover:border-slate-400 transition`}
        >
          <Lock className="ml-3 mr-2 h-4.5 w-4.5 text-slate-400" />

          <input
            id="confirmPassword"
            {...register("confirmPassword")}
            type={showPwd ? "text" : "password"}
            autoComplete="confirmPassword"
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
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-white font-medium transition active:scale-[.99] focus:outline-none focus:ring-4 focus:ring-(--brand-soft) hover:shadow-(--shadow-md)"
        style={{
          background: "linear-gradient(90deg, var(--brand), var(--accent-end))",
        }}
      >
        <span className="transition-transform group-hover:translate-x-0.5">
          {isSubmitting ? "Registering..." : "Sign up"}
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
      <FormFooter />
    </form>
  );
}
