import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white",
        secondary: "bg-secondary-500 text-white",
        success: "bg-success-500 text-white",
        warning: "bg-warning-500 text-white",
        error: "bg-error-500 text-white",
        outline: "border-2 border-primary-500 text-primary-500 bg-transparent",
        ghost:
          "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        gradient:
          "bg-gradient-to-r from-primary-500 to-secondary-500 text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({ className, variant, size, ...props }) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
