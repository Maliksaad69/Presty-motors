import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-xs font-heading font-black uppercase tracking-wider transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E10600] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#E10600] text-white shadow-xs hover:bg-[#B80500] hover:shadow-sm",
        destructive:
          "bg-[#E10600] text-white shadow-xs hover:bg-[#B80500]",
        secondary:
          "bg-[#0B0B0B] text-white shadow-xs hover:bg-[#171717] border border-[#262626]",
        outline:
          "border border-[#E2E2E2] bg-transparent text-[#0B0B0B] shadow-2xs hover:bg-[#F5F5F5] hover:border-[#0B0B0B]",
        ghost:
          "text-neutral-300 hover:text-white hover:bg-[#171717]",
        ghostLight:
          "text-neutral-700 hover:text-[#0B0B0B] hover:bg-[#F5F5F5]",
        link:
          "text-[#E10600] underline-offset-4 hover:underline p-0 h-auto font-bold normal-case",
        black:
          "bg-[#0B0B0B] text-white hover:bg-[#171717] border border-[#262626]",
        outlineWhite:
          "border border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-6 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
