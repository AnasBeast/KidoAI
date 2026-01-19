import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

const progressVariants = cva(
  "relative h-3 w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-neutral-200 dark:bg-neutral-700",
        glass: "bg-white/20 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const indicatorVariants = cva("h-full rounded-full transition-all", {
  variants: {
    color: {
      primary: "bg-gradient-to-r from-primary-500 to-primary-600",
      secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600",
      success: "bg-gradient-to-r from-success-500 to-success-600",
      warning: "bg-gradient-to-r from-warning-500 to-warning-600",
      error: "bg-gradient-to-r from-error-500 to-error-600",
      gradient:
        "bg-gradient-to-r from-primary-500 via-secondary-500 to-success-500",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

const Progress = React.forwardRef(
  (
    {
      className,
      value = 0,
      variant,
      color,
      showValue = false,
      animate = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative">
        <div
          ref={ref}
          className={cn(progressVariants({ variant }), className)}
          {...props}
        >
          {animate ? (
            <motion.div
              className={cn(indicatorVariants({ color }))}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ) : (
            <div
              className={cn(indicatorVariants({ color }))}
              style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
            />
          )}
        </div>
        {showValue && (
          <span className="absolute right-0 -top-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {Math.round(value)}%
          </span>
        )}
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };
