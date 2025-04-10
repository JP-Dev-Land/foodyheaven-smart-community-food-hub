import React from 'react';
import classnames from 'classnames';

// Extend standard textarea attributes
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  error,
  className,
  wrapperClassName,
  ...props 
}) => {
  const textareaId = id || props.name;

  return (
    <div className={classnames('mb-4', wrapperClassName)}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={classnames(
          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', // Focus state 
          { 'border-red-500 ring-red-500': error }, // Error state 
          'placeholder-gray-400',
          'min-h-[80px]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Textarea;