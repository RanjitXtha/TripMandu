import React from "react";

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="absolute z-50 bg-white top-1/2 transform -translate-y-1/2 mt-4 ml-4 h-3/4 w-1/3 rounded-2xl shadow-lg overflow-hidden">
      {children}
    </div>
  );
};

export default Overlay;
