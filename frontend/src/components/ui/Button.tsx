import React, { ReactNode } from 'react';
import classnames from 'classnames';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  size = 'md',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center border rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const variantStyles = {
    primary:
      'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 focus:ring-indigo-500',
    secondary:
      'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
    danger:
      'bg-red-600 text-white border-transparent hover:bg-red-700 focus:ring-red-500',
    success:
      'bg-green-600 text-white border-transparent hover:bg-green-700 focus:ring-green-500',
    outline:
      'bg-transparent text-indigo-600 border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
  };

  const disabledStyle = 'opacity-50 cursor-not-allowed';

  return (
    <button
      className={classnames(
        baseStyle,
        sizeStyles[size],
        variantStyles[variant],
        { [disabledStyle]: disabled || isLoading },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
