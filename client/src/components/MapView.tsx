import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import type { Location } from "../types/types";

const ClickHandler = ({
  enabled,
  onMapClick,
}: {
  enabled: boolean;
  onMapClick: (latlng: [number, number]) => void;
}) => {
  useMapEvents({
    click(e) {
      if (enabled) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

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
}: MapViewProps) => {
  const setStart = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat: latlng[0], lon: latlng[1] }];
      return [{ lat: latlng[0], lon: latlng[1] }, ...prev.slice(1)];
    });
  };

  const setEnd = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat: latlng[0], lon: latlng[1] }];
      if (prev.length === 1)
        return [prev[0], { lat: latlng[0], lon: latlng[1] }];
      return [...prev.slice(0, -1), { lat: latlng[0], lon: latlng[1] }];
    });
  };

  const addDestination = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length <= 1)
        return [...prev, { lat: latlng[0], lon: latlng[1] }];
      return [
        ...prev.slice(0, -1),
        { lat: latlng[0], lon: latlng[1] },
        prev[prev.length - 1],
      ];
    });
  };

  const removeClickMarker = (lat: number, lon: number) => {
    setClickMarkers((prev) =>
      prev.filter((m) => m.lat !== lat || m.lon !== lon)
    );
  };

  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMapClick = (latlng: [number, number]) => {
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

  return (
    <div className="flex-1 h-dvh w-full z-1">
      <MapContainer
        center={[27.67, 85.43]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ClickHandler
          enabled={markerMode !== "none" || addDestinationMode}
          onMapClick={handleMapClick}
        />

        {touristDestinations.map((place, idx) => (
          <Marker key={"tourist-" + idx} position={[place.lat, place.lon]}>
            <Popup>
              <div>
                <strong>{place.name}</strong>
                <br />
                <button onClick={() => addDestination([place.lat, place.lon])}>
                  Add as Destination
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {clickMarkers.map((marker, idx) => (
          <Marker key={"click-" + idx} position={[marker.lat, marker.lon]}>
            <Popup>
              <div>
                <strong>Custom Marker</strong>
                <br />
                <button
                  onClick={() => addDestination([marker.lat, marker.lon])}
                >
                  Add as Destination
                </button>
                <br />
                <button
                  className="text-red"
                  onClick={() => removeClickMarker(marker.lat, marker.lon)}
                >
                  Delete Marker
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {destinations.map((dest, i) => (
          <Marker key={"dest-" + i} position={[dest.lat, dest.lon]}>
            <Popup>
              <div>
                <strong>
                  {i === 0
                    ? "Start"
                    : i === destinations.length - 1
                    ? "End"
                    : `Destination ${i}`}
                </strong>
                <br />
                {dest.name || `${dest.lat.toFixed(5)}, ${dest.lon.toFixed(5)}`}
                <br />
                <button onClick={() => removeDestination(i)}>Remove</button>
              </div>
            </Popup>
          </Marker>
        ))}

        {pathCoords.length > 0 && (
          <Polyline positions={pathCoords} color="blue" weight={5} />
        )}

        {myloc && (
          <Marker position={[myloc.lat, myloc.lon]}>
            <Popup>My Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
