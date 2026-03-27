import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition",
  {
    variants: {
      variant: {
        default: "border-amber-300/20 bg-amber-300/10 text-amber-100",
        secondary: "border-white/8 bg-white/5 text-zinc-300",
        outline: "border-white/10 bg-transparent text-zinc-300",
        success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
