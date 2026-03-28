import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-xl border border-[#d7cab9] bg-[#fbf8f3] px-3 py-2 text-sm text-[#241d18] outline-none transition placeholder:text-[#9a8f82] focus-visible:border-[#a6937c] focus-visible:ring-2 focus-visible:ring-[#a6937c]/15 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
