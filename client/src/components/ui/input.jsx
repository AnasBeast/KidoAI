import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(
  ({ className, type, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border-2 bg-white px-4 py-2 text-base ring-offset-background transition-all duration-200",
            "placeholder:text-neutral-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-neutral-900 dark:border-neutral-700 dark:text-white",
            Icon && "pl-12",
            error
              ? "border-error-500 focus-visible:ring-error-500 focus-visible:border-error-500"
              : "border-neutral-200 hover:border-neutral-300",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

const Textarea = React.forwardRef(({ className, error, ...props }, ref) => {
  return (
    <div>
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border-2 bg-white px-4 py-3 text-base ring-offset-background transition-all duration-200",
          "placeholder:text-neutral-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-neutral-900 dark:border-neutral-700 dark:text-white",
          error
            ? "border-error-500 focus-visible:ring-error-500 focus-visible:border-error-500"
            : "border-neutral-200 hover:border-neutral-300",
          className,
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Input, Textarea };
