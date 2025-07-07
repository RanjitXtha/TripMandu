import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, Source, Layer } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

// Extend window interface for popup actions
declare global {
  interface Window {
    addDest: (latlng: [number, number]) => void;
    delDest: (index: number) => void;
    delClick: (lat: number, lon: number) => void;
  }
}

const touristDestinations = [
  { name: "Pashupatinath Temple", lat: 27.710535, lon: 85.34883 },
  { name: "Swayambhunath Temple", lat: 27.714938, lon: 85.2904 },
  { name: "Kathmandu Durbar Square", lat: 27.704347, lon: 85.306735 },
];

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
}

const MapView = (
  {
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
  }:MapViewProps 
) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

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
    ];

    allMarkers.forEach(({ lat, lon, html }) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(html);
      const marker = new maplibregl.Marker().setLngLat([lon, lat]).setPopup(popup).addTo(mapRef.current!);
      markersRef.current.push(marker);
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

  const clearStart = () => setDestinations((prev) => prev.slice(1));
  const clearEnd = () => setDestinations((prev) => prev.slice(0, -1));

  useEffect(() => {
    const fetchRoute = async () => {
      if (destinations.length < 2) return setPathCoords([]);
      setLoading(true);
      try {
        const start = destinations[0];
        const end = destinations[destinations.length - 1];
        const res = await axios.post("http://localhost:8080/api/map/getRoute", { start, end });
        const data = res.data;
        if (!data.path || !Array.isArray(data.path)) return setPathCoords([]);
        setPathCoords(data.path);
      } catch (e) {
        console.error(e);
        setPathCoords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [destinations]);

  useEffect(() => {
    window.addDest = (latlng: [number, number]) => setDestinations((prev) => [...prev, { lat: latlng[0], lon: latlng[1] }]);
    window.delDest = (index: number) => removeDestination(index);
    window.delClick = (lat: number, lon: number) => removeClickMarker(lat, lon);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 300, padding: 10, borderRight: "1px solid #ccc", backgroundColor: "#f9f9f9", overflowY: "auto" }}>
        <h3>Route Planner</h3>

        <div style={{ marginBottom: 20 }}>
          <strong>Start:</strong><br />
          {destinations[0] ? (
            <>
              {destinations[0].name || `${destinations[0].lat.toFixed(5)}, ${destinations[0].lon.toFixed(5)}`}<br />
              <button onClick={clearStart}>Clear Start</button>
            </>
          ) : <em>Not set</em>}
          <br />
          <button onClick={() => setMarkerMode("start")}>Set from Map</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <strong>End:</strong><br />
          {destinations.length > 1 ? (
            <>
              {destinations[destinations.length - 1].name || `${destinations[destinations.length - 1].lat.toFixed(5)}, ${destinations[destinations.length - 1].lon.toFixed(5)}`}<br />
              <button onClick={clearEnd}>Clear End</button>
            </>
          ) : <em>Not set</em>}
          <br />
          <button onClick={() => setMarkerMode("end")}>Set from Map</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setAddDestinationMode(!addDestinationMode)}
            style={{ backgroundColor: addDestinationMode ? "#4caf50" : undefined, color: addDestinationMode ? "white" : undefined }}>
            {addDestinationMode ? "Add Destinations Mode ON" : "Add Destinations Mode OFF"}
          </button>
        </div>

        <div>
          <h4>Destinations:</h4>
          {destinations.length === 0 && <p>No destinations added yet.</p>}
          <ul style={{ paddingLeft: 20 }}>
            {destinations.map((d, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {d.name || `${d.lat.toFixed(5)}, ${d.lon.toFixed(5)}`} {" "}
                <button onClick={() => removeDestination(i)} style={{ marginLeft: 8, color: "red", cursor: "pointer" }}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ flexGrow: 1 }}>
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
