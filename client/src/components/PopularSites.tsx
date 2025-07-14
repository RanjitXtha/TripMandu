import React, { useEffect, useState, type ChangeEvent } from "react";
import FilterTabs from "./FilterTabs"; // Assuming this is your custom component
import SiteCard from "./SiteCard";

const places: string[] = ["Kathmandu", "Bhaktapur", "Lalitpur"];

const PopularSites = () => {
    
      const [selectedPlace, setSelectedPlace] = useState("Kathmandu");

       const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
          setSelectedPlace(e.target.value);
        };
return (
    <div className="">
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        
          {/* <SiteCard {...siteData} /> */}
     
      </div>
    </div>
  );
}

export default PopularSites