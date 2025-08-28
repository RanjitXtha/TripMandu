import React from "react";

export const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => {
  return <div className={`bg-white rounded-2xl ${className}`}>{children}</div>;
};

export const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
