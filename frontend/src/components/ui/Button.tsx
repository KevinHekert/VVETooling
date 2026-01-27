'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button Component - Based on docs/ui/components/buttons.md
 * 
 * Reusable button component with consistent styling across the application.
 * Implements all documented variants, states, and accessibility requirements.
 * 
 * Variants:
 * - Primary: primary actions (save, add)
 * - Secondary: alternative actions (cancel, back)
 * - Destructive: risky actions (delete)
 * - Ghost: low priority actions (details, edit)
 * 
 * States:
 * - Default, Hover, Focus, Active, Disabled, Loading
 * 
 * Accessibility:
 * - Keyboard navigable
 * - aria-disabled for disabled state
 * - aria-busy for loading state
 * - Focus ring visible (ring-2)
 */

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Icon to show before label */
  leftIcon?: ReactNode;
  /** Icon to show after label */
  rightIcon?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-blue-600 text-white
    hover:bg-blue-700 hover:shadow-sm
    active:bg-blue-800
    focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
    disabled:bg-gray-300 disabled:text-gray-400
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-300
    hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm
    active:bg-gray-100
    focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
    disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200
  `,
  destructive: `
    bg-red-600 text-white
    hover:bg-red-700 hover:shadow-sm
    active:bg-red-800
    focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2
    disabled:bg-gray-300 disabled:text-gray-400
  `,
  ghost: `
    bg-transparent text-gray-700
    hover:bg-gray-100
    active:bg-gray-200
    focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
    disabled:text-gray-400
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8 min-h-[32px]',
  md: 'px-4 py-2 text-sm h-10 min-h-[40px]',
  lg: 'px-5 py-2.5 text-base h-12 min-h-[48px]',
};

/**
 * Loading spinner component
 */
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin w-4 h-4 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
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
  );
}

/**
 * Button component with forwardRef for full ref support
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-lg
          transition-colors duration-150
          cursor-pointer
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'cursor-not-allowed' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {isLoading && <Spinner />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

/**
 * Icon Button component for icon-only buttons
 * Requires aria-label for accessibility
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  /** Icon element */
  icon: ReactNode;
  /** Required label for screen readers */
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, size = 'md', className = '', ...props }, ref) {
    const iconSizeClasses: Record<ButtonSize, string> = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2',
      lg: 'w-12 h-12 p-2.5',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={`${iconSizeClasses[size]} ${className}`}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

export default Button;
