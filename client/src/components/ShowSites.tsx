import React, { useEffect, useState, type ChangeEvent } from "react";
import SiteCard from "./SiteCard"; // Assuming this is your custom component
import type {  NearByDestinationType, TouristDestination } from "../types/types";
import axios from "axios";




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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        
          <SiteCard {...siteData} />
     
      </div>
    </div>
  );
};

export default ShowSites;
