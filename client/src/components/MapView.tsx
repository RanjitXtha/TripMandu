import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, Source, Layer } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
  Location,
  OverlayView,
  NearByDestinationType,
} from "../types/types";

import stopsData from "../data/stops_data.json";
import precomputedRoutes from "../data/routes_precomputed.json";
import type { PathSegment } from "../pages/Home";

type LocationWithTouristId = Location & { touristId?: number };

declare global {
  interface Window {
    addDest: (arg: number | [number, number]) => void;
    delDest: (index: number) => void;
    delClick: (lat: number, lon: number) => void;
  }
}

interface MapViewProps {
  touristDestinations: Location[];
  clickMarkers: Location[];
  setClickMarkers: React.Dispatch<React.SetStateAction<Location[]>>;
  destinations: LocationWithTouristId[];
  setDestinations: React.Dispatch<React.SetStateAction<Location[]>>;
  markerMode: "none" | "start" | "end";
  setMarkerMode: (mode: "none" | "start" | "end") => void;
  addDestinationMode: boolean;
  setAddDestinationMode: React.Dispatch<React.SetStateAction<boolean>>;
  myloc: { lat: number; lon: number } | null;
  pathCoords: [number, number][];
  pathSegments: PathSegment[];
  selectedMarker: number | null;
  setSelectedMarker: React.Dispatch<React.SetStateAction<number | null>>;
  setOverlayView: React.Dispatch<React.SetStateAction<OverlayView>>;
  nearByDestinations: NearByDestinationType[];
  tspOrder: number[];
  currentSegmentIndex: number;
  showAllSegments: boolean;
  fetchRecommendations: (name: string, type: 'nearby' | 'similar') => void
  mapTarget?: { lat: number; lon: number } | null;

}

const getSegmentColor = (index: number, total: number) => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#F8B739", "#52B788", "#E63946",
  ];
  if (total <= colors.length) {
    return colors[index % colors.length];
  }
  const hue = (index / total) * 360;
  return `hsl(${hue}, 75%, 55%)`;
};

