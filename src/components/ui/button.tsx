import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#DC2626] text-white shadow-xs hover:bg-[#B91C1C]",
        destructive:
          "bg-red-500 text-white shadow-xs hover:bg-red-600",
        outline:
          "border border-neutral-200 bg-white shadow-xs hover:bg-neutral-100 hover:text-black",
        secondary:
          "bg-neutral-100 text-neutral-900 shadow-xs hover:bg-neutral-200/80",
        ghost: "hover:bg-neutral-100 hover:text-black",
        link: "text-[#DC2626] underline-offset-4 hover:underline",
        black: "bg-black text-white hover:bg-neutral-800",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded px-3 text-[11px]",
        lg: "h-11 rounded px-6 text-sm",
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
