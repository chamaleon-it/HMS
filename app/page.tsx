"use client";

import { useAuth } from "@/auth/context/auth-context";
import LoginForm from "@/components/LoginForm";
import ForgotPassword from "@/components/LoginForm/ForgotPassword";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Lock, Shield, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const [view, setView] = useState<"login" | "forgot" | "sent">("login");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;

    switch (user.role) {
      case "Doctor":
        router.replace("/dashboard/doctor");
        break;
      case "Pharmacy":
        router.replace("/dashboard/pharmacy");
        break;
      case "Pharmacy Wholesaler":
        router.replace("/dashboard/pharmacy-wholesaler");
        break;
      case "Lab":
        router.replace("/dashboard/lab");
        break;
      case "Reception":
        router.replace("/dashboard/reception");
        break;
      case "Admin":
        router.replace("/dashboard/admin");
        break;
    }
  }, [isAuthenticated, user, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-synapse-dark)] p-4 md:p-8">
      <style>{`
        :root { 
          --brand: var(--color-synapse-purple); 
          --brand-dark: var(--color-synapse-purple); 
          --brand-soft: rgba(139, 92, 246, 0.1); 
          --accent-start: var(--color-synapse-purple); 
          --accent-end: var(--color-synapse-purple); 
        }
      `}</style>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Left Section - Welcome Back */}
        <div className="hidden lg:flex flex-col gap-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Welcome back
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Sign in to manage appointments, billing, labs and reports from one clean dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {[
              { icon: <Lock className="h-4 w-4" />, label: "256-bit SSL" },
              { icon: <Shield className="h-4 w-4" />, label: "HIPAA-ready" },
              { icon: <CheckCircle2 className="h-4 w-4" />, label: "HL7® FHIR" },
              { icon: <Shield className="h-4 w-4" />, label: "ISO 27001" },
              { icon: <CheckCircle2 className="h-4 w-4" />, label: "ABDM-ready" },
              { icon: <span className="text-lg leading-none">🇮🇳</span>, label: "Proudly made in India" },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-sm font-medium">
                <span className="text-slate-400">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>

          <div className="mt-4 max-w-lg p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-slate-300 italic">
              "Listen to your patient; he is telling you the diagnosis."
            </p>
            <p className="text-slate-400 text-sm mt-3 font-medium">
              — William Osler
            </p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-slate-50 rounded-[1.5rem] p-8 shadow-2xl">
            {view === "login" && (
              <>
                <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
                <p className="mt-1.5 text-slate-500 text-sm">
                  Use your email and password
                </p>
                <LoginForm setView={setView} />
                
                <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-slate-300" /> HIPAA-ready</span>
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-slate-300" /> HL7® FHIR</span>
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-slate-300" /> ISO 27001</span>
                </div>
                <p className="mt-3 text-[10px] text-center text-slate-400 max-w-xs mx-auto">
                  Badges indicate design readiness; formal compliance depends on your deployment & policies.
                </p>
              </>
            )}

            {view === "forgot" && <ForgotPassword setView={setView} />}

            {view === "sent" && (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--brand-soft) text-[var(--brand)]">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
                <p className="mt-2 text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  We emailed a secure reset link. It expires in 15 minutes. If it doesn't arrive, check spam or <button className="underline text-[var(--brand)] hover:text-[var(--brand-dark)]">resend</button>.
                </p>
                <button
                  onClick={() => setView("login")}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Back to login
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
