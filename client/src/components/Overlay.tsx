import React from "react";

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="absolute z-50 bg-white 
      mt-4 ml-4 p-2
      rounded-3xl shadow-lg 
      overflow-auto inline-block
      transition-all duration-400 ease-in-out top-[4rem] bottom-[3rem]"
    >
      {children}
    </div>
  );
};

export default Overlay;
