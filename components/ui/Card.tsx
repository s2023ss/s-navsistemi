
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const cardClassName = `bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`;
  return <div className={cardClassName}>{children}</div>;
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  const headerClassName = `p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 ${className}`;
  return <div className={headerClassName}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  const contentClassName = `p-4 sm:p-6 ${className}`;
  return <div className={contentClassName}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  const footerClassName = `p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 ${className}`;
  return <div className={footerClassName}>{children}</div>;
};

export default Card;
