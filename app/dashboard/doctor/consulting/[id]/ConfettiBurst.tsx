import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function ConfettiBurst({
  show,
  onDone,
}: {
  show: boolean;
  onDone?: () => void;
}) {
  const pieces = new Array(22).fill(0)?.map((_, i) => i);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => onDone && onDone()}
        >
          {pieces?.map((i) => {
            const left = Math.random() * 100; // vw
            const delay = Math.random() * 0.15;
            const rotate = Math.random() * 360;
            return (
              <motion.span
                key={i}
                className="absolute block w-2 h-2 rounded-[2px] bg-emerald-400"
                style={{ left: `${left}vw`, top: `40vh` }}
                initial={{ y: 0, scale: 0.9, rotate }}
                animate={{
                  y: [0, -80, 140],
                  x: [0, 20, -10],
                  opacity: [1, 0.9, 0],
                  scale: [1, 0.9, 1],
                }}
                transition={{ duration: 1.2, delay, ease: "easeOut" }}
              />
            );
          })}
          <motion.div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-2xl px-5 py-4 flex items-center gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span className="text-slate-800 font-medium">Success</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
