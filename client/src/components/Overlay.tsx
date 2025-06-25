import React from "react";

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="absolute z-50 bg-white 
      top-1/2 transform -translate-y-1/2 mt-4 ml-4 
      rounded-3xl shadow-lg max-w-screen max-h-screen
      overflow-auto inline-block
      transition-all duration-400 ease-in-out "
    >
      {children}
    </div>
  );
};

export default Overlay;
