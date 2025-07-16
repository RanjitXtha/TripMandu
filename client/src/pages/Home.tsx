import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import axios from "axios";
import type { Location, TouristDestination, NearByDestinationType } from "../types/types";
import Header from "../components/Header";
import ShowSites from "../components/ShowSites";
import Overlay from "../components/Overlay";
import Footer from "../components/Footer";
import PopularSites from "../components/PopularSites";

type OverlayView = "none" | "popularSite" | "routePlanner";

const Home = () => {
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [clickMarkers, setClickMarkers] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<null | number>(null);
  const [nearByDestinations, setNearByDestinations] = useState<NearByDestinationType[]>([]);
  const [touristDestinations, setTouristDestinations] = useState<TouristDestination[]>([]);
  const [touristDestinationsCoords, setTouristDestinationsCoords] = useState<Location[]>([]);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">("none");
  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);
  const [tspOrder, setTspOrder] = useState<number[]>([]);

  const getDistance = (a: Location, b: Location): number => {
    const R = 6371; // Earth radius in km
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const aa = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  const solveTSP = (locations: Location[]): number[] => {
    const n = locations.length;
    if (n === 0) return [];
    if (n === 1) return [0];

    const visited = new Array(n).fill(false);
    const order: number[] = [0]; // Start from first destination (index 0)
    visited[0] = true;

    let current = 0;

    // Use greedy nearest neighbor algorithm
    for (let step = 1; step < n; step++) {
      let nearest = -1;
      let minDist = Infinity;

      // Find nearest unvisited destination
      for (let i = 0; i < n; i++) {
        if (!visited[i]) {
          const dist = getDistance(locations[current], locations[i]);
          if (dist < minDist) {
            minDist = dist;
            nearest = i;
          }
        }
      }

      if (nearest !== -1) {
        visited[nearest] = true;
        order.push(nearest);
        current = nearest;
      }
    }

    // Return to starting point
    order.push(0);
    return order;
  };

  useEffect(() => {
    const GetDestinations = async () => {
      const response = await fetch("/destinations.json");
      const destinations: TouristDestination[] = await response.json();
      const coords = destinations.map((d) => ({
        name: d.name,
        lat: d.coordinates?.lat,
        lon: d.coordinates?.lon,
      }));
      setTouristDestinations(destinations);
      setTouristDestinationsCoords(coords);
    };
    GetDestinations();
  }, []);

  useEffect(() => {
    if (selectedMarker === null) return;
    setOverlayView("popularSite");
  }, [selectedMarker]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
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

    setLoading(true);
    try {
      // Solve TSP using greedy nearest neighbor algorithm
      const tspOrderResult = solveTSP(destinations);
      setTspOrder(tspOrderResult);

      let fullPath: [number, number][] = [];
      
      // Calculate route for each segment in TSP order
      for (let i = 0; i < tspOrderResult.length - 1; i++) {
        const start = destinations[tspOrderResult[i]];
        const end = destinations[tspOrderResult[i + 1]];

        const res = await axios.post("http://localhost:8080/api/map/getRoute", {
          start: { lat: start.lat, lon: start.lon },
          end: { lat: end.lat, lon: end.lon },
        });

        const legPath: [number, number][] = res.data.path;

        if (legPath && Array.isArray(legPath)) {
          if (fullPath.length > 0) legPath.shift();
          fullPath = fullPath.concat(legPath);
        } else {
          throw new Error("Invalid path data from server");
        }
      }

      setPathCoords(fullPath);
    } catch (error) {
      console.error("TSP route calculation failed", error);
      alert("Failed to calculate route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header setSelectedMarker={setSelectedMarker} onSelectView={setOverlayView} />
      <div className="flex-grow flex">
        <Overlay>
          {overlayView === "popularSite" && <PopularSites />}
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
          {selectedMarker !== null && (
            <ShowSites myloc={myloc} setNearByDestinations={setNearByDestinations} siteData={touristDestinations[selectedMarker]} />
          )}
        </Overlay>

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
            setSelectedMarker={setSelectedMarker}
            nearByDestinations={nearByDestinations}
            tspOrder={tspOrder}
          />
          {/* Calculate TSP Button */}
          <button
            disabled={loading}
            onClick={calculateTSPRoute}
            className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            {loading ? "Calculating..." : "Calculate TSP Route"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;