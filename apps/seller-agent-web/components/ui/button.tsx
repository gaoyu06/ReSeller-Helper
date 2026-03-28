import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#8b7a63]/20 text-inherit [&_a]:text-inherit",
  {
    variants: {
      variant: {
        default: "bg-[#1f1a17] text-white hover:bg-[#2a241f]",
        secondary:
          "border border-[#cabba9] bg-[#e9dfd0] text-stone-900 hover:bg-[#e0d3c1]",
        outline:
          "border border-[#d6c8b6] bg-[#f6efe5] text-stone-900 hover:bg-[#efe5d8]",
        ghost: "bg-[#f5ede2] text-stone-800 hover:bg-[#ede2d4] hover:text-stone-950",
        link: "px-0 py-0 text-stone-800 underline-offset-4 hover:underline",
        success:
          "border border-[#9bb5a4] bg-[#edf4ef] text-emerald-900 hover:bg-[#e3ede6]",
        danger:
          "border border-[#d9b7b2] bg-[#f7ebe9] text-red-900 hover:bg-[#f0dedd]",
      },
      size: {
        default: "px-4 py-2.25",
        sm: "px-3 py-1.75 text-xs",
        lg: "px-5 py-2.75",
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
        className={cn(
          buttonVariants({ variant, size }),
          "[&_a]:!text-inherit [&_span]:text-inherit",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
