import React from 'react';
import classnames from 'classnames';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> { // Omit 'type' as it's always 'checkbox'
  label: string; 
  error?: string;
  wrapperClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  error,
  className,
  wrapperClassName,
  disabled,
  ...props
}) => {
  const checkboxId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={classnames('mb-4', wrapperClassName)}>
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={classnames(
            'h-4 w-4 rounded border-gray-300 text-indigo-600',
            'focus:ring-indigo-500 focus:ring-offset-0 focus:ring-2', // Focus state
            { 'cursor-not-allowed opacity-50': disabled }, // Disabled state
            { 'border-red-500 ring-red-500': error }, // Error state
            className
          )}
          disabled={disabled}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={classnames(
              'ml-2 block text-sm',
              disabled ? 'text-gray-500' : 'text-gray-900',
              { 'text-red-600': error }
            )}
          >
            {label}
          </label>
        )}
      </div>
       {/* Display error message below the checkbox+label combo */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Checkbox;