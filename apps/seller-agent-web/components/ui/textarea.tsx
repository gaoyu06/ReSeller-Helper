import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-xl border border-[#d7cab9] bg-[#fbf8f3] px-3.5 py-2.5 text-sm text-[#241d18] outline-none transition placeholder:text-[#9a8f82] focus-visible:border-[#a6937c] focus-visible:ring-2 focus-visible:ring-[#a6937c]/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
