import { X } from "lucide-react";
import React from "react";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <button
      title="Close button"
      onClick={onClick}
      className={`absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow hover:bg-gray-100 hover:cursor-pointer ${className}`}
    >
      <X size={20} />
    </button>
  );
};

export default CloseButton;