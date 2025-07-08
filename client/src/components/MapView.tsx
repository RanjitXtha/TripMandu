import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, Source, Layer } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Location ,NearByDestinationType} from "../types/types";

// Extend window interface for popup actions
declare global {
  interface Window {
    addDest: (latlng: [number, number]) => void;
    delDest: (index: number) => void;
    delClick: (lat: number, lon: number) => void;
  }
}


interface MapViewProps {
  touristDestinations: Location[];
  clickMarkers: Location[];
  setClickMarkers: React.Dispatch<React.SetStateAction<Location[]>>;
  destinations: Location[];
  setDestinations: React.Dispatch<React.SetStateAction<Location[]>>;
  markerMode: "none" | "start" | "end";
  setMarkerMode: (mode: "none" | "start" | "end") => void;
  addDestinationMode: boolean;
  myloc: { lat: number; lon: number } | null;
  pathCoords: [number, number][];
  setSelectedMarker:React.Dispatch<React.SetStateAction<number | null>>
  nearByDestinations: NearByDestinationType[]
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
  setSelectedMarker,
  nearByDestinations
}: MapViewProps) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);


  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const allMarkers = [
      ...touristDestinations.map((place) => ({
        lat: place.lat,
        lon: place.lon,
        html: `<strong>${place.name}</strong><br/><button onclick='window.addDest([${place.lat}, ${place.lon}])'>Add as Destination</button>`
      })),
      ...clickMarkers.map((place) => ({
        lat: place.lat,
        lon: place.lon,
        html: `<strong>Custom Marker</strong><br/><button onclick='window.addDest([${place.lat}, ${place.lon}])'>Add as Destination</button><br/><button style='color:red' onclick='window.delClick(${place.lat}, ${place.lon})'>Delete Marker</button>`
      })),
      ...destinations.map((place, i) => ({
        lat: place.lat,
        lon: place.lon,
        html: `<strong>${i === 0 ? "Start" : i === destinations.length - 1 ? "End" : `Destination ${i}`}</strong><br/>${place.name || `${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}`}<br/><button onclick='window.delDest(${i})'>Remove</button>`
      })),

         ...nearByDestinations.map((place, i) => ({
        lat: place.lat,
        lon: place.lon,
        html: `<strong>${i === 0 ? "Start" : i === destinations.length - 1 ? "End" : `Destination ${i}`}</strong><br/>${place.name || `${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}`}<br/><button onclick='window.delDest(${i})'>Remove</button>`
      })),
    ];


allMarkers.forEach(({ lat, lon, html }, index) => {
  const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);

  const markerEl = document.createElement('div');
  markerEl.className = 'custom-marker';
  markerEl.style.width = '20px';
  markerEl.style.height = '20px';
  markerEl.style.borderRadius = '50%';
  markerEl.style.backgroundColor = 'tomato';
  markerEl.style.border = '2px solid white';
  markerEl.style.cursor = 'pointer';

  const marker = new maplibregl.Marker({ element: markerEl })
    .setLngLat([lon, lat])
    .setPopup(popup)
    .addTo(mapRef.current!);

  markersRef.current.push(marker);

  marker.getElement().addEventListener("click", () => {
    setSelectedMarker(index);
  });
});

    if (myloc) {
      const popup = new maplibregl.Popup().setText("My Location");
      const marker = new maplibregl.Marker({ color: "green" })
        .setLngLat([myloc.lon, myloc.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    }
  }, [mapLoaded, clickMarkers, destinations, myloc]);

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
        setClickMarkers((prev) => [...prev, { lat: latlng[0], lon: latlng[1] }]);
      }
    };

    const map = mapRef.current;
    if (map) {
      map.on("click", handleClick);
      return () => map.off("click", handleClick);
    }
  }, [markerMode, addDestinationMode]);

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
    setClickMarkers((prev) => prev.filter((m) => m.lat !== lat || m.lon !== lon));
  };


  useEffect(() => {
    window.addDest = (latlng: [number, number]) => setDestinations((prev) => [...prev, { lat: latlng[0], lon: latlng[1] }]);
    window.delDest = (index: number) => removeDestination(index);
    window.delClick = (lat: number, lon: number) => removeClickMarker(lat, lon);
  }, []);

  return (
    <div >
      <div style={{ display: "flex", height: "100vh" }}>
        <Map
          mapLib={maplibregl}
          initialViewState={{ latitude: 27.67, longitude: 85.43, zoom: 14 }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{ height: "100%", width: "100%" }}
          onLoad={({ target }: { target: maplibregl.Map }) => {
            mapRef.current = target;
            setMapLoaded(true);
          }}>
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
              }}>
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
