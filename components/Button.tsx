import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = `
    inline-flex items-center justify-center font-medium rounded-md
    transition-all duration-150 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2
  `;

  const sizeStyles: Record<string, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const variants: Record<string, string> = {
    primary: `
      bg-slate-900 text-white border border-slate-900
      hover:bg-slate-800
      active:bg-slate-950
    `,
    secondary: `
      bg-white text-slate-700 border border-slate-300
      hover:bg-slate-50 hover:border-slate-400
    `,
    outline: `
      bg-transparent text-slate-600 border border-slate-300
      hover:bg-slate-50 hover:text-slate-900
    `,
    ghost: `
      bg-transparent text-slate-500
      hover:text-slate-900 hover:bg-slate-100
    `,
    accent: `
      bg-accent-500 text-white border border-accent-500
      hover:bg-accent-600 hover:border-accent-600
    `
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
