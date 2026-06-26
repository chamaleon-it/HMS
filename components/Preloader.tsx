"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE2: [number, number, number, number] = [0.76, 0, 0.24, 1];
const D = { fontFamily: "'Fraunces', serif" };
const M = { fontFamily: "'DM Mono', monospace" };

export function Preloader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4500); // 4500ms to allow animation to finish
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#1C0E08]"
      initial={{ opacity: 1 }} exit={{ y: "-100%", transition: { duration: 1, ease: EASE2 } }}>
      {["top-8 left-8 border-t border-l", "top-8 right-8 border-t border-r", "bottom-8 left-8 border-b border-l", "bottom-8 right-8 border-b border-r"].map((c, i) => (
        <motion.div key={i} className={`absolute w-10 h-10 border-cosmo-copper/40 ${c}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }} />
      ))}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="flex flex-row items-center justify-center">
          <motion.div className="shrink-0"
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.1, duration: 1.2, ease: EASE }}>
            <motion.svg viewBox="0 0 123.8 216" className="w-[70px] md:w-[85px] h-auto">
              <motion.path
                d="M71.6,48.3c-2.6,4.2-5,8.3-7.9,12.3-4.2,5.8-8.4,11.4-13.2,16.8l-16.3,18c-6.9,7.6-12.3,15.4-15.2,25.4-2.2,7.8-2.2,15.7.1,23.5s3.8,9.4,6.5,14c-4-3.4-7.2-7.1-10.3-11.2-12.8-17.5-13-36-1.6-54.3,2.7-4.3,5.7-8,9-11.9,6.8-7.7,13.2-15.5,19.3-23.8s9.3-13.2,13.1-20.4c4.6-8.9,8.5-18.6,7.4-28.8,26,18.5,40.6,44.2,22,74.1-2.7,4.3-5.8,8.1-9.2,12-6.9,8-13.6,16-19.8,24.5-4.6,6.3-8.7,12.6-12.4,19.5-4.4,8.6-8.2,18-7.5,27.9-10.7-12-16.2-26.5-12.3-42.4,2.4-10,7.9-18.8,14.5-26.7,9.9-11.8,19.5-23.9,27.6-37.1,2.1-3.7,4.3-7.2,5.9-11.2Z"
                fill="#7d5745"
                stroke="#a6906c"
                strokeWidth="1"
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={{ pathLength: 1, fillOpacity: 1 }}
                transition={{
                  pathLength: { duration: 1.5, ease: EASE },
                  fillOpacity: { delay: 1.0, duration: 1.5, ease: EASE }
                }}
              />
              <motion.path
                d="M82.8,145.1c-.3-.7-1-1.1-1.7-1.4,1.6.4,2.7.1,3.7-1s1-2.3.3-3.6-.6-3.4.9-4.3c2.9-1.9,5.8-1.3,8.1-4.3s.7-1.8.3-2.6l-2.4-5c-1.3-2.7-2.9-5.3-4.1-8.1l.7-1.8c3.3,1.6,6.8,2.4,10.2,1.4-2.3-.3-4.3-.6-6.2-1.3l3.4-.5-5.1-.9,3.5-.7c-2-.2-3.9-.4-5.9-1l-1-1.8c2.8-4.9,5.6-6,7.2-12.2s1.6-11.9.5-17.9-.3-2.7-.2-4.3c8.3,6.9,15.6,15,20,25,4.6,10.4,4.2,21.8-.8,31.9-3.1,6.3-7.4,11.8-12.5,16.7-11.2,11-22.6,23-31.2,36.2-4.7,7.5-8.7,15.8-8.5,24.8-12.7-10.6-24.4-25.4-23.2-42.6.6-8.5,8.2-13.6,11.2-11.7l9.9,6.4c2.8,1.8,5.6,3.3,8.7,4.2s5,0,6.3-2.4,2.2-6,2.4-9.3,3-2.5,5-4.4.9-2.2.5-3.3Z"
                fill="#a6906c"
                stroke="#a6906c"
                strokeWidth="1"
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={{ pathLength: 1, fillOpacity: 1 }}
                transition={{
                  pathLength: { duration: 1.5, ease: EASE },
                  fillOpacity: { delay: 0.6, duration: 1.5, ease: EASE }
                }}
              />
            </motion.svg>
          </motion.div>

          <motion.div className="overflow-hidden flex flex-col items-end whitespace-nowrap"
            initial={{ maxWidth: 0, opacity: 0, paddingLeft: 0 }}
            animate={{ maxWidth: 500, opacity: 1, paddingLeft: "1.75rem" }}
            transition={{
              maxWidth: { delay: 1.1, duration: 2, ease: EASE },
              paddingLeft: { delay: 1.1, duration: 2, ease: EASE },
              opacity: { delay: 1.3, duration: 1.0, ease: EASE }
            }}>
            <h1 className="text-[#a6906c] text-[32px] md:text-[44px] font-medium" style={D}>
              COSMO HOME
            </h1>
            <p className="w-full text-right text-[#7d5745] text-[10px] md:text-[13px] font-medium uppercase pr-1" style={M}>
              Skin Care Centre
            </p>
            <motion.p className="text-[#a6906c] text-[15px] md:text-[18px] w-full text-center mt-3 pointer-events-none" style={{ ...D, fontStyle: "italic" }}
              initial={{ opacity: 0, y: -10, textShadow: "0 0 0px rgba(166,144,108,0)" }}
              animate={{ opacity: 1, y: 0, textShadow: "0 0 15px rgba(166,144,108,0.5)" }}
              transition={{ delay: 1.6, duration: 1, ease: EASE }}>
              Aesthetics at home ambience
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
