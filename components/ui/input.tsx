import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, onBlur, onChange, ...props }: React.ComponentProps<"input">) {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === "number" && e.target.value !== "") {
      const num = parseFloat(e.target.value);
      if (!isNaN(num)) {
        const formatted = num.toFixed(2);
        if (e.target.value !== formatted) {
          e.target.value = formatted;
          const event = new Event("input", { bubbles: true });
          // In React 15.6+ we need to use the native value setter before dispatching
          const tracker = (e.target as any)._valueTracker;
          if (tracker) {
            tracker.setValue(e.target.value);
          }
          e.target.dispatchEvent(event);
        }
      }
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onBlur={handleBlur}
      onChange={onChange}
      {...props}
    />
  )
}

export { Input }
