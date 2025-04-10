import React, { ReactNode } from 'react';
import classnames from 'classnames'; // For conditional classes

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={classnames(
        'bg-white rounded-lg shadow-md overflow-hidden',
        className // Allow overriding/extending classes
      )}
    >
      <div className="p-6 md:p-8">
          {children}
      </div>
    </div>
  );
};

export default Card;