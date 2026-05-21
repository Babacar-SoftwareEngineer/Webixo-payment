"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Styles de base du bouton
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    // Variantes de styles
    const variants = {
      primary:
        "bg-brand-primary text-white hover:bg-brand-hover shadow-sm shadow-brand-primary/10 focus:ring-brand-primary/40",
      secondary:
        "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 focus:ring-slate-300/40",
      outline:
        "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200/40",
      ghost:
        "text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200/40",
      danger:
        "bg-danger-primary text-white hover:bg-red-600 shadow-sm shadow-danger-primary/10 focus:ring-danger-primary/40",
    };

    // Tailles de styles
    const sizes = {
      sm: "px-3 py-1.5 text-xs sm:text-sm gap-1.5",
      md: "px-4.5 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-sm sm:text-base gap-2.5 rounded-3xl",
    };

    const isBtnDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isBtnDisabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <Loader2 className="animate-spin -ml-1 mr-2" size={size === "sm" ? 14 : 16} />
        )}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
