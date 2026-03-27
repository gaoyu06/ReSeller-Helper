import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none ring-offset-black focus-visible:ring-2 focus-visible:ring-amber-300/50",
  {
    variants: {
      variant: {
        default: "bg-amber-300 text-black hover:bg-amber-200",
        secondary:
          "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
        outline:
          "border border-white/10 bg-transparent text-white hover:bg-white/[0.05]",
        ghost: "text-zinc-300 hover:bg-white/[0.05] hover:text-white",
        success:
          "border border-emerald-400/20 bg-emerald-500/10 text-emerald-50 hover:bg-emerald-500/15",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "px-3 py-2 text-xs",
        lg: "px-5 py-3",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
