import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import RouteSequenceModal from "../components/RouteSequenceModal";
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
import { Bike, Car, Footprints } from "lucide-react";

export interface PathSegment {
  path: [number, number][];
  cost: number;
  distance: number;
  fromIndex: number;
  toIndex: number;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

const Home = () => {
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [clickMarkers, setClickMarkers] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<null | number>(null);
  const [nearByDestinations, setNearByDestinations] = useState<NearByDestinationType[]>([]);
  const [touristDestinations, setTouristDestinations] = useState<TouristDestination[]>([]);
  const [touristDestinationsCoords, setTouristDestinationsCoords] = useState<Location[]>([]);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">("none");
  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [tspOrder, setTspOrder] = useState<number[]>([]);
  const [mode, setMode] = useState<"foot" | "motorbike" | "car">("foot");
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showAllSegments, setShowAllSegments] = useState(true);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const GetDestinations = async () => {
      try {
        const response = await fetch("/destinations.json");
        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }
        const touristDestinations: TouristDestination[] = await response.json();
        const coords = touristDestinations.map((d) => ({
          name: d.name,
          lat: d.coordinates?.lat,
          lon: d.coordinates?.lon,
        }));
        setTouristDestinations(touristDestinations);
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
      (pos) => setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    setPathCoords([]);
    setPathSegments([]);
    setTspOrder([]);
    setCurrentSegmentIndex(0);
  }, [destinations]);

  const calculateTSPRoute = async () => {
    if (destinations.length < 2) {
      alert("Please add at least two destinations");
      return;
    }
    setIsLoading(true);
    const updatedDestinations = destinations.map((d: any) => ({
      lat: Number(d.lat),
      lon: Number(d.lon)
    }));
    try {
      const res = await axios.post("http://localhost:8080/api/map/solveTsp", {
        destinations: updatedDestinations,
        mode,
        costType: "time"
      });
      const { path, segments, tspOrder: order, totalCost, totalDistance } = res.data;
      setTotalCost(totalCost);
      setTotalDistance(totalDistance);
      if (!Array.isArray(path)) throw new Error("Invalid path");
      if (!Array.isArray(segments)) throw new Error("Invalid segments");
      setTspOrder(order);
      setPathCoords(path);
      setPathSegments(segments);
      setCurrentSegmentIndex(0);
      setShowAllSegments(true);
      setShowRouteModal(true);
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Header
        setSelectedMarker={setSelectedMarker}
        onSelectView={(view) => {
          setOverlayView(view);
          if (view === "popularSite") {
            setSelectedMarker(null);
          }
        }}
      />

      {overlayView !== "none" && (
        <Overlay>
          {overlayView === "showSite" && selectedMarker !== null && (
            <SiteCard
              key={`site-${selectedMarker}`}
              {...touristDestinations[selectedMarker]}
              onBack={() => setOverlayView("none")}
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

      {showRouteModal && pathSegments.length > 0 && (
        <RouteSequenceModal
          segments={pathSegments}
          destinations={destinations}
          touristDestinations={touristDestinationsCoords}
          tspOrder={tspOrder}
          totalDistance={totalDistance || 0}
          totalCost={totalCost || 0}
          onClose={() => setShowRouteModal(false)}
          currentSegmentIndex={currentSegmentIndex}
          setCurrentSegmentIndex={setCurrentSegmentIndex}
          showAllSegments={showAllSegments}
          setShowAllSegments={setShowAllSegments}
        />
      )}

      <div className="flex-1 relative">
        <MapView
          touristDestinations={touristDestinationsCoords}
          clickMarkers={clickMarkers}
          setClickMarkers={setClickMarkers}
          destinations={destinations}
          setDestinations={setDestinations}
          markerMode={markerMode}
          setMarkerMode={setMarkerMode}
          addDestinationMode={addDestinationMode}
          setAddDestinationMode={setAddDestinationMode}
          myloc={myloc}
          pathCoords={pathCoords}
          pathSegments={pathSegments}
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          nearByDestinations={nearByDestinations}
          tspOrder={tspOrder}
          setOverlayView={setOverlayView}
          currentSegmentIndex={currentSegmentIndex}
          showAllSegments={showAllSegments}
        />
        
        {/* Compact Floating Control Panel */}
        <div className="absolute top-6 left-6 z-[999] pointer-events-none">
          <div className="pointer-events-auto">
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="mb-3 bg-white hover:bg-gray-50 rounded-full shadow-lg p-3 transition-all border border-gray-200"
              title={showControls ? "Hide controls" : "Show controls"}
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showControls ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Collapsible Controls */}
            {showControls && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Transport Mode - Compact Pills */}
                <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex gap-1">
                  {(["foot", "motorbike", "car"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`p-2.5 rounded-full transition-all ${
                        mode === m
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title={m.charAt(0).toUpperCase() + m.slice(1)}
                    >
                      {m === "foot" && (
                       <Footprints />
                      )}
                      {m === "motorbike" && (
                        <Bike />
                      )}
                      {m === "car" && (
                       <Car />
                      )}
                    </button>
                  ))}
                </div>

                {/* Action Buttons - Stacked */}
                {destinations.length >= 2 && (
                  <button
                    disabled={isLoading}
                    onClick={calculateTSPRoute}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border border-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>Calculate Route</span>
                      </>
                    )}
                  </button>
                )}

                {pathSegments.length > 0 && (
                  <button
                    onClick={() => setShowRouteModal(true)}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>View Route</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Minimal Trip Summary - Bottom */}
        {tspOrder.length > 0 && totalCost !== null && totalDistance !== null && !showRouteModal && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-5 py-2.5 flex items-center gap-3 border border-gray-200/50 pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">{formatDuration(totalCost)}</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">{totalDistance.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;