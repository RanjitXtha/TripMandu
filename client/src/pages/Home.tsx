import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import type { Location ,TouristDestination ,NearByDestinationType} from "../types/types";
import Header from "../components/Header";
import ShowSites from "../components/ShowSites";
import Overlay from "../components/Overlay";
import Footer from "../components/Footer";
import Search from "../components/Search";

type OverlayView = "none" | "showSites" | "routePlanner";





const Home = () => {
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [clickMarkers, setClickMarkers] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);

  const [selectedMarker,setSelectedMarker]=  useState<null|number>(null);
  const [nearByDestinations, setNearByDestinations] = useState<NearByDestinationType[]>([]);
  const [touristDestinations,setTouristDestinations] = useState<TouristDestination[]>([]);
  const [touristDestinationsCoords,setTouristDestinationsCoords] =  useState<Location[]>([]);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">(
    "none"
  );

  useEffect(()=>{
    const GetDesinations = async()=>{
 const response = await fetch('/destinations.json');
 const destinations:TouristDestination[] = await response.json();

 const mappedDestinations:Location[] = destinations.map((destination)=>{
  return{
    name:destination.name,
    lat:destination.coordinates?.lat,
    lon:destination.coordinates?.lon
  }
 })
 console.log(destinations)
 setTouristDestinations(destinations);
 setTouristDestinationsCoords(mappedDestinations);

  
    }

    GetDesinations()
   
  },[])


  useEffect(()=>{
    if(selectedMarker===null)return

    setOverlayView('showSites');
    console.log('marker'+selectedMarker);

  },[selectedMarker])

useEffect(() => {
  if (!navigator.geolocation) return;

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      setMyloc({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    },
    (err) => {
      console.error("Error watching location:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    }
  );

  return () => {
    // Clean up when component unmounts
    navigator.geolocation.clearWatch(watchId);
  };
}, []);

  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);

   const getNearByDestination = async()=>{
        setNearByDestinations([]);

      
          const start = destinations[0];
        const end = destinations[destinations.length - 1];
          if(!start && !end){
            return
          }
          
        try{
        const response = await axios.post(
          "http://localhost:8080/api/map/getNearByNodes",
          {
            lat: end.lat,
            lon: end.lon
      
          }
        );

        const result = response.data.results;
        setNearByDestinations(result);
        }catch(err){
          console.log(err);
        }
        
    }

  useEffect(() => {
    const fetchRoute = async () => {
      if (destinations.length < 2) {
        setPathCoords([]);
        return;
      }
      setLoading(true);
      try {
        const start = destinations[0];
        const end = destinations[destinations.length - 1];
        const response = await axios.post(
          "http://localhost:8080/api/map/getRoute",
          {
            start: { lat: start.lat, lon: start.lon },
            end: { lat: end.lat, lon: end.lon },
          }
        );
        const data = response.data;
        if (!data.path || !Array.isArray(data.path)) {
          alert("Invalid route data received from server");
          setPathCoords([]);
        } else {
          setPathCoords(data.path);
            getNearByDestination();
        }
      } catch (error) {
        console.error("Request failed:", error);
        alert("Error fetching route");
        setPathCoords([]);
      } finally {
        setLoading(false);
      }
    };

   
    fetchRoute();
  
  }, [destinations]);

  return (
    <div className="flex">
      <Header onSelectView={(view) => setOverlayView(view)} />
        {/* <Search /> */}
      {overlayView !== "none" && (
        <Overlay>
          {(overlayView === "showSites" && selectedMarker!==null) && <ShowSites siteData={touristDestinations[selectedMarker]} />}
          {overlayView === "routePlanner" && (
            <RoutePlanner
              destinations={destinations}
              setDestinations={setDestinations}
              markerMode={markerMode}
              setMarkerMode={setMarkerMode}
              addDestinationMode={addDestinationMode}
              setAddDestinationMode={setAddDestinationMode}
            />
          )}
        </Overlay>
      )}
<div className="bg-green-400 h-screen w-full">
      
    
      <MapView
      
        touristDestinations={touristDestinationsCoords}
        clickMarkers={clickMarkers}
        setClickMarkers={setClickMarkers}
        destinations={destinations}
        setDestinations={setDestinations}
        markerMode={markerMode}
        setMarkerMode={setMarkerMode}
        addDestinationMode={addDestinationMode}
        myloc={myloc}
        pathCoords={pathCoords}
        setSelectedMarker={setSelectedMarker}
        nearByDestinations = {nearByDestinations}
      />
      </div>
      <Footer />
    </div>
  );
};

export default Home;