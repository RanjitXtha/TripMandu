import React, { useEffect } from "react";
import { X } from "lucide-react";
import SiteCard from "./SiteCard";
import type { NearByDestinationType, TouristDestination } from "../types/types";
import axios from "axios";

const ShowSites = ({
  siteData,
  setNearByDestinations,
  myloc,
  onBack,
}: {
  siteData: TouristDestination;
  setNearByDestinations: React.Dispatch<
    React.SetStateAction<NearByDestinationType[]>
  >;
  myloc: { lat: number; lon: number } | null;
  onBack?: () => void;
}) => {
  console.log(siteData);

  useEffect(() => {
    const getNearByDestination = async () => {
      setNearByDestinations([]);

      try {
        const response = await axios.post(
          "http://localhost:8080/api/map/getNearByNodes",
          {
            lat: myloc?.lat,
            lon: myloc?.lon,
          }
        );

        const result = response.data.results;
        setNearByDestinations(result);
      } catch (err) {
        console.log(err);
      }
    };

    getNearByDestination();
  }, []);

  

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
      {/* <select
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
      </select> */}
      <SiteCard {...siteData} />
    </div>
  );
};

export default ShowSites;
