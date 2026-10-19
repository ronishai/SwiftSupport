import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] shadow-sm hover:shadow focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-400 disabled:scale-100 disabled:shadow-none',
  secondary:
    'bg-white text-text-primary hover:bg-gray-50 border border-gray-200 active:scale-[0.98] shadow-xs focus:ring-2 focus:ring-gray-250 disabled:opacity-50 disabled:scale-100',
  danger: 'bg-error text-white hover:bg-red-650 active:scale-[0.98] shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-400 disabled:scale-100',
  ghost: 'text-primary-600 hover:bg-primary-50 active:scale-[0.98] disabled:opacity-50 disabled:scale-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
  md: 'px-4 py-2 text-base font-medium rounded-lg',
  lg: 'px-6 py-3 text-lg font-medium rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`transition-all duration-200 ease-in-out font-semibold focus:outline-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
