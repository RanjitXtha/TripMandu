import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, Source, Layer } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
  Location,
  OverlayView,
  NearByDestinationType,
} from "../types/types";
import { useSearchLocation } from "../features/searchHook";
import { getIconUrlByName } from "../utils/iconFile";

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
  setDestinations: React.Dispatch<
    React.SetStateAction<LocationWithTouristId[]>
  >;
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
  const lastSelectedMarkerRef = useRef<number | string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const { selectedLocation } = useSearchLocation();

  // Helper function to get display number for markers
  const getDisplayNumber = (destinationIndex: number): number => {
    if (tspOrder.length === 0) {
      // If no TSP calculated, show sequential numbers
      return destinationIndex + 1;
    }

    // Find the position of this destination in the TSP order
    const position = tspOrder.indexOf(destinationIndex);
    if (position === -1) {
      // If not found in TSP order (shouldn't happen), fallback to sequential
      return destinationIndex + 1;
    }
    return position + 1; // Convert to 1-based numbering
  };

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const showTouristMarkers = pathCoords.length === 0;

    // Tourist destination markers (only when not showing route)
    if (showTouristMarkers) {
      touristDestinations.forEach((place, index) => {
        const html = `
        <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm space-y-2">
          <h3 class="font-semibold text-lg text-center">${place.name}</h3>
          <hr class="mt-1 mb-3">
          <button id="addDestination" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] shadow-lg mb-0 px-2 py-2 transition cursor-pointer" onclick='window.addDest(${index})'>Add Destination</button><br/>
        </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: true,
        }).setHTML(html);

        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "transparent";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        el.style.display = "flex";
        el.style.justifyContent = "center";
        el.style.alignItems = "center";

        const img = document.createElement("img");
        img.src = getIconUrlByName(place.name!);
        img.alt = place.name!;
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.borderRadius = "50%";

        el.appendChild(img);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.lon, place.lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        markersRef.current.push(marker);

        marker.getElement().addEventListener("click", () => {
          lastSelectedMarkerRef.current = index;

          mapRef.current?.flyTo({ center: [place.lon, place.lat], zoom: 15 });

          setOverlayView("showSite");

          if (selectedMarker === index) {
            setSelectedMarker(null);
            setTimeout(() => setSelectedMarker(index), 0); // force remount
          } else {
            setSelectedMarker(index);
          }
        });

        popup.on("close", () => {
          if (lastSelectedMarkerRef.current === index) {
            setTimeout(() => setOverlayView("none"), 0);
          }
        });
      });
    }

    // Click markers (custom added markers)
    clickMarkers.forEach((place) => {
      const html = `
      <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm space-y-2">
        <h3 class="font-semibold text-lg text-center">Custom Marker</h3>
        <hr class="mt-1 mb-3">
        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] shadow-lg mb-2 px-2 py-2 transition cursor-pointer" onclick='window.addDest([${place.lat}, ${place.lon}])'>Add Destination</button><br/>
        <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded-[1.2rem] shadow-lg mb-0  px-2 py-2 transition cursor-pointer"  onclick='window.delClick(${place.lat}, ${place.lon})'>Delete</button>
      </div>
      `;

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

    // Destination markers (selected destinations with route info)
    destinations.forEach((place, i) => {
      const displayNumber = getDisplayNumber(i);
      const popupId = `dest-info-${i}`;

      // Use the name from touristDestinations if touristId exists
      const nameFromTourist =
        place.touristId !== undefined && place.touristId !== null
          ? touristDestinations[place.touristId]?.name
          : place.name;

      const html = `
      <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm">
        <h3 class="font-semibold underline text-md text-center">Destination ${displayNumber}</h3>
        ${
          nameFromTourist
            ? `<p class="font-bold text-md text-center">${nameFromTourist}</p>`
            : ""
        }
        <hr class="mt-1 mb-3">
        <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded-[1.2rem] shadow-lg mb-0 mt-1 px-2 py-2 transition cursor-pointer" onclick='window.delDest(${i})'>Remove</button><br/>
        <button id="${popupId}" class="w-full text-blue-600 hover:underline mt-1 cursor-pointer">View Site Info</button>
      </div>
      `;

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

      popup.on("open", () => {
        const btn = document.getElementById(popupId);
        if (btn) {
          btn.addEventListener("click", () => {
            const markerId = place.touristId ?? null;

            lastSelectedMarkerRef.current = markerId;

            if (selectedMarker === markerId) {
              setSelectedMarker(null);
              setTimeout(() => setSelectedMarker(markerId), 0);
            } else {
              setSelectedMarker(markerId);
            }

            setOverlayView("showSite");
          });
        }
      });

      popup.on("close", () => {
        if (lastSelectedMarkerRef.current === (place.touristId ?? null)) {
          setTimeout(() => setOverlayView("none"), 0);
        }
      });
    });

    // My location marker with Add as Destination button
    if (myloc) {
      const popupId = "my-location-add-btn";
      const html = `
      <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm space-y-2">
        <h3 class="font-semibold text-lg text-center">My Location</h3>
        <hr class="mt-1 mb-3">
        <button id="${popupId}" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] shadow-lg mb-0 px-2 py-2 transition cursor-pointer">Add Destination</button>
      </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

      const marker = new maplibregl.Marker({ color: "green" })
        .setLngLat([myloc.lon, myloc.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);

      popup.on("open", () => {
        const btn = document.getElementById(popupId);
        if (btn) {
          btn.addEventListener("click", () => {
            lastSelectedMarkerRef.current = "myloc";
            // Add my location as a destination without touristId
            setDestinations((prev) => [
              ...prev,
              { lat: myloc.lat, lon: myloc.lon },
            ]);
          });
        }
      });

      popup.on("close", () => {
        if (lastSelectedMarkerRef.current === "myloc") {
          setTimeout(() => setOverlayView("none"), 0);
        }
      });
    }

    // Selected location marker
    if (selectedLocation) {
      const { lat, lon, name, id } = selectedLocation;

      // Check if this location is already added as a destination
      const isAlreadyDestination = destinations.some((dest) => dest.id === id);

      // Only show search marker if it's not already added as a destination
      if (!isAlreadyDestination) {
        // Find if this selected location matches any tourist destination
        const touristIndex = touristDestinations.findIndex(
          (td) => td.id === id
        );

        const popupHtml = `
          <div class="w-[180px] p-3 bg-white rounded shadow-md text-sm">
            <h3 class="font-semibold text-lg text-center">${
              name ?? "Searched Location"
            }</h3>
            <hr class="mt-1 mb-3">
            <button id="addDestinations" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] shadow-lg mb-0 px-2 py-2 transition cursor-pointer">Add Destination</button>
          </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: true,
        }).setHTML(popupHtml);

         const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "transparent";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        el.style.display = "flex";
        el.style.justifyContent = "center";
        el.style.alignItems = "center";

        const img = document.createElement("img");
        img.src = getIconUrlByName(selectedLocation.name!);
        img.alt = selectedLocation.name!;
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.borderRadius = "50%";

        el.appendChild(img);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        markersRef.current.push(marker);

        mapRef.current.flyTo({ center: [lon, lat], zoom: 15 });

        // Behave like tourist destination markers
        marker.getElement().addEventListener("click", () => {
          if (touristIndex !== -1) {
            lastSelectedMarkerRef.current = touristIndex;

            if (selectedMarker === touristIndex) {
              setSelectedMarker(null);
              setTimeout(() => setSelectedMarker(touristIndex), 0); // force remount
            } else {
              setSelectedMarker(touristIndex);
            }
          }
          setOverlayView("showSite");
        });

        popup.on("open", () => {
          const addDestination = document.getElementById("addDestinations");
          addDestination?.addEventListener("click", () => {
            setOverlayView("none");
            if (touristIndex !== -1) {
              // If it's a tourist destination, add with touristId
              setDestinations((prev) => [
                ...prev,
                {
                  lat,
                  lon,
                  id,
                  name,
                  touristId: touristIndex,
                },
              ]);
            } else {
              // If it's not a tourist destination, add without touristId
              setDestinations((prev) => [...prev, { lat, lon, id, name }]);
            }
          });
        });

        popup.on("close", () => {
          if (
            touristIndex !== -1 &&
            lastSelectedMarkerRef.current === touristIndex
          ) {
            setTimeout(() => setOverlayView("none"), 0);
          }
        });
      }
    }
  }, [
    mapLoaded,
    clickMarkers,
    destinations,
    myloc,
    tspOrder,
    pathCoords,
    touristDestinations,
    setSelectedMarker,
    setDestinations,
    selectedLocation,
    setOverlayView,
  ]);

  // Map click handlers for adding custom markers or setting start/end
  useEffect(() => {
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const latlng: [number, number] = [e.lngLat.lat, e.lngLat.lng];
      if (markerMode === "start") {
        setStart(latlng);
        setMarkerMode("none");
      } else if (markerMode === "end") {
        setEnd(latlng);
        setMarkerMode("none");
      } else if (addDestinationMode) {
        setClickMarkers((prev) => [
          ...prev,
          { lat: latlng[0], lon: latlng[1] },
        ]);
      }
    };

    const map = mapRef.current;
    if (map) {
      map.on("click", handleClick);
      return () => map.off("click", handleClick);
    }
  }, [markerMode, addDestinationMode, setClickMarkers, setMarkerMode]);

  const setStart = ([lat, lon]: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat, lon }];
      return [{ lat, lon }, ...prev.slice(1)];
    });
  };

  const setEnd = ([lat, lon]: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat, lon }];
      if (prev.length === 1) return [prev[0], { lat, lon }];
      return [...prev.slice(0, -1), { lat, lon }];
    });
  };

  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const removeClickMarker = (lat: number, lon: number) => {
    setClickMarkers((prev) =>
      prev.filter((m) => m.lat !== lat || m.lon !== lon)
    );
  };

  // Setup global window functions
  useEffect(() => {
    window.addDest = (touristIndexOrLatlng: number | [number, number]) => {
      if (typeof touristIndexOrLatlng === "number") {
        const td = touristDestinations[touristIndexOrLatlng];
        console.log("Adding tourist destination:", td);
        if (!td) return;
        setDestinations((prev) => [
          ...prev,
          {
            lat: td.lat,
            lon: td.lon,
            touristId: touristIndexOrLatlng,
            id: td?.id,
          },
        ]);
      } else if (Array.isArray(touristIndexOrLatlng)) {
        setDestinations((prev) => [
          ...prev,
          { lat: touristIndexOrLatlng[0], lon: touristIndexOrLatlng[1] },
        ]);
      }
    };
    window.delDest = (index: number) => removeDestination(index);
    window.delClick = (lat: number, lon: number) => removeClickMarker(lat, lon);
  }, [touristDestinations, setDestinations]);

  return (
    <div>
      <div className="flex h-[100vh]">
        <Map
          mapLib={maplibregl}
          initialViewState={{ latitude: 27.67, longitude: 85.43, zoom: 14 }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{ height: "100%", width: "100%" }}
          onLoad={({ target }: { target: maplibregl.Map }) => {
            mapRef.current = target;
            setMapLoaded(true);

            target.setMaxBounds([
              [85.2025, 27.566721], // Southwest corner (lng, lat)
              [85.561371, 27.815708], // Northeast corner (lng, lat)
            ]);
          }}
        >
          <NavigationControl position="top-right" />
          {pathCoords.length > 1 && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: pathCoords.map(([lat, lon]) => [lon, lat]),
                },
                properties: {},
              }}
            >
              <Layer
                id="route-line"
                type="line"
                paint={{ "line-color": "#0074D9", "line-width": 4 }}
              />
            </Source>
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapView;
