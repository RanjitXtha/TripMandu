import React, {  useState } from "react";
import { X } from "lucide-react";
import SiteCard from "./SiteCard";
import type { NearByDestinationType, TouristDestination } from "../types/types";

const PopularSites = ({
  setNearByDestinations,
  myloc,
  onBack,
  touristDestinations,
}: {
  setNearByDestinations: React.Dispatch<
    React.SetStateAction<NearByDestinationType[]>
  >;
  myloc: { lat: number; lon: number } | null;
  onBack?: () => void;
  touristDestinations: TouristDestination[];
}) => {
  // const [touristDestinations, setTouristDestinations] = useState<
  //   TouristDestination[]
  // >([]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const GetDestinations = async () => {
  //     try {
  //       const response = await fetch("/destinations.json");
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch destinations");
  //       }

  //       const destinations: TouristDestination[] = await response.json();

  //       // Optional: Extract coordinates if needed
  //       // const coords = destinations.map((d) => ({
  //       //   name: d.name,
  //       //   lat: d.coordinates?.lat,
  //       //   lon: d.coordinates?.lon,
  //       // }));

  //       setTouristDestinations(destinations);
  //     } catch (error) {
  //       console.error("Error fetching destinations:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   GetDestinations();
  // }, []);

  // useEffect(() => {
  //   const getNearByDestination = async () => {
  //     setNearByDestinations([]);

  //     try {
  //       const response = await axios.post(
  //         "http://localhost:8080/api/map/getNearByNodes",
  //         {
  //           lat: myloc?.lat,
  //           lon: myloc?.lon,
  //         }
  //       );

  //       const result = response.data.results;
  //       setNearByDestinations(result);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   getNearByDestination();
  // }, []);

  return (
    <div className="p-2 ">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {touristDestinations.map((site, index) => (
            <SiteCard key={index} {...site} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularSites;
