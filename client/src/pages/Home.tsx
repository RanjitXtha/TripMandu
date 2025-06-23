import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import type { Location } from "../types/types";
import Header from "../components/Header";
import ShowSites from "../components/ShowSites";
import Overlay from "../components/Overlay";
import Footer from "../components/Footer";

type OverlayView = "none" | "showSites" | "routePlanner";

const touristDestinations: Location[] = [
  { name: "Pashupatinath Temple", lat: 27.710535, lon: 85.34883 },
  { name: "Swayambhunath Temple", lat: 27.714938, lon: 85.2904 },
  { name: "Kathmandu Durbar Square", lat: 27.704347, lon: 85.306735 },
];

const Home = () => {
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [clickMarkers, setClickMarkers] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">(
    "none"
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);

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
      {overlayView !== "none" && (
        <Overlay>
          {overlayView === "showSites" && <ShowSites />}
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

      <MapView
        touristDestinations={touristDestinations}
        clickMarkers={clickMarkers}
        setClickMarkers={setClickMarkers}
        destinations={destinations}
        setDestinations={setDestinations}
        markerMode={markerMode}
        setMarkerMode={setMarkerMode}
        addDestinationMode={addDestinationMode}
        myloc={myloc}
        pathCoords={pathCoords}
      />
      <Footer />
    </div>
  );
};

export default Home;
