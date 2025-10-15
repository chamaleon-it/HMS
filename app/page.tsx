"use client";

import { useAuth } from "@/auth/context/auth-context";
import LoginForm from "@/components/LoginForm";
import ForgotPassword from "@/components/LoginForm/ForgotPassword";
import { Lock, Shield } from "lucide-react";
import { redirect } from "next/navigation";
import React, { useState, useMemo } from "react";

export default function LoginPage() {
  const { isAuthenticated, user, loading } = useAuth();

  const [view, setView] = useState<"login" | "forgot" | "sent">("login");

  const quotes = [
    {
      text: "Listen to your patient; he is telling you the diagnosis.",
      author: "William Osler",
    },
    {
      text: "The idea that some lives matter less is the root of all that is wrong with the world.",
      author: "Paul Farmer",
    },
    {
      text: "I attribute my success to this: I never gave or took any excuse.",
      author: "Florence Nightingale",
    },
    {
      text: "If a solution is not affordable, it is not a solution.",
      author: "Dr. Devi Shetty",
    },
    {
      text: "It is not easy to be a pioneer, but oh, it is fascinating!",
      author: "Elizabeth Blackwell",
    },
    {
      text: "Better is possible. It does not take genius. It takes diligence.",
      author: "Atul Gawande",
    },
  ] as const;
  const selectedQuote = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
    []
  );

  if (loading) return null;

  if (isAuthenticated) {
    if (user?.role) {
      if (user.role === "Doctor") {
        redirect("/dashboard/doctor");
      } else if (user.role === "Pharmacy") {
        redirect("/dashboard/pharmacy");
      }
    }
  }

  return (
    <div>
      {/* Brand palette + India tricolour + animations */}
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
          <section className="block animate-fade-up-delay-1 text-white">
            <h1 className="text-5xl font-semibold leading-tight">
              Welcome back
            </h1>
            <p className="mt-4 text-slate-200/90 max-w-xl text-lg">
              Sign in to manage appointments, billing, labs and reports from one
              clean dashboard.
            </p>

            {/* Trust chips */}
            <div className="mt-6 grid grid-cols-3 gap-5">
              {[
                { label: "256-bit SSL", icon: Lock },
                { label: "HIPAA-ready", icon: Shield },
                { label: "HL7&reg; FHIR", icon: Shield },
                { label: "ISO 27001", icon: Shield },
                { label: "ABDM-ready", icon: Shield },
                { label: "Proudly made in India", icon: IndiaFlagIcon },
              ].map(({ label, icon: Icon }, idx) => (
                <div
                  key={label}
                  style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
                  className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100 text-sm"
                >
                  <Icon className="h-5 w-5 text-white" />
                  <span dangerouslySetInnerHTML={{ __html: label }} />
                </div>
              ))}
            </div>

            {/* Medical quote (rotates per refresh) */}
            <div className="mt-6 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm animate-fade-up">
              <blockquote className="rounded-[12px] bg-white/10 p-5 text-slate-100 shadow-sm">
                <p className="italic text-sm">
                  &ldquo;{selectedQuote.text}&rdquo;
                </p>
                <footer className="mt-2 text-xs text-slate-300">
                  &mdash; {selectedQuote.author}
                </footer>
              </blockquote>
            </div>
          </section>

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

              {view === "login" && (
                <>
                  <h2 className="text-2xl xl:text-3xl font-semibold text-slate-900">
                    Sign in
                  </h2>
                  <p className="mt-1 text-slate-500 text-sm">
                    Use your email and password
                  </p>

                  <LoginForm setView={setView} />
                </>
              )}

              {view === "forgot" && <ForgotPassword setView={setView} />}

              {view === "sent" && (
                <div className="text-center py-10 animate-fade-up">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                    <svg
                      className="h-7 w-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                    Check your email
                  </h2>
                  <p className="mt-2 text-slate-600 max-w-sm mx-auto">
                    We emailed a secure reset link. It expires in 15 minutes. If
                    it doesn&apos;t arrive, check spam or{" "}
                    <button className="underline text-[var(--brand)] hover:text-[var(--brand-dark)]">
                      resend
                    </button>
                    .
                  </p>
                  <button
                    onClick={() => setView("login")}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    Back to login
                  </button>
                </div>
              )}
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

function IndiaFlagIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {/* Rounded flag with accurate tricolour and a cleaner Ashoka Chakra */}
      <defs>
        <clipPath id="flagClip">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#flagClip)">
        {/* Stripes */}
        <rect x="2" y="4" width="20" height="16" fill="#FF8F1F" />
        <rect x="2" y="9.33" width="20" height="5.34" fill="#ffffff" />
        <rect x="2" y="14.67" width="20" height="5.33" fill="#138808" />
        {/* Ashoka Chakra */}
        <g
          transform="translate(12,12)"
          fill="none"
          stroke="#0a3d91"
          strokeWidth="0.9"
        >
          <circle r="2.6" />
          {/* 24 spokes */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2="0"
              y2="-2.6"
              transform={`rotate(${i * 15})`}
            />
          ))}
        </g>
      </g>
      {/* Removed outer outline for a cleaner look */}
    </svg>
  );
}
