import React, { useState, type ChangeEvent } from "react";
import { X } from "lucide-react";
import FilterTabs from "./FilterTabs"; // Assuming this is your custom component
import SiteCard from "./SiteCard"; // Assuming this is your custom component
import type { TouristDestination } from "../types/types";

const places: string[] = ["Kathmandu", "Bhaktapur", "Lalitpur"];

const ShowSites = ({
  siteData,
  onBack,
}: {
  siteData: TouristDestination;
  onBack?: () => void;
}) => {
  const [selectedPlace, setSelectedPlace] = useState("Kathmandu");
  console.log(siteData);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlace(e.target.value);
  };

  return (
    <div className="w-[400px]">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}
      <select
        className="text-lg font-semibold px-4 py-2 outline-hidden"
        value={selectedPlace}
        id="place-select"
        title="Select a place"
        onChange={handleChange}
      >
        {places.map((place) => (
          <option key={place} value={place}>
            {place}
          </option>
        ))}
      </select>

      <div>
        <FilterTabs />
      </div>

      <div className="flex-1 p-6">
        <SiteCard {...siteData} />
      </div>
    </div>
  );
};

export default ShowSites;
