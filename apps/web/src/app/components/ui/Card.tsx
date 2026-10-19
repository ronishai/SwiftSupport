import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md/50 transition-all duration-300 p-6 md:p-8 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
