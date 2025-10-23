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
  if (total <= colors.length) return colors[index % colors.length];
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
  const markersRef = useRef<{ marker: maplibregl.Marker; index: number }[]>([]);
  const clickMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Separate effect to update marker colors and handle selected marker popup
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    markersRef.current.forEach(({ marker, index }) => {
      const isActive = selectedMarker === index;
      const el = marker.getElement();
      
      // Update marker color
      el.style.backgroundColor = isActive ? "#10B981" : "#EF4444";
      
      // Handle popup for active marker
      if (isActive) {
        if (!marker.getPopup().isOpen()) {
          marker.togglePopup();
          mapRef.current?.flyTo({
            center: marker.getLngLat(),
            zoom: 15,
          });
        }
      } else {
        if (marker.getPopup().isOpen()) {
          marker.togglePopup();
        }
      }
    });
  }, [selectedMarker, mapLoaded]);

  // Create markers only when tourist destinations or path changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Remove old tourist markers
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    const showTouristMarkers = pathCoords.length === 0;

    if (showTouristMarkers) {
      touristDestinations.forEach((place, index) => {
        const popupNode = document.createElement("div");
        popupNode.className = "popup-content w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm space-y-2 border border-gray-100";
        popupNode.innerHTML = `
          <h3 class="font-semibold text-base text-center text-gray-900">${place.name}</h3>
          <button class="add-destination-btn w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium">
            Add Destination
          </button>
        `;

        const popup = new maplibregl.Popup({ offset: 25, closeButton: true, closeOnClick: false })
          .setDOMContent(popupNode);

        const el = document.createElement("div");
        el.className = "custom-marker";
        Object.assign(el.style, {
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#EF4444",
          border: "2px solid white",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s",
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.coordinates.lon, place.coordinates.lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        // Add destination button inside popup
        popupNode.querySelector(".add-destination-btn")?.addEventListener("click", () => {
          setDestinations((prev) => [...prev, { lat: place.coordinates.lat, lon: place.coordinates.lon }]);
          popup.remove();
        });

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setOverlayView("showSite");
          if (place.name) fetchRecommendations(place.name, "similar");
          setSelectedMarker(index);
        });

        // Handle popup close
        popup.on('close', () => {
          if (selectedMarker === index) {
            setSelectedMarker(null);
          }
        });

        markersRef.current.push({ marker, index });
      });
    }
  }, [mapLoaded, pathCoords, touristDestinations.length]);

  // Create click markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Remove old click markers
    clickMarkersRef.current.forEach((m) => m.remove());
    clickMarkersRef.current = [];

    clickMarkers.forEach((place) => {
      const popupNode = document.createElement("div");
      popupNode.className = "popup-content w-[180px] p-3 bg-white rounded-lg shadow-lg text-sm space-y-2 border border-gray-100";
      popupNode.innerHTML = `
        <h3 class="font-semibold text-base text-center text-gray-900">Custom Marker</h3>
        <button class="add-destination-btn w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium">
          Add Destination
        </button>
        <button class="delete-marker-btn w-full bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm px-3 py-2 transition font-medium mt-2">
          Delete
        </button>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupNode);

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#9333EA",
        border: "2px solid white",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      popupNode.querySelector(".add-destination-btn")?.addEventListener("click", () => {
        setDestinations((prev) => [...prev, { lat: place.lat, lon: place.lon }]);
        popup.remove();
      });
      popupNode.querySelector(".delete-marker-btn")?.addEventListener("click", () => {
        setClickMarkers((prev) => prev.filter((m) => m.lat !== place.lat || m.lon !== place.lon));
        popup.remove();
      });

      clickMarkersRef.current.push(marker);
    });
  }, [mapLoaded, clickMarkers]);

  useEffect(() => {
    if (!mapRef.current) return;
    const canvas = mapRef.current.getCanvas();
    canvas.style.cursor = markerMode !== "none" || addDestinationMode ? "crosshair" : "";
  }, [markerMode, addDestinationMode]);

  useEffect(() => {
    window.addDest = (arg: number | [number, number]) => {
      if (typeof arg === "number") {
        const td = touristDestinations[arg];
        if (!td) return;
        setDestinations((prev) => [...prev, { lat: td.coordinates.lat, lon: td.coordinates.lon }]);
      } else {
        setDestinations((prev) => [...prev, { lat: arg[0], lon: arg[1] }]);
      }
    };
    window.delDest = (index: number) =>
      setDestinations((prev) => prev.filter((_, i) => i !== index));
    window.delClick = (lat: number, lon: number) =>
      setClickMarkers((prev) => prev.filter((m) => m.lat !== lat || m.lon !== lon));
  }, [touristDestinations]);

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

        {pathSegments.length > 0 &&
          (showAllSegments ? (
            pathSegments.map((segment, i) => {
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
          ))}
      </Map>
    </div>
  );
};

export default MapView;