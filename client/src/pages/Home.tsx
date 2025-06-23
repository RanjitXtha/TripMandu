import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

type Location = {
  name?: string;
  lat: number;
  lon: number;
};

const touristDestinations: Location[] = [
  { name: "Pashupatinath Temple", lat: 27.710535, lon: 85.34883 },
  { name: "Swayambhunath Temple", lat: 27.714938, lon: 85.2904 },
  { name: "Kathmandu Durbar Square", lat: 27.704347, lon: 85.306735 },
];

const ClickHandler = ({
  addDestinationMode,
  onAddDestination,
}: {
  addDestinationMode: boolean;
  onAddDestination: (latlng: [number, number]) => void;
}) => {
  useMapEvents({
    click(e) {
      if (addDestinationMode) {
        onAddDestination([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

const Home = () => {
  // Array of destinations including start, intermediate stops, and end
  const [destinations, setDestinations] = useState<Location[]>([]);

  const [loading, setLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);

  // Get user location once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          // error or denied geolocation
        }
      );
    }
  }, []);

  // Helper to set Start (first item)
  const setStart = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat: latlng[0], lon: latlng[1] }];
      // Replace first item
      return [{ lat: latlng[0], lon: latlng[1] }, ...prev.slice(1)];
    });
  };

  // Helper to set End (last item)
  const setEnd = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat: latlng[0], lon: latlng[1] }];
      if (prev.length === 1) return [prev[0], { lat: latlng[0], lon: latlng[1] }];
      // Replace last item
      return [...prev.slice(0, prev.length - 1), { lat: latlng[0], lon: latlng[1] }];
    });
  };

  // Add intermediate destination (append before end or at end if no end)
  const addDestination = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length <= 1) {
        // Just add at end
        return [...prev, { lat: latlng[0], lon: latlng[1] }];
      } else {
        // Insert before last (end)
        return [...prev.slice(0, prev.length - 1), { lat: latlng[0], lon: latlng[1] }, prev[prev.length - 1]];
      }
    });
  };

  // Remove a destination by index
  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear start or end by removing first or last destination
  const clearStart = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(1) : prev));
  };
  const clearEnd = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  // Fetch route for all destinations in order if at least start and end present
  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (destinations.length < 2) {
        setPathCoords([]);
        return;
      }
      setLoading(true);
      try {
         const start = destinations[0];
    const end = destinations[destinations.length - 1];
    const response = await axios.post("http://localhost:8080/api/map/getRoute", {
      start: { lat: start.lat, lon: start.lon },
      end: { lat: end.lat, lon: end.lon },
    });
        const data = response.data;
        console.log("Received path data:", data);
        if (!data.path || !Array.isArray(data.path)) {
          alert("Invalid route data received from server");
          setPathCoords([]);
          setLoading(false);
          return;
        }
        setPathCoords(data.path);
      } catch (error) {
        console.error("Request failed:", error);
        alert("Error fetching route");
        setPathCoords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [destinations]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 300,
          padding: 10,
          borderRight: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          overflowY: "auto",
        }}
      >
        <h3>Route Planner</h3>
        <div style={{ marginBottom: 20 }}>
          <strong>Start:</strong>
          <br />
          {destinations[0] ? (
            <>
              {destinations[0].name || `${destinations[0].lat.toFixed(5)}, ${destinations[0].lon.toFixed(5)}`}
              <br />
              <button onClick={clearStart}>Clear Start</button>
            </>
          ) : (
            <em>Not set</em>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <strong>End:</strong>
          <br />
          {destinations.length > 1 ? (
            <>
              {destinations[destinations.length - 1].name ||
                `${destinations[destinations.length - 1].lat.toFixed(5)}, ${destinations[destinations.length - 1].lon.toFixed(5)}`}
              <br />
              <button onClick={clearEnd}>Clear End</button>
            </>
          ) : (
            <em>Not set</em>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setAddDestinationMode(!addDestinationMode)}
            style={{
              backgroundColor: addDestinationMode ? "#4caf50" : undefined,
              color: addDestinationMode ? "white" : undefined,
              padding: "8px 12px",
              border: "none",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            {addDestinationMode ? "Add Destinations Mode ON" : "Add Destinations Mode OFF"}
          </button>
          <p style={{ fontSize: 12, color: "#555", marginTop: 5 }}>
            {addDestinationMode
              ? "Click on the map to add intermediate destinations."
              : "Toggle to add multiple destinations on map clicks."}
          </p>
        </div>

        {/* List all destinations */}
        <div>
          <h4>Destinations:</h4>
          {destinations.length === 0 && <p>No destinations added yet.</p>}
          <ul style={{ paddingLeft: 20 }}>
            {destinations.map((d, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {d.name || `${d.lat.toFixed(5)}, ${d.lon.toFixed(5)}`}{" "}
                <button
                  onClick={() => removeDestination(i)}
                  style={{
                    marginLeft: 8,
                    color: "red",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Map */}
      <div style={{ flexGrow: 1 }}>
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
            addDestinationMode={addDestinationMode}
            onAddDestination={(latlng) => addDestination(latlng)}
          />

          {/* Tourist Destinations */}
          {touristDestinations.map((place, idx) => (
            <Marker key={"tourist-" + idx} position={[place.lat, place.lon]}>
              <Popup>
                <div>
                  <strong>{place.name}</strong>
                  <br />
                  <button onClick={() => setStart([place.lat, place.lon])}>
                    Set as Start
                  </button>
                  <br />
                  <button onClick={() => setEnd([place.lat, place.lon])}>
                    Set as End
                  </button>
                  <br />
                  <button onClick={() => addDestination([place.lat, place.lon])}>
                    Add as Destination
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Destination Markers */}
          {destinations.map((dest, i) => (
            <Marker
              key={"dest-" + i}
              position={[dest.lat, dest.lon]}
              // Different colors for start/end/intermediate could be done with custom icons
            >
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

          {/* Show route */}
          {pathCoords.length > 0 && (
            <Polyline positions={pathCoords} color="blue" weight={5} />
          )}

          {/* Show user location */}
          {myloc && (
            <Marker position={[myloc.lat, myloc.lon]}>
              <Popup>My Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Home;
