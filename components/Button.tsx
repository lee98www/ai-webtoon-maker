import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'toon';
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
    inline-flex items-center justify-center font-bold tracking-wide
    transition-all duration-150 ease-out
    disabled:opacity-40 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-toon-500 focus:ring-offset-2
  `;

  const sizeStyles: Record<string, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-14 px-8 text-base'
  };

  const variants: Record<string, string> = {
    primary: `
      bg-ink-900 text-white border-2 border-ink-900
      shadow-toon-sm btn-toon
      hover:bg-ink-800
    `,
    secondary: `
      bg-warm-100 text-ink-800 border-2 border-ink-900
      shadow-toon-sm btn-toon
      hover:bg-warm-200
    `,
    outline: `
      bg-transparent text-ink-700 border-2 border-ink-300
      hover:border-ink-900 hover:text-ink-900
    `,
    ghost: `
      bg-transparent text-ink-500
      hover:text-ink-900 hover:bg-warm-100
    `,
    toon: `
      bg-toon-600 text-white border-2 border-ink-900
      shadow-toon-sm btn-toon
      hover:bg-toon-700
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
