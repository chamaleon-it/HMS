"use client";

import { useAuth } from "@/auth/context/auth-context";
import LoginForm from "@/components/LoginForm";
import ForgotPassword from "@/components/LoginForm/ForgotPassword";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Preloader } from "@/components/Preloader";



export default function LoginPage() {
  const { isAuthenticated, user, loading } = useAuth();

  const [view, setView] = useState<"login" | "forgot" | "sent">("login");
  const [ready, setReady] = useState(false);
  const handlePreloaderDone = useCallback(() => setReady(true), []);




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
    }
  }, [isAuthenticated, user, router]);


  if (loading) return null;

  return (
    <div>
      <AnimatePresence mode="wait">
        {!ready && <Preloader key="preloader" onDone={handlePreloaderDone} />}
      </AnimatePresence>
      <motion.div
        initial={false}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Brand palette + India tricolour + animations */}
        <style>{`
        :root{ --brand:var(--color-cosmo-copper); --brand-dark:var(--color-cosmo-brown); --brand-soft:var(--color-cosmo-copper); --accent-start:var(--color-cosmo-copper); --accent-end:var(--color-cosmo-brown); --saffron:#FF8F1F; --india-white:#ffffff; --india-green:#138808; }
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
          style={{ backgroundColor: "var(--color-cosmo-dark)" }}
        >
          {/* Logo */}
          <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20 animate-fade-up flex items-center gap-4 px-5 py-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-xl">
            <img 
              src="/logo.png" 
              alt="Cosmo Home Icon" 
              className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" 
            />
            <div className="flex flex-col justify-center">
              <span className="text-[#a6906c] font-fraunces text-xl md:text-[26px] font-medium tracking-wide leading-none drop-shadow-sm">
                COSMO HOME
              </span>
              <span className="text-[#a6906c] text-[10px] md:text-[11px] font-medium tracking-[0.15em] mt-1 opacity-95 drop-shadow-sm">
                AESTHETIC MEDICINE
              </span>
            </div>
          </div>

          {/* grid overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "url(/login/banner.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch w-11/12 lg:w-3/4 mx-auto h-screen py-12 lg:py-20">
            <div className="hidden lg:flex flex-col justify-end h-full pb-12">
              <div className="animate-fade-up-delay-2 max-w-md p-6 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/10 shadow-xl">
                <p className="text-lg xl:text-xl text-white font-medium leading-snug italic drop-shadow-sm">
                  "I want every patient to leave feeling more like themselves — not different. More radiant. More free."
                </p>
                <div className="mt-4 flex flex-col gap-1.5 drop-shadow-sm">
                  <span className="text-xl">🧡</span>
                  <span className="text-base text-white font-semibold tracking-wide">— Dr. Ruxana</span>
                  <img src="/login/sign.webp" alt="Dr. Ruxana Signature" className="h-12 w-auto object-contain object-left mt-1 opacity-90" />
                </div>
              </div>
            </div>

            <section className="w-full max-w-lg ml-auto self-center flex flex-col gap-10">
              <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-[2px] shadow-[0_12px_36px_-12px_rgba(2,6,23,0.25)] p-6 md:p-8 relative overflow-hidden animate-fade-up-delay-2">

                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(37,99,235,.18) 0%, transparent 70%)",
                  }}
                />

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
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
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
                      <button className="underline text-(--brand) hover:text-(--brand-dark)">
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

              {/* Stats Row with Separator */}
              <div className="flex flex-col gap-6 animate-fade-up-delay-2 w-full">
                <div className="w-full h-px bg-white/20" />
                <div className="flex items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                  <span className="text-3xl md:text-4xl font-fraunces text-[var(--brand)] drop-shadow-sm">20+</span>
                  <span className="text-[10px] md:text-xs tracking-widest text-white/95 uppercase font-medium">Years of Care</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl md:text-4xl font-fraunces text-[var(--brand)] drop-shadow-sm">3,800+</span>
                  <span className="text-[10px] md:text-xs tracking-widest text-white/95 uppercase font-medium">Transformations</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl md:text-4xl font-fraunces text-[var(--brand)] drop-shadow-sm">5 Doctors</span>
                  <span className="text-[10px] md:text-xs tracking-widest text-white/95 uppercase font-medium">On your side</span>
                </div>
              </div>
            </div>

            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function IndiaFlagIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">

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
