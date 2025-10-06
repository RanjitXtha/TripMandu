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
  myloc: { lat: number; lon: number } | null;
  pathCoords: [number, number][];
  selectedMarker: number | null;
  setSelectedMarker: React.Dispatch<React.SetStateAction<number | null>>;
  setOverlayView: React.Dispatch<React.SetStateAction<OverlayView>>;
  nearByDestinations: NearByDestinationType[];
  tspOrder: number[];
}

const MapView = ({
  touristDestinations,
  clickMarkers,
  setClickMarkers,
  destinations,
  setDestinations,
  markerMode,
  setMarkerMode,
  addDestinationMode,
  myloc,
  pathCoords,
  selectedMarker,
  setSelectedMarker,
  setOverlayView,
  nearByDestinations,
  tspOrder,
}: MapViewProps) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [showStops, setShowStops] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [routeGeoJSON, setRouteGeoJSON] = useState<any[]>([]);

  const getDisplayNumber = (destinationIndex: number) => {
    if (tspOrder.length === 0) return destinationIndex + 1;
    const position = tspOrder.indexOf(destinationIndex);
    return position === -1 ? destinationIndex + 1 : position + 1;
  };

  // Convert precomputed routes into GeoJSON
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

  // Add/remove markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const showTouristMarkers = pathCoords.length === 0;

    // Tourist markers
    if (showTouristMarkers) {
      touristDestinations.forEach((place, index) => {
        const html = `
          <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm space-y-2">
            <h3 class="font-semibold text-lg text-center">${place.name}</h3>
            <button id="addDestination" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] shadow-lg mb-0 px-2 py-2 transition cursor-pointer" onclick='window.addDest(${index})'>Add Destination</button><br/>
          </div>`;
        const popup = new maplibregl.Popup({ offset: 25, closeButton: true }).setHTML(html);

        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "tomato";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.lon, place.lat])
          .setPopup(popup)
          .addTo(mapRef.current!);
        markersRef.current.push(marker);

        marker.getElement().addEventListener("click", () => {
          const map = mapRef.current;
          if (map) map.flyTo({ center: [place.lon, place.lat], zoom: 15 });
          setOverlayView("showSite");
          if (selectedMarker === index) {
            setSelectedMarker(null);
            setTimeout(() => setSelectedMarker(index), 0);
          } else setSelectedMarker(index);
        });
      });
    }

    // Click markers
    clickMarkers.forEach((place) => {
      const html = `
      <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm space-y-2">
        <h3 class="font-semibold text-lg text-center">Custom Marker</h3>
        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] shadow-lg mb-2 px-2 py-2 transition cursor-pointer" onclick='window.addDest([${place.lat}, ${place.lon}])'>Add Destination</button><br/>
        <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded-[1.2rem] shadow-lg mb-0  px-2 py-2 transition cursor-pointer"  onclick='window.delClick(${place.lat}, ${place.lon})'>Delete</button>
      </div>`;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "purple";
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Destination markers
    destinations.forEach((place, i) => {
      const displayNumber = getDisplayNumber(i);
      const nameFromTourist =
        place.touristId !== undefined ? touristDestinations[place.touristId]?.name : place.name;

      const html = `
      <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm">
        <h3 class="font-semibold underline text-md text-center">Destination ${displayNumber}</h3>
        ${nameFromTourist ? `<p class="font-bold text-md text-center">${nameFromTourist}</p>` : ""}
        <div class="text-center">${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}</div>
        <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded-[1.2rem] shadow-lg mb-0 mt-1 px-2 py-2 transition cursor-pointer" onclick='window.delDest(${i})'>Remove</button><br/>
      </div>`;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "28px";
      el.style.height = "28px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#0074D9";
      el.style.border = "2px solid white";
      el.style.color = "white";
      el.style.fontSize = "12px";
      el.style.fontWeight = "bold";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.innerText = String(displayNumber);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // My location marker
    if (myloc) {
      const popupId = "my-location-add-btn";
      const html = `
      <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm space-y-2">
        <h3 class="font-semibold text-lg text-center">My Location</h3><br/>
        <button id="${popupId}" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] shadow-lg mb-0 px-2 py-2 transition cursor-pointer">Add Destination</button>
      </div>`;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);
      const marker = new maplibregl.Marker({ color: "green" })
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

  // Map click handlers
  useEffect(() => {
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const latlng: [number, number] = [e.lngLat.lat, e.lngLat.lng];
      if (markerMode === "start") {
        setDestinations((prev) => [{ lat: latlng[0], lon: latlng[1] }, ...prev.slice(1)]);
        setMarkerMode("none");
      } else if (markerMode === "end") {
        setDestinations((prev) => [...prev.slice(0, -1), { lat: latlng[0], lon: latlng[1] }]);
        setMarkerMode("none");
      } else if (addDestinationMode) {
        setClickMarkers((prev) => [...prev, { lat: latlng[0], lon: latlng[1] }]);
      }
    };
    const map = mapRef.current;
    if (map) {
      map.on("click", handleClick);
      return () => map.off("click", handleClick);
    }
  }, [markerMode, addDestinationMode, setClickMarkers, setMarkerMode]);

  // Global window functions
  useEffect(() => {
    window.addDest = (arg: number | [number, number]) => {
      if (typeof arg === "number") {
        const td = touristDestinations[arg];
        if (!td) return;
        setDestinations((prev) => [...prev, { lat: td.lat, lon: td.lon, touristId: arg }]);
      } else setDestinations((prev) => [...prev, { lat: arg[0], lon: arg[1] }]);
    };
    window.delDest = (index: number) => setDestinations((prev) => prev.filter((_, i) => i !== index));
    window.delClick = (lat: number, lon: number) => setClickMarkers((prev) => prev.filter((m) => m.lat !== lat || m.lon !== lon));
  }, [touristDestinations]);

  return (
    <div>
      {/* Route selection + show stops */}
      <div className="absolute top-2 left-2 z-10 bg-white shadow-md rounded p-2">
        <label className="mr-2 font-medium">Select Route:</label>
        <select
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">-- Show All --</option>
          {precomputedRoutes.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <label className="ml-4 font-medium">
          <input type="checkbox" checked={showStops} onChange={() => setShowStops(!showStops)} className="mr-1"/>
          Show Stops
        </label>
      </div>

      <div style={{ display: "flex", height: "100vh" }}>
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

          {/* Precomputed routes */}
          {routeGeoJSON.filter(f => selectedRouteId === "" || f.properties.id === selectedRouteId).map((f, i) => (
            <Source key={i} id={`route-${i}`} type="geojson" data={f}>
              <Layer
                id={`route-line-${i}`}
                type="line"
                paint={{ "line-color": f.properties.lineColor, "line-width": 3 }}
              />
            </Source>
          ))}

          {/* Path coordinates */}
          {pathCoords.length > 1 && (
            <Source
              id="user-path"
              type="geojson"
              data={{ type: "Feature", geometry: { type: "LineString", coordinates: pathCoords.map(([lat, lon]) => [lon, lat]) } }}
            >
              <Layer
                id="user-path-line"
                type="line"
                paint={{ "line-color": "#0074D9", "line-width": 4 }}
              />
            </Source>
          )}

          {/* Show stops if toggled */}
          {showStops && mapLoaded && mapRef.current && stopsData.map((stop, i) => {
            const marker = new maplibregl.Marker({ color: "red" })
              .setLngLat([stop.lng, stop.lat])
              .setPopup(new maplibregl.Popup().setText(stop.name))
              .addTo(mapRef.current!);
            markersRef.current.push(marker);
            return null;
          })}

        </Map>
      </div>
    </div>
  );
};

export default MapView;
