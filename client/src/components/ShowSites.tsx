import React, { useState, type ChangeEvent } from "react";
import FilterTabs from "./FilterTabs"; // Assuming this is your custom component
import SiteCard from "./SiteCard"; // Assuming this is your custom component
import type { Site } from "../types/types";

type SiteData = {
  [place: string]: Site[];
};

const places: string[] = ["Kathmandu", "Bhaktapur", "Lalitpur"];

const siteData: SiteData = {
  Kathmandu: [
    {
      site: "Pashupatinath",
      image: "../assets/image.jpg",
      about: "Pashupatinath Temple is the oldest Hindu temple in Kathmandu...",
    },
    {
      site: "Boudhanath",
      image: "../assets/boudha.jpg",
      about: "Boudhanath is one of the largest stupas in the world...",
    },
    {
      site: "Swayambhunath",
      image: "../assets/swayambhu.jpg",
      about: "Swayambhunath Temple",
    },
  ],
  Bhaktapur: [
    {
      site: "Bhaktapur Durbar Square",
      image: "../assets/bhaktapur.jpg",
      about: "A historic palace complex filled with temples and courtyards...",
    },
  ],
  Lalitpur: [
    {
      site: "Patan Durbar Square",
      image: "../assets/patan.jpg",
      about: "Patan Durbar Square is renowned for its Newar architecture...",
    },
  ],
};

const ShowSites: React.FC = () => {
  const [selectedPlace, setSelectedPlace] = useState("Kathmandu");

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlace(e.target.value);
  };

  const sites: Site[] = siteData[selectedPlace] || [];

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
        {sites.map((site, idx) => (
          <SiteCard key={idx} {...site} />
        ))}
      </div>
    </div>
  );
};

export default ShowSites;
