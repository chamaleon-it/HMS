"use client";

import RegisterPageWelcomeMessages from "@/components/RegisterPageWelcomeMessages";
import React, { useEffect } from "react";
import Form from "./Form";
import { useAuth } from "@/auth/context/auth-context";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role) {
      if (user.role === "Doctor") {
        router.push("/dashboard/doctor");
      } else if (user.role === "Pharmacy") {
        router.push("/dashboard/pharmacy");
      }
    }
  }, [user?.role,router]);

  if (isAuthenticated) return null;

  return (
    <div>
      <style>{`
        :root{ --brand:#2563eb; --brand-dark:#1e40af; --brand-soft:#eaf1ff; --accent-start:#60a5fa; --accent-end:#7c3aed; --saffron:#FF8F1F; --india-white:#ffffff; --india-green:#138808; }
        @keyframes ribbonPan { 0%{ background-position:0% 50%; } 100%{ background-position:200% 50%; } }
        @keyframes fadeUp { 0%{ opacity:0; transform:translateY(12px);} 100%{ opacity:1; transform:translateY(0);} }
        @keyframes floatSoft { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-4px);} }
        .animate-ribbon { background-size:200% 100%; animation:ribbonPan 12s linear infinite; }
        .animate-fade-up { animation: fadeUp .5s ease-out both; }
        .animate-fade-up-delay-1 { animation: fadeUp .6s ease-out .05s both; }
        .animate-fade-up-delay-2 { animation: fadeUp .7s ease-out .1s both; }
        .animate-float { animation: floatSoft 5s ease-in-out infinite; }
      `}</style>

      <div
        className="relative  h-screen w-full flex justify-center items-center"
        style={{ backgroundColor: "#082242" }}
      >
        {/* grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "22px 22px, 44px 44px",
            backgroundPosition: "0 0, 11px 11px",
          }}
        />

        <div className="relative grid grid-cols-2 gap-16 items-center w-3/4 mx-auto">
          <RegisterPageWelcomeMessages />

          {/* Right: the form card */}
          <section className="w-full max-w-lg ml-auto animate-fade-up-delay-2">
            <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-[2px] shadow-[0_12px_36px_-12px_rgba(2,6,23,0.25)] p-6 md:p-8 relative overflow-hidden">
              {/* decorative soft glow for attractiveness */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, rgba(37,99,235,.18) 0%, transparent 70%)",
                }}
              />
              {/* subtle top gradient accent (brand) */}
              <div
                className="absolute -top-px left-6 right-6 h-[3px] rounded-full animate-ribbon"
                style={{
                  background:
                    "linear-gradient(90deg, var(--brand), var(--accent-end), var(--brand))",
                }}
              />

              <h2 className="text-2xl xl:text-3xl font-semibold text-slate-900">
                Register
              </h2>
              <p className="mt-1 text-slate-500 text-sm">
                Use your full name, email and password
              </p>

              <Form />
            </div>

            <p className="mt-4 text-xs text-slate-200">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
