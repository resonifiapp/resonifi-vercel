import * as React from "react";

// tiny class joiner (no deps)
const cn = (...args) => args.filter(Boolean).join(" ");

// Simple Tailwind variants (no class-variance-authority)
const VARIANT = {
  default:
    "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-400/40",
  secondary:
    "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-400/30",
  outline:
    "border border-slate-700 text-slate-100 hover:bg-slate-800/60 focus:ring-slate-400/30",
  ghost:
    "bg-transparent text-slate-200 hover:bg-slate-800/40 focus:ring-slate-400/30",
};

const SIZE = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export const Button = React.forwardRef(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      disabled = false,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          "disabled:opacity-60 disabled:pointer-events-none",
          VARIANT[variant] || VARIANT.default,
          SIZE[size] || SIZE.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
