import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import axios from "axios";
import type {
  Location,
  TouristDestination,
  OverlayView,
  NearByDestinationType,
} from "../types/types";
import Header from "../components/Header";
import Overlay from "../components/Overlay";
import Footer from "../components/Footer";
import SiteCard from "../components/SiteCard";
import PopularSites from "../components/PopularSites";
import { getAllPoints, type Destination } from "../apiHandle/detination";

const Home = () => {
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [clickMarkers, setClickMarkers] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<null | number>(null);
  const [nearByDestinations, setNearByDestinations] = useState<
    NearByDestinationType[]
  >([]);
  const [touristDestinations, setTouristDestinations] = useState<
    Destination[]
  >([]);
  const [touristDestinationsCoords, setTouristDestinationsCoords] = useState<
    Location[]
  >([]);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">(
    "none"
  );
  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);
  const [tspOrder, setTspOrder] = useState<number[]>([]);

 
  useEffect(() => {
    const GetDestinations = async () => {
      try {
        const response = await getAllPoints();
        if (!response.success) {
          throw new Error("Failed to fetch destinations");
        }

        const destinations: Destination[] = response.data;

        console.log(destinations);

        const coords = destinations.map((d) => ({
          name: d.name,
          lat: d.lat,
          lon: d.lon,
        }));

        setTouristDestinations(destinations);
        setTouristDestinationsCoords(coords);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    GetDestinations();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    setPathCoords([]);
    setTspOrder([]);
  }, [destinations]);

  const calculateTSPRoute = async () => {
  if (destinations.length < 2) {
    alert("Please add at least two destinations");
    return;
  }

  setIsLoading(true);
  try {
    const res = await axios.post("http://localhost:8080/api/map-solveTsp", {
      destinations,
    });

    const { path, tspOrder: order } = res.data;

    if (!Array.isArray(path)) throw new Error("Invalid path");

    setTspOrder(order);
    setPathCoords(path);
  } catch (err) {
    console.error("Failed to calculate route:", err);
    alert("Failed to calculate TSP route");
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    if (selectedMarker !== null) {
      setOverlayView("showSite");
    }
  }, [selectedMarker]);

  return (
    <div className="flex">
      <Header
        setSelectedMarker={setSelectedMarker}
        onSelectView={(view) => {
          setOverlayView(view);
          if (view === "popularSite") {
            setSelectedMarker(null); // ← reset to force ShowSites
          }
        }}
      />

      {overlayView !== "none" && (
        <Overlay>
          {overlayView === "showSite" && selectedMarker !== null && (
            <SiteCard
              key={`site-${selectedMarker}`} // force remount
              {...touristDestinations[selectedMarker]}
              onBack={() => setOverlayView("none")} //  back handler
            />
          )}

          {overlayView === "popularSite" && selectedMarker === null && (
            <PopularSites
              myloc={myloc}
              setNearByDestinations={setNearByDestinations}
              onBack={() => setOverlayView("none")}
              touristDestinations={touristDestinations}
            />
          )}

          {overlayView === "routePlanner" && (
            <RoutePlanner
              destinations={destinations}
              setDestinations={setDestinations}
              markerMode={markerMode}
              setMarkerMode={setMarkerMode}
              addDestinationMode={addDestinationMode}
              setAddDestinationMode={setAddDestinationMode}
              onBack={() => setOverlayView("none")}
            />
          )}
        </Overlay>
      )}

      <div className="w-full bg-green-400 relative">
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
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          nearByDestinations={nearByDestinations}
          tspOrder={tspOrder}
          setOverlayView={setOverlayView}
        />
        {/* Calculate TSP Button */}
        <button
          disabled={isLoading}
          onClick={calculateTSPRoute}
          className="absolute top-3 right-16 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[1.2rem] shadow-lg"
        >
          {isLoading ? "Calculating..." : "Calculate Route"}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
