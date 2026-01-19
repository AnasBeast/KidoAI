import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { cardHover, cardEntrance } from "../../config/animations";

const cardVariants = cva("rounded-2xl transition-all duration-300", {
  variants: {
    variant: {
      default:
        "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
      elevated:
        "bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-900/50",
      glass: "bg-white/10 backdrop-blur-xl border border-white/20",
      gradient:
        "bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20",
      outlined:
        "bg-transparent border-2 border-neutral-200 dark:border-neutral-700",
      filled: "bg-neutral-100 dark:bg-neutral-800",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const Card = React.forwardRef(
  (
    { className, variant, animate = false, hover = false, children, ...props },
    ref,
  ) => {
    const MotionComponent = animate || hover ? motion.div : "div";

    const motionProps =
      animate || hover
        ? {
            variants: hover ? cardHover : cardEntrance,
            initial: animate ? "initial" : "rest",
            animate: animate ? "animate" : undefined,
            whileHover: hover ? "hover" : undefined,
            whileTap: hover ? "tap" : undefined,
          }
        : {};

    return (
      <MotionComponent
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...motionProps}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  },
);

Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-none tracking-tight text-neutral-900 dark:text-white",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500 dark:text-neutral-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
