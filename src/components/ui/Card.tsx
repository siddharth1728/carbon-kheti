import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-[#2d6a4f]/40' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
