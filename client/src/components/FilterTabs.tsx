import React, { useState } from "react";

const tabs: string[] = ["Essentials", "Traveler's Choice", "Museums"];

const FilterTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Essentials");

  return (
    <div className="flex gap-3 px-4 pt-2 pb-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`text-sm px-4 py-2 rounded-full border transition-all font-medium ${
            activeTab === tab
              ? "bg-black text-white"
              : "bg-white text-black border-gray-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
