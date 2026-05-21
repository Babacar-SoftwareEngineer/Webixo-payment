import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "neutral", size = "md", children, ...props }, ref) => {
    // Styles de base du badge
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-wide rounded-full text-center transition-all select-none";

    // Variantes de couleurs
    const variants = {
      brand: "bg-brand-bg text-brand-primary border border-brand-light/30",
      success: "bg-success-bg text-success-text border border-success-primary/10",
      warning: "bg-warning-bg text-warning-text border border-warning-primary/10",
      danger: "bg-danger-bg text-danger-text border border-danger-primary/10",
      info: "bg-info-bg text-info-text border border-info-primary/10",
      neutral: "bg-neutral-bg text-neutral-text border border-slate-200/50",
    };

    // Tailles
    const sizes = {
      sm: "px-2 py-0.5 text-[10px] leading-normal",
      md: "px-3 py-1 text-xs leading-normal",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
