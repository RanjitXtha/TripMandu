import React, { useEffect, useState, type ChangeEvent } from "react";
import FilterTabs from "./FilterTabs"; // Assuming this is your custom component
import SiteCard from "./SiteCard"; // Assuming this is your custom component
import type {  NearByDestinationType, TouristDestination } from "../types/types";
import axios from "axios";


const places: string[] = ["Kathmandu", "Bhaktapur", "Lalitpur"];


const ShowSites = ({siteData , setNearByDestinations, myloc}:{ siteData: TouristDestination , 
  setNearByDestinations:React.Dispatch<React.SetStateAction<NearByDestinationType[]>> ,
  myloc:{ lat: number, lon: number } | null
}) => {
  const [selectedPlace, setSelectedPlace] = useState("Kathmandu");
  console.log(siteData)

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlace(e.target.value);
  };

  useEffect(()=>{

   const getNearByDestination = async()=>{
    
        setNearByDestinations([]);

        try{
        const response = await axios.post(
          "http://localhost:8080/api/map/getNearByNodes",
          {
            lat: myloc?.lat,
            lon: myloc?.lon
      
          }
        );

        const result = response.data.results;
        setNearByDestinations(result);
        }catch(err){
          console.log(err);
        }
        
    }

    getNearByDestination();
  },[])


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
        
          <SiteCard {...siteData} />
     
      </div>
    </div>
  );
};

export default ShowSites;