const MapView = ({
  touristDestinations,
  clickMarkers,
  setClickMarkers,
  destinations,
  setDestinations,
  markerMode,
  setMarkerMode,
  addDestinationMode,
  setAddDestinationMode,
  myloc,
  pathCoords,
  pathSegments,
  selectedMarker,
  setSelectedMarker,
  setOverlayView,
  nearByDestinations,
  tspOrder,
  currentSegmentIndex,
  showAllSegments,
  fetchRecommendations,
    mapTarget

}: MapViewProps) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [showStops, setShowStops] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("empty");
  const [routeGeoJSON, setRouteGeoJSON] = useState<any[]>([]);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);

  const getDisplayNumber = (destinationIndex: number) => {
    if (tspOrder.length === 0) return destinationIndex + 1;
    const position = tspOrder.indexOf(destinationIndex);
    return position === -1 ? destinationIndex + 1 : position + 1;
  };

  useEffect(() => {
    if (!mapLoaded) return;
    const features = precomputedRoutes.map((route) => ({
      type: "Feature",
      properties: {
        id: route.id,
        name: route.name,
        lineColor: route.color || "#FF0000",
      },
      geometry: {
        type: "LineString",
        coordinates: route.geometry,
      },
    }));
    setRouteGeoJSON(features);
  }, [mapLoaded]);

  // Map click handler for setting start/end and adding destinations
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const { lat, lng } = e.lngLat;

      if (markerMode === "start") {
        // Set as start (first destination)
        setDestinations((prev) => [{ lat, lon: lng }, ...prev.slice(1)]);
        setMarkerMode("none");
      } else if (markerMode === "end") {
        // Set as end (last destination)
        setDestinations((prev) => [...prev.slice(0, -1), { lat, lon: lng }]);
        setMarkerMode("none");
      } else if (addDestinationMode) {
        // Add a click marker
        setClickMarkers((prev) => [...prev, { lat, lon: lng }]);
      }
    };

    mapRef.current.on("click", handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
      }
    };
  }, [mapLoaded, markerMode, addDestinationMode, setDestinations, setMarkerMode, setClickMarkers]);

  useEffect(() => {
    if (mapTarget && mapRef.current) {
      mapRef.current.flyTo({
        center: [mapTarget.lon, mapTarget.lat],
        zoom: 15,
        duration: 1500, // smooth animation
        essential: true
      });
    }
  }, [mapTarget]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const showTouristMarkers = pathCoords.length === 0;

    if (showTouristMarkers) {
      touristDestinations.forEach((place, index) => {
        const html = `
          <div class="w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm space-y-2 border border-gray-100">
            <h3 class="font-semibold text-base text-center text-gray-900">${place.name}</h3>
            <button id="addDestination" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium" onclick='window.addDest(${index})'>Add Destination</button>
          </div>`;
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "18px";
        el.style.height = "18px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#EF4444";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.lon, place.lat])
          .setPopup(popup)
          .addTo(mapRef.current!);
        markersRef.current.push(marker);

        marker.getElement().addEventListener("click", () => {
          mapRef.current?.flyTo({ center: [place.lon, place.lat], zoom: 15 });
          setOverlayView("showSite");

          if (place.name) {
            console.log("calling 2")
            fetchRecommendations(place.name, 'similar');
          }
          if (selectedMarker === index) {
            setSelectedMarker(null);
            setTimeout(() => setSelectedMarker(index), 0);
          } else setSelectedMarker(index);
        });
      });
    }

    clickMarkers.forEach((place) => {
      const html = `
        <div class="w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm space-y-2 border border-gray-100">
          <h3 class="font-semibold text-base text-center text-gray-900">Custom Marker</h3>
          <button class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium" onclick='window.addDest([${place.lat}, ${place.lon}])'>Add Destination</button>
          <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium" onclick='window.delClick(${place.lat}, ${place.lon})'>Delete</button>
        </div>`;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#9333EA";
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    destinations.forEach((place, i) => {
      const displayNumber = getDisplayNumber(i);
      const nameFromTourist = place.touristId !== undefined ? touristDestinations[place.touristId]?.name : place.name;

      const html = `
        <div class="w-[200px] p-3 bg-white rounded-lg shadow-lg text-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">${displayNumber}</div>
            <h3 class="font-semibold text-gray-900">Destination ${displayNumber}</h3>
          </div>
          ${nameFromTourist ? `<p class="font-medium text-gray-800 mb-2">${nameFromTourist}</p>` : ""}
          <div class="text-xs text-gray-500 mb-2">${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}</div>
          <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium" onclick='window.delDest(${i})'>Remove</button>
        </div>`;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#2563EB";
      el.style.border = "3px solid white";
      el.style.color = "white";
      el.style.fontSize = "14px";
      el.style.fontWeight = "bold";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
      el.innerText = String(displayNumber);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    if (myloc) {
      const html = `
        <div class="w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm space-y-2 border border-gray-100">
          <h3 class="font-semibold text-base text-center text-gray-900">My Location</h3>
          <button class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium" onclick='window.addDest([${myloc.lat}, ${myloc.lon}])'>Add Destination</button>
        </div>`;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);
      const marker = new maplibregl.Marker({ color: "#10B981" })
        .setLngLat([myloc.lon, myloc.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    }
  }, [
    mapLoaded,
    clickMarkers,
    destinations,
    myloc,
    tspOrder,
    pathCoords,
    touristDestinations,
  ]);

  useEffect(() => {
    window.addDest = (arg: number | [number, number]) => {
      if (typeof arg === "number") {
        const td = touristDestinations[arg];
        if (!td) return;
        setDestinations((prev) => [...prev, { lat: td.lat, lon: td.lon, touristId: arg }]);
      } else {
        setDestinations((prev) => [...prev, { lat: arg[0], lon: arg[1] }]);
      }
    };
    window.delDest = (index: number) => setDestinations((prev) => prev.filter((_, i) => i !== index));
    window.delClick = (lat: number, lon: number) =>
      setClickMarkers((prev) => prev.filter((m) => m.lat !== lat || m.lon !== lon));
  }, [touristDestinations, setDestinations, setClickMarkers]);

  // Visual cursor feedback for marker modes
  useEffect(() => {
    if (!mapRef.current) return;
    const canvas = mapRef.current.getCanvas();

    if (markerMode !== "none" || addDestinationMode) {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "";
    }
  }, [markerMode, addDestinationMode]);

  return (
    <div className="relative w-full h-screen">
      {/* Active Mode Indicator */}
      {(markerMode !== "none" || addDestinationMode) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <div className="bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 pointer-events-auto">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {markerMode === "start" && "Click map to set START location"}
            {markerMode === "end" && "Click map to set END location"}
            {addDestinationMode && markerMode === "none" && "Click map to add custom markers"}
            <button
              onClick={() => {
                setMarkerMode("none");
                setAddDestinationMode(false);
              }}
              className="ml-2 hover:bg-blue-700 rounded-full p-1 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Minimal Floating Controls Panel - Top Right */}
      <div className="absolute top-20 right-6 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={() => setControlPanelOpen(!controlPanelOpen)}
            className="bg-white hover:bg-gray-50 rounded-full shadow-lg p-3 transition-all border border-gray-200 mb-2"
            title={controlPanelOpen ? "Hide map layers" : "Show map layers"}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {controlPanelOpen && (
            <div className="bg-white rounded-xl shadow-xl p-4 w-[240px] space-y-4 border border-gray-200">
              {/* Route Selector */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Map Layers</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="empty">No Routes</option>
                  <option value="">All Routes</option>
                  {precomputedRoutes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Show Stops Toggle */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStops}
                  onChange={() => setShowStops(!showStops)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Stops</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Full Map */}
      <Map
        mapLib={maplibregl}
        initialViewState={{ latitude: 27.67, longitude: 85.43, zoom: 14 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ height: "100%", width: "100%" }}
        onLoad={({ target }) => {
          mapRef.current = target;
          setMapLoaded(true);
        }}
      >
        <NavigationControl position="top-right" />

        {/* Precomputed Routes */}
        {routeGeoJSON
          .filter((f) => selectedRouteId === "" || f.properties.id === selectedRouteId)
          .map((f, i) => (
            <Source key={i} id={`route-${i}`} type="geojson" data={f}>
              <Layer
                id={`route-line-${i}`}
                type="line"
                paint={{ "line-color": f.properties.lineColor, "line-width": 3 }}
              />
            </Source>
          ))}

        {/* Dynamic Path Segments */}
        {pathSegments.length > 0 && (
          showAllSegments ? (
            pathSegments.map((segment, i) => {
              const color = getSegmentColor(i, pathSegments.length);
              return (
                <Source key={i} id={`path-${i}`} type="geojson" data={{
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: segment.path.map(([lat, lon]) => [lon, lat]),
                  },
                }}>
                  <Layer
                    id={`outline-${i}`}
                    type="line"
                    paint={{
                      "line-color": "#fff",
                      "line-width": 7,
                      "line-opacity": 0.7,
                    }}
                  />
                  <Layer
                    id={`path-${i}`}
                    type="line"
                    paint={{
                      "line-color": color,
                      "line-width": 5,
                      "line-opacity": 1,
                    }}
                  />
                </Source>
              );
            })
          ) : (
            (() => {
              const segment = pathSegments[currentSegmentIndex];
              const color = getSegmentColor(currentSegmentIndex, pathSegments.length);
              return (
                <Source id="current-segment" type="geojson" data={{
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: segment.path.map(([lat, lon]) => [lon, lat]),
                  },
                }}>
                  <Layer
                    id="current-outline"
                    type="line"
                    paint={{
                      "line-color": "#fff",
                      "line-width": 8,
                      "line-opacity": 0.9,
                    }}
                  />
                  <Layer
                    id="current-line"
                    type="line"
                    paint={{
                      "line-color": color,
                      "line-width": 6,
                      "line-opacity": 1,
                    }}
                  />
                </Source>
              );
            })()
          )
        )}
      </Map>
    </div>
  );
};

export default MapView;