import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export default function Input({
  error,
  label,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-base shadow-xs focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 placeholder:text-slate-400 ${
          error ? 'border-error' : ''
        } ${className}`.trim()}
        {...props}
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}
