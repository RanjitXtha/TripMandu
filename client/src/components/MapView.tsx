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
          <strong>${place.name}</strong><br/>
          <button onclick='window.addDest(${index})'>Add as Destination</button><br/>
          <button id="${popupId}" style="color:blue;cursor:pointer;margin-top:4px">View Site Info</button>
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

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
          if (map) {
            map.flyTo({ center: [place.lon, place.lat], zoom: 15 }); //  optional zoom
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
        <strong>Custom Marker</strong><br/>
        <button onclick='window.addDest([${place.lat}, ${place.lon}])'>Add as Destination</button><br/>
        <button style='color:red' onclick='window.delClick(${place.lat}, ${place.lon})'>Delete Marker</button>
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
        <strong>Destination ${order}</strong><br/>
        ${nameFromTourist ? `<em>${nameFromTourist}</em><br/>` : ""}
        ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}<br/>
        <button onclick='window.delDest(${i})'>Remove</button><br/>
        <button id="${popupId}" style="color:blue;cursor:pointer;margin-top:4px">View Site Info</button>
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
        <strong>My Location</strong><br/>
        <button id="${popupId}" style="color:blue;cursor:pointer;margin-top:4px">Add as Destination</button>
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
