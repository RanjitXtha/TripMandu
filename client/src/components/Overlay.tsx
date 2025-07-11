import React from "react";

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="absolute z-50 bg-white 
      mt-4 ml-4 
      rounded-3xl shadow-lg 
      overflow-auto inline-block
      transition-all duration-400 ease-in-out top-[4rem] bottom-0"
    >
      {children}
    </div>
  );
};

export default Overlay;
