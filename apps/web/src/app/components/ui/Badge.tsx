import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'primary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800 border border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  error: 'bg-red-100 text-red-800 border border-red-300',
  info: 'bg-blue-100 text-blue-800 border border-blue-300',
  primary: 'bg-primary-100 text-primary-900 border border-primary-300',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs font-medium rounded',
  md: 'px-3 py-1.5 text-sm font-medium rounded',
};

export default function Badge({
  children,
  variant = 'info',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-block ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
