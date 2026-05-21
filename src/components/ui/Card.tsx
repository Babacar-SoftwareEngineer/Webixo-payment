import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm hover:border-slate-200/60 ${
          interactive ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer" : ""
        } transition-all duration-300 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-6 ${className}`} {...props}>
        {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
        {description && <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>}
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props}>
        {children}
      </div>
    );
  }
);
CardBody.displayName = "CardBody";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mt-6 pt-4 border-t border-slate-50 flex items-center justify-end ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
CardFooter.displayName = "CardFooter";
