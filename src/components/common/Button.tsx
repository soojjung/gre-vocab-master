import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-black text-white active:bg-gray-800",
  secondary: "bg-gray-100 text-gray-900 active:bg-gray-200",
  outline: "bg-white border border-gray-200 text-gray-700 active:bg-gray-50",
  danger: "bg-white text-red-500 active:bg-red-50",
  ghost: "bg-transparent text-gray-600 active:bg-gray-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-3 text-base rounded-xl",
  lg: "py-4 text-lg rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "primary", size = "lg", fullWidth = true, children, icon, className = "", disabled, ...props }, ref) => {
  const baseStyles = "font-medium transition-colors flex items-center justify-center gap-2";
  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button ref={ref} type="button" disabled={disabled} className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
});

Button.displayName = "Button";
