import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/8 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus-visible:border-amber-300/40 focus-visible:ring-2 focus-visible:ring-amber-300/15 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
