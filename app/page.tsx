"use client";

import { useAuth } from "@/auth/context/auth-context";
import LoginForm from "@/components/LoginForm";
import ForgotPassword from "@/components/LoginForm/ForgotPassword";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Preloader } from "@/components/Preloader";
import { CalendarDays, Sparkles, Stethoscope } from "lucide-react";



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
        {/* Brand palette and entrance animations */}
        <style>{`
        :root{ --brand:var(--color-cosmo-copper); --brand-dark:var(--color-cosmo-brown); --brand-soft:var(--color-cosmo-copper); --accent-start:var(--color-cosmo-copper); --accent-end:var(--color-cosmo-brown); --saffron:#FF8F1F; --india-white:#ffffff; --india-green:#138808; }
        @keyframes fadeUp { 0%{ opacity:0; transform:translateY(12px);} 100%{ opacity:1; transform:translateY(0);} }
        .animate-fade-up { animation: fadeUp .5s ease-out both; }
        .animate-fade-up-delay-2 { animation: fadeUp .7s ease-out .1s both; }
      `}</style>

        <div
          className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: "var(--color-cosmo-dark)" }}
        >
          {/* Logo */}
          <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20 animate-fade-up flex items-center gap-4 rounded-2xl border border-white/20 bg-[#160a05]/75 px-5 py-3 shadow-xl backdrop-blur-xl">
            <img 
              src="/logo.png" 
              alt="Cosmo Home Icon" 
              className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" 
            />
            <div className="flex flex-col justify-center">
              <span className="font-fraunces text-xl font-semibold leading-none tracking-wide text-white drop-shadow-sm md:text-[26px]">
                COSMO HOME
              </span>
              <span className="mt-1 text-[10px] font-semibold tracking-[0.15em] text-[#e6b589] drop-shadow-sm md:text-[11px]">
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

          <div className="absolute bottom-20 right-6 z-10 hidden w-full max-w-[21rem] md:right-10 xl:block 2xl:max-w-[26rem]">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#160a05]/55 p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fade-up-delay-2">
              <div className="absolute bottom-6 left-0 top-6 w-1 rounded-r-full bg-[#e6b589]" />
              <div className="mb-3 flex items-center gap-3">
                <span aria-hidden="true" className="font-serif text-4xl leading-none text-[#e6b589]">“</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e6b589]">Our approach to care</span>
              </div>
              <blockquote className="text-base font-medium italic leading-relaxed text-white/95 xl:text-lg">
                I want every patient to leave feeling more like themselves — not different. More radiant. More free.
              </blockquote>
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/15 pt-4">
                <cite className="not-italic text-sm font-semibold tracking-wide text-white">Dr. Ruxana</cite>
                <img src="/login/sign.webp" alt="Dr. Ruxana’s signature" className="h-10 w-auto object-contain object-right opacity-95" />
              </div>
            </div>
          </div>

          <div className="relative mx-auto grid min-h-screen w-11/12 grid-cols-1 items-stretch gap-10 py-28 sm:w-10/12 lg:w-11/12 lg:gap-12 lg:py-16 xl:w-3/4 xl:gap-16 xl:py-20">
            <section className="mx-auto flex w-full max-w-lg flex-col gap-10 self-center">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-6 text-white shadow-[0_24px_70px_-24px_rgba(10,5,3,0.6)] backdrop-blur-sm sm:p-8 animate-fade-up-delay-2">
                <div className="absolute inset-x-6 top-0 h-[3px] rounded-full bg-gradient-to-r from-[var(--brand)] via-[#ead0b8] to-[var(--brand)]" />

                {view === "login" && (
                  <>
                    <h2 className="text-2xl font-semibold text-white xl:text-3xl">
                      Sign in
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      Use your email and password
                    </p>

                    <LoginForm setView={setView} />
                  </>
                )}

                {view === "forgot" && <ForgotPassword setView={setView} />}

                {view === "sent" && (
                  <div className="text-center py-10 animate-fade-up">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
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
                    <h2 className="text-xl font-semibold text-white md:text-2xl">
                      Check your email
                    </h2>
                    <p className="mx-auto mt-2 max-w-sm text-white/75">
                      We emailed a secure reset link. It expires in 15 minutes. If
                      it doesn&apos;t arrive, check spam or{" "}
                      <button className="text-[#e6b589] underline hover:text-white">
                        resend
                      </button>
                      .
                    </p>
                    <button
                      onClick={() => setView("login")}
                      className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-white/90 transition hover:bg-white/10"
                    >
                      Back to login
                    </button>
                  </div>
                )}
              </div>

              {/* Clinic highlights */}
              <div className="grid w-full grid-cols-3 gap-2.5 animate-fade-up-delay-2 sm:gap-3">
                <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/15 bg-black/15 p-3 backdrop-blur-sm sm:rounded-2xl sm:p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c9956a]/20 text-[#e6b589]">
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="whitespace-nowrap font-fraunces text-xl text-[#e6b589] sm:text-2xl md:text-3xl">20+</span>
                  <span className="text-[8px] font-medium uppercase leading-snug tracking-wider text-white/80 sm:text-[10px] md:text-xs">Years of care</span>
                </div>
                <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/15 bg-black/15 p-3 backdrop-blur-sm sm:rounded-2xl sm:p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c9956a]/20 text-[#e6b589]">
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="whitespace-nowrap font-fraunces text-xl text-[#e6b589] sm:text-2xl md:text-3xl">3,800+</span>
                  <span className="text-[8px] font-medium uppercase leading-snug tracking-wider text-white/80 sm:text-[10px] md:text-xs">Transformations</span>
                </div>
                <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/15 bg-black/15 p-3 backdrop-blur-sm sm:rounded-2xl sm:p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c9956a]/20 text-[#e6b589]">
                    <Stethoscope aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="whitespace-nowrap font-fraunces text-lg text-[#e6b589] sm:text-xl md:text-2xl">5 Doctors</span>
                  <span className="text-[8px] font-medium uppercase leading-snug tracking-wider text-white/80 sm:text-[10px] md:text-xs">On your side</span>
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
