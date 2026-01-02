import { Lock, Shield } from 'lucide-react';
import React, { useMemo } from 'react'

export default function RegisterPageWelcomeMessages() {
  const selectedQuote = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
    []
  );

  return (
    <section className="block animate-fade-up-delay-1 text-white">
      <h1 className="text-5xl font-semibold leading-tight">
        Welcome to HMS
      </h1>
      <p className="mt-4 text-slate-200/90 max-w-xl text-lg">
        Sign up to manage appointments, billing, labs and reports from one
        clean dashboard.
      </p>

      {/* Trust chips */}
      <div className="mt-6 grid grid-cols-3 gap-5">
        {USPs?.map(({ label, icon: Icon }, idx) => (
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
  )
}





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
];



const USPs = [
  { label: "256-bit SSL", icon: Lock },
  { label: "HIPAA-ready", icon: Shield },
  { label: "HL7&reg; FHIR", icon: Shield },
  { label: "ISO 27001", icon: Shield },
  { label: "ABDM-ready", icon: Shield },
  { label: "Proudly made in India", icon: IndiaFlagIcon },
];

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
          {Array.from({ length: 24 })?.map((_, i) => (
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
