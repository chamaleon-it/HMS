import React from "react";
import { Heart, Github, Twitter, Linkedin } from "lucide-react";

/**
 * Modern Footer (Colorful & Attractive)
 * - Gradient background
 * - Vibrant link and icon accents
 */
export default function Footer() {
  return (
    <footer className="border-t border-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white print:hidden">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
        {/* Left */}
        <div className="flex items-center gap-2">

        </div>

        {/* Center links */}
        <div className="flex items-center gap-6">

          {/* <a href="#" className="hover:text-yellow-200 transition-colors">Privacy</a>
          <a href="#" className="hover:text-lime-200 transition-colors">Terms</a>
          <a href="#" className="hover:text-cyan-200 transition-colors">Support</a> */}
        </div>

        {/* Right social icons */}
        <div className="flex items-center gap-4">
          <p className="text-white text-xs">Powered by <span className="font-bold">SYNAPSE IT SERVICES LLP</span></p>
          {/* <a href="#" className="rounded-full p-2 hover:bg-white/20 transition"><Github className="h-5 w-5"/></a>
          <a href="#" className="rounded-full p-2 hover:bg-white/20 transition"><Twitter className="h-5 w-5 text-sky-300"/></a>
          <a href="#" className="rounded-full p-2 hover:bg-white/20 transition"><Linkedin className="h-5 w-5 text-blue-200"/></a> */}
        </div>
      </div>
    </footer>
  );
}

/**
 * Smoke Test (manual)
 */
export function FooterSmokeTest() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 p-6 text-slate-700">If you can see colorful footer below, mount passed.</main>
      <Footer />
    </div>
  );
}