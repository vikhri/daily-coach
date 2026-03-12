import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50",
        variant === "primary" && "bg-accent text-white shadow-sm",
        variant === "secondary" && "bg-accentSoft text-accent",
        variant === "ghost" && "bg-transparent text-ink",
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
