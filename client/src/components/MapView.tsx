import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, Source, Layer } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
  Location,
  OverlayView,
  NearByDestinationType,
} from "../types/types";

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

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Map destination index to order for route numbering
    const orderMap: Record<number, number> = {};
    tspOrder.forEach((destIndex, orderIndex) => {
      orderMap[destIndex] = orderIndex + 1;
    });

    const showTouristMarkers = pathCoords.length === 0;

    // Tourist destination markers (only when not showing route)
    if (showTouristMarkers) {
      touristDestinations.forEach((place, index) => {
        const popupId = `tourist-info-${index}`;
        const html = `
        <div class="p-3 bg-white rounded shadow-md text-sm space-y-2">
          <h3 class="font-semibold text-lg text-center">${place.name}</h3><br/>
          <button class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-2 transition cursor-pointer" onclick='window.addDest(${index})'>Add as Destination</button><br/>
          <button id="${popupId}" class="w-full text-blue-600 hover:underline mt-1 cursor-pointer">View Site Info</button>
        </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: true,
        }).setHTML(html);

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

        // let isHoveringMarker = false;
        // let isHoveringPopup = false;
        // let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

        // // Mouse enter on marker
        // el.addEventListener("mouseenter", () => {
        //   isHoveringMarker = true;
        //   if (hoverTimeout) clearTimeout(hoverTimeout);
        //   popup.addTo(mapRef.current!);
        // });

        // // Mouse leave from marker
        // el.addEventListener("mouseleave", () => {
        //   isHoveringMarker = false;
        //   hoverTimeout = setTimeout(() => {
        //     if (!isHoveringPopup) {
        //       popup.remove();
        //     }
        //   }, 200); // slight delay to allow transition
        // });

        // // Track popup hover (after it's in DOM)
        // popup.on("open", () => {
        //   const popupEl = document.querySelector(".maplibregl-popup-content");
        //   const popupContainer = popupEl?.parentElement;

        //   if (popupContainer) {
        //     popupContainer.addEventListener("mouseenter", () => {
        //       console.log("hovered");
        //       isHoveringPopup = true;
        //       if (hoverTimeout) clearTimeout(hoverTimeout);
        //     });

        //     popupContainer.addEventListener("mouseleave", () => {
        //       isHoveringPopup = false;
        //       hoverTimeout = setTimeout(() => {
        //         if (!isHoveringMarker) {
        //           popup.remove();
        //         }
        //       }, 200);
        //     });
        //   }
        // });

        marker.getElement().addEventListener("click", () => {
          const map = mapRef.current;
          if (map) {
            map.flyTo({ center: [place.lon, place.lat], zoom: 15 });
          }

          setOverlayView("popularSite");

          if (selectedMarker === index) {
            setSelectedMarker(null);
            setTimeout(() => setSelectedMarker(index), 0); // force remount
          } else {
            setSelectedMarker(index);
          }
        });
      });
    }

    // Click markers (custom added markers)
    clickMarkers.forEach((place, index) => {
      const html = `
      <div class="p-3 bg-white rounded shadow-md text-sm space-y-2">
        <h3 class="font-semibold text-lg">Custom Marker</h3><br/>
        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 transition" onclick='window.addDest([${place.lat}, ${place.lon}])'>Add as Destination</button><br/>
        <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded px-2 py-2 transition cursor-pointer"  onclick='window.delClick(${place.lat}, ${place.lon})'>Delete</button>
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
      const order = orderMap[i] ?? i + 1;
      const popupId = `dest-info-${i}`;

      // Use the name from touristDestinations if touristId exists
      const nameFromTourist =
        place.touristId !== undefined && place.touristId !== null
          ? touristDestinations[place.touristId]?.name
          : place.name;

      const html = `
      <div class="p-3 bg-white rounded shadow-md text-sm">
        <h3 class="font-semibold text-lg text-center">Destination ${order}</h3><br/>
        ${
          nameFromTourist
            ? `<p class="font-semibold text-md text-center">${nameFromTourist}</p><br/>`
            : ""
        }
        ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}<br/>
        <button class="w-full bg-red-600 hover:bg-red-700 text-white rounded px-2 py-2 transition cursor-pointer" onclick='window.delDest(${i})'>Remove</button><br/>
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
      el.innerText = String(order);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);

      popup.on("open", () => {
        const btn = document.getElementById(popupId);
        if (btn) {
          btn.addEventListener("click", () => {
            // Set selectedMarker as touristId if available, else fallback to destination index
            if (place.touristId !== undefined && place.touristId !== null) {
              setSelectedMarker(place.touristId);
            } else {
              setSelectedMarker(i);
            }
          });
        }
      });
    });

    // My location marker with Add as Destination button
    if (myloc) {
      const popupId = "my-location-add-btn";
      const html = `
      <div class="p-3 bg-white rounded shadow-md text-sm space-y-2">
        <h3 class="font-semibold text-lg text-center">My Location</h3><br/>
        <button id="${popupId}" class="w-full text-blue-600 hover:underline mt-1 cursor-pointer">Add as Destination</button>
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
            // Add my location as a destination without touristId
            setDestinations((prev) => [
              ...prev,
              { lat: myloc.lat, lon: myloc.lon },
            ]);
          });
        }
      });
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
        // Add from touristDestinations by index
        const td = touristDestinations[touristIndexOrLatlng];
        if (!td) return;
        setDestinations((prev) => [
          ...prev,
          { lat: td.lat, lon: td.lon, touristId: touristIndexOrLatlng },
        ]);
      } else if (Array.isArray(touristIndexOrLatlng)) {
        // Add custom latlng without touristId
        setDestinations((prev) => [
          ...prev,
          { lat: touristIndexOrLatlng[0], lon: touristIndexOrLatlng[1] },
        ]);
      }
    };
    window.delDest = (index: number) => removeDestination(index);
    window.delClick = (lat: number, lon: number) => removeClickMarker(lat, lon);
  }, [touristDestinations]);

  return (
    <div>
      <div style={{ display: "flex", height: "100vh" }}>
        <Map
          mapLib={maplibregl}
          initialViewState={{ latitude: 27.67, longitude: 85.43, zoom: 14 }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{ height: "100%", width: "100%" }}
          onLoad={({ target }: { target: maplibregl.Map }) => {
            mapRef.current = target;
            setMapLoaded(true);
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
