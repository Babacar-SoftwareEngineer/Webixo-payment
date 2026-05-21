import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      error,
      leftIcon,
      rightIcon,
      containerClassName = "",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none"
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-400 pointer-events-none select-none">
              {leftIcon}
            </span>
          )}
          
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full py-2.5 rounded-2xl text-sm bg-slate-50 border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : "px-4"
            } ${rightIcon ? "pr-10" : "px-4"} ${
              error
                ? "border-danger-primary focus:ring-danger-primary/20 focus:border-danger-primary"
                : "border-slate-200 hover:border-slate-300 focus:ring-brand-primary/20 focus:border-brand-primary"
            } ${className}`}
            {...props}
          />
          
          {rightIcon && (
            <span className="absolute right-3.5 text-slate-400 pointer-events-none select-none">
              {rightIcon}
            </span>
          )}
        </div>
        
        {error && (
          <span className="text-xs font-semibold text-danger-primary animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
