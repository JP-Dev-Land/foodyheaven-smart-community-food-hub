import React from 'react';
import classnames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string; // For displaying validation errors
  wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className, wrapperClassName, ...props }) => {
  const inputId = id || props.name; // id or name for label association

  return (
    <div className={classnames('mb-4', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={classnames(
          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', // Focus state
          { 'border-red-500 ring-red-500': error }, // Error state style
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;