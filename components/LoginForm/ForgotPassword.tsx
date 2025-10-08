import api from "@/lib/axios";
import { forgotPasswordSchema } from "@/schemas/forgotPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function ForgotPassword({
  setView,
}: {
  setView: React.Dispatch<React.SetStateAction<"login" | "forgot" | "sent">>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPassword = handleSubmit(async (data) => {
    try {
      const { data: forgotPasswordData } = await toast.promise(
        api.post("/users/forgot_password", data),
        {
          loading:
            "Please wait while we send the reset link to your email address.",
          success: ({ data }) => data.message,
          error: ({ response }) => response.data.message,
        }
      );
      
      console.log(forgotPasswordData);

      setView("sent");
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <>
      <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
        Reset your password
      </h2>
      <p className="mt-1 text-slate-500 text-sm">
        Enter your account email &mdash; we&apos;ll send a secure reset link.
      </p>

      <form className="mt-5 space-y-4" onSubmit={forgotPassword}>
        <div>
          <label className="block text-slate-700 text-sm mb-1" htmlFor="email">
            Email
          </label>
          <div
            className={`flex items-center rounded-lg bg-white border ${
              errors.email ? "border-red-400" : "border-slate-300"
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

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setView("login")}
            className="text-slate-600 hover:text-slate-900"
          >
            &larr; Back to login
          </button>
          <div className="text-xs text-slate-500">
            Need help? Contact support
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-white font-medium transition active:scale-[.99] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-soft)] shadow-[0_6px_20px_-6px_rgba(37,99,235,0.6)] hover:shadow-[0_12px_30px_-10px_rgba(37,99,235,0.75)]"
          style={{
            background:
              "linear-gradient(90deg, var(--brand), var(--accent-end))",
          }}
        >
          <span className="transition-transform group-hover:translate-x-0.5">
            {isSubmitting ? "Sending..." : "Send reset link"}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${
              isSubmitting ? "animate-pulse" : "group-hover:translate-x-1"
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

        <p className="text-[10px] text-slate-400 text-center">
          For your safety we never send passwords &mdash; only a time-bound
          reset link.
        </p>
      </form>
    </>
  );
}
