import React, { useEffect } from "react";
import { X } from "lucide-react";
import SiteCard from "./SiteCard";
import CloseButton from "./ui/CloseButton";
import type { NearByDestinationType, TouristDestination } from "../types/types";
import axios from "axios";

const ShowSites = ({
  siteData,
  setNearByDestinations,
  myloc,
  onClose,
}: {
  siteData: TouristDestination;
  setNearByDestinations: React.Dispatch<
    React.SetStateAction<NearByDestinationType[]>
  >;
  myloc: { lat: number; lon: number } | null;
  onClose?: () => void;
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
      {onClose && <CloseButton onClick={onClose} />}

      <SiteCard {...siteData} />
    </div>
  );
};

export default ShowSites;
