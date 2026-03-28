import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition",
  {
    variants: {
      variant: {
        default: "border-[#d7cab9] bg-[#f3ece2] text-[#4e4337]",
        secondary: "border-[#d8ccbe] bg-[#f4ede3] text-[#4f453a]",
        outline: "border-[#d4c5b4] bg-[#f8f2e8] text-[#4f453a]",
        success: "border-[#bdd0c1] bg-[#edf4ef] text-[#375442]",
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
