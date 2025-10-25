import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, Source, Layer } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
  Location,
  OverlayView,
  NearByDestinationType,
  TouristDestination,
} from "../types/types";

import stopsData from "../data/stops_data.json";
import precomputedRoutes from "../data/routes_precomputed.json";
import type { PathSegment } from "../pages/Home";

declare global {
  interface Window {
    addDest: (arg: number | [number, number]) => void;
    delDest: (index: number) => void;
    delClick: (lat: number, lon: number) => void;
  }
}

interface MapViewProps {
  touristDestinations: TouristDestination[];
  clickMarkers: Location[];
  setClickMarkers: React.Dispatch<React.SetStateAction<Location[]>>;
  destinations: Location[];
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
  fetchRecommendations: (name: string, type: "nearby" | "similar") => void;
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
  mapTarget,
}: MapViewProps) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("empty");

  const getDisplayNumber = (destinationIndex: number) => {
    if (tspOrder.length === 0) return destinationIndex + 1;
    const position = tspOrder.indexOf(destinationIndex);
    return position === -1 ? destinationIndex + 1 : position + 1;
  };

  // 🟢 Map click (add custom or start/end markers)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const { lat, lng } = e.lngLat;

      if (markerMode === "start") {
        const existingDest = destinations[0];
        setDestinations((prev) => [
          {
            ...existingDest,
            lat,
            lon: lng,
            name: existingDest?.name || "Start Location"
          },
          ...prev.slice(1)
        ]);
        setMarkerMode("none");
      } else if (markerMode === "end") {
        const existingDest = destinations[destinations.length - 1];
        setDestinations((prev) => [
          ...prev.slice(0, -1),
          {
            ...existingDest,
            lat,
            lon: lng,
            name: existingDest?.name || "End Location"
          }
        ]);
        setMarkerMode("none");
      } else if (addDestinationMode) {
        setClickMarkers((prev) => [
          ...prev,
          { id: `custom-${Date.now()}`, name: `Custom Marker ${prev.length + 1}`, lat, lon: lng },
        ]);
      }
    };

    mapRef.current.on("click", handleMapClick);
    return () => mapRef.current?.off("click", handleMapClick);
  }, [mapLoaded, markerMode, addDestinationMode, setDestinations, setMarkerMode, setClickMarkers]);

  // 🟢 Camera fly animation
  useEffect(() => {
    if (mapTarget && mapRef.current) {
      mapRef.current.flyTo({
        center: [mapTarget.lon, mapTarget.lat],
        zoom: 15,
        duration: 1500,
        essential: true,
      });
    }
  }, [mapTarget]);

  // 🟢 Draw all markers and popups
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const showTouristMarkers = pathCoords.length === 0;

    if (showTouristMarkers) {
      touristDestinations.forEach((place, index) => {
        const html = `
          <div class="w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm border border-gray-100">
            <h3 class="font-semibold text-base text-center">${place.name}</h3>
            <button class="w-full bg-blue-600 text-white rounded px-3 py-2 mt-2"
              onclick='window.addDest(${index})'>Add Destination</button>
          </div>`;
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

        const el = document.createElement("div");
        Object.assign(el.style, {
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#EF4444",
          border: "2px solid white",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.coordinates.lon, place.coordinates.lat])
          .setPopup(popup)
          .addTo(mapRef.current!);
        markersRef.current.push(marker);

        marker.getElement().addEventListener("click", () => {
          mapRef.current?.flyTo({
            center: [place.coordinates.lon, place.coordinates.lat],
            zoom: 15,
          });
          setOverlayView("showSite");
          fetchRecommendations(place.name, "similar");
          setSelectedMarker(selectedMarker === index ? null : index);
        });
      });
    }

    // 🟣 Custom click markers
    clickMarkers.forEach((place) => {
      const html = `
        <div class="w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm border border-gray-100">
          <h3 class="font-semibold text-base text-center">${place.name || "Custom Marker"}</h3>
          <button class="w-full bg-blue-600 text-white rounded px-3 py-2 mt-2"
            onclick='window.addDest([${place.lat}, ${place.lon}])'>Add Destination</button>
          <button class="w-full bg-red-600 text-white rounded px-3 py-2 mt-2"
            onclick='window.delClick(${place.lat}, ${place.lon})'>Delete</button>
        </div>`;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#9333EA",
        border: "2px solid white",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // 🟢 Destination markers
    destinations.forEach((place, i) => {
      const displayNumber = getDisplayNumber(i);
      const html = `
        <div class="w-[200px] p-3 bg-white rounded-lg shadow-lg text-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">${displayNumber}</div>
            <h3 class="font-semibold text-gray-900">${place.name || `Destination ${displayNumber}`}</h3>
          </div>
          <div class="text-xs text-gray-500 mb-2">${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}</div>
          <button class="w-full bg-red-600 text-white rounded px-3 py-2" onclick='window.delDest(${i})'>Remove</button>
        </div>`;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "#2563EB",
        border: "3px solid white",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      });
      el.innerText = String(displayNumber);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // 🟢 My location marker
    if (myloc) {
      const html = `
        <div class="w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm border border-gray-100">
          <h3 class="font-semibold text-base text-center">My Location</h3>
          <button class="w-full bg-blue-600 text-white rounded px-3 py-2 mt-2"
            onclick='window.addDest([${myloc.lat}, ${myloc.lon}])'>Add Destination</button>
        </div>`;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);
      const marker = new maplibregl.Marker({ color: "#10B981" })
        .setLngLat([myloc.lon, myloc.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    }
  }, [mapLoaded, clickMarkers, destinations, myloc, tspOrder, pathCoords, touristDestinations]);

  // 🟢 Global helpers (patched to include name/id)
  useEffect(() => {
    window.addDest = (arg: number | [number, number]) => {
      if (typeof arg === "number") {
        const td = touristDestinations[arg];
        if (!td) return;
        setDestinations((prev) => [
          ...prev,
          {
            id: td.id,
            name: td.name,
            lat: td.coordinates.lat,
            lon: td.coordinates.lon,
            touristId: arg,
          },
        ]);
      } else {
        const [lat, lon] = arg;
        setDestinations((prev) => [
          ...prev,
          {
            id: `custom-${Date.now()}`,
            name: `Custom Location ${prev.length + 1}`,
            lat,
            lon,
          },
        ]);
      }
    };

    window.delDest = (index: number) =>
      setDestinations((prev) => prev.filter((_, i) => i !== index));

    window.delClick = (lat: number, lon: number) =>
      setClickMarkers((prev) => prev.filter((m) => m.lat !== lat || m.lon !== lon));
  }, [touristDestinations, setDestinations, setClickMarkers]);

  // 🟢 Cursor feedback
  useEffect(() => {
    if (!mapRef.current) return;
    const canvas = mapRef.current.getCanvas();
    if (markerMode !== "none" || addDestinationMode)
      canvas.style.cursor = "crosshair";
    else canvas.style.cursor = "";
  }, [markerMode, addDestinationMode]);

  return (
    <div className="relative w-full h-screen">
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

        {/* Path segments (as before) */}
        {pathSegments.length > 0 &&
          (showAllSegments
            ? pathSegments.map((segment, i) => {
              const color = getSegmentColor(i, pathSegments.length);
              return (
                <Source
                  key={i}
                  id={`path-${i}`}
                  type="geojson"
                  data={{
                    type: "Feature",
                    geometry: {
                      type: "LineString",
                      coordinates: segment.path.map(([lat, lon]) => [lon, lat]),
                    },
                  }}
                >
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
                    }}
                  />
                </Source>
              );
            })
            : (() => {
              const segment = pathSegments[currentSegmentIndex];
              const color = getSegmentColor(currentSegmentIndex, pathSegments.length);
              return (
                <Source
                  id="current-segment"
                  type="geojson"
                  data={{
                    type: "Feature",
                    geometry: {
                      type: "LineString",
                      coordinates: segment.path.map(([lat, lon]) => [lon, lat]),
                    },
                  }}
                >
                  <Layer
                    id="current-outline"
                    type="line"
                    paint={{
                      "line-color": "#fff",
                      "line-width": 8,
                    }}
                  />
                  <Layer
                    id="current-line"
                    type="line"
                    paint={{
                      "line-color": color,
                      "line-width": 6,
                    }}
                  />
                </Source>
              );
            })())}
      </Map>
    </div>
  );
};

export default MapView;
