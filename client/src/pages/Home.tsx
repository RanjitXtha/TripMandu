import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import type { Location ,TouristDestination} from "../types/types";
import Header from "../components/Header";
import ShowSites from "../components/ShowSites";
import Overlay from "../components/Overlay";
import Footer from "../components/Footer";
import Search from "../components/Search";

type OverlayView = "none" | "showSites" | "routePlanner";




const Home = () => {
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [clickMarkers, setClickMarkers] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);

  const [selectedMarker,setSelectedMarker]=  useState<null|number>(null);

  const [touristDestinations,setTouristDestinations] = useState<TouristDestination[]>([]);
  const [touristDestinationsCoords,setTouristDestinationsCoords] =  useState<Location[]>([]);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">(
    "none"
  );

  useEffect(()=>{
    const GetDesinations = async()=>{
 const response = await fetch('/destinations.json');
 const destinations:TouristDestination[] = await response.json();

 const mappedDestinations:Location[] = destinations.map((destination)=>{
  return{
    name:destination.name,
    lat:destination.coordinates?.lat,
    lon:destination.coordinates?.lon
  }
 })
 console.log(destinations)
 setTouristDestinations(destinations);
 setTouristDestinationsCoords(mappedDestinations);

  
    }

    GetDesinations()
   
  },[])


  useEffect(()=>{
    if(selectedMarker===null)return

    setOverlayView('showSites');
    console.log('marker'+selectedMarker);

  },[selectedMarker])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

<<<<<<< HEAD
  const setStart = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat: latlng[0], lon: latlng[1] }];
      return [{ lat: latlng[0], lon: latlng[1] }, ...prev.slice(1)];
    });
  };

  const setEnd = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length === 0) return [{ lat: latlng[0], lon: latlng[1] }];
      if (prev.length === 1) return [prev[0], { lat: latlng[0], lon: latlng[1] }];
      return [...prev.slice(0, -1), { lat: latlng[0], lon: latlng[1] }];
    });
  };

  const addDestination = (latlng: [number, number]) => {
    setDestinations((prev) => {
      if (prev.length <= 1) return [...prev, { lat: latlng[0], lon: latlng[1] }];
      return [...prev.slice(0, -1), { lat: latlng[0], lon: latlng[1] }, prev[prev.length - 1]];
    });
  };

  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const clearStart = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(1) : prev));
  };

  const clearEnd = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  const removeClickMarker = (lat: number, lon: number) => {
    setClickMarkers((prev) => prev.filter((m) => m.lat !== lat || m.lon !== lon));
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

=======
>>>>>>> origin/ranjit
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
        const response = await axios.post(
          "http://localhost:8080/api/map/getRoute",
          {
            start: { lat: start.lat, lon: start.lon },
            end: { lat: end.lat, lon: end.lon },
          }
        );
        const data = response.data;
        if (!data.path || !Array.isArray(data.path)) {
          alert("Invalid route data received from server");
          setPathCoords([]);
        } else {
          setPathCoords(data.path);
        }
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
<<<<<<< HEAD
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

      <div style={{ flexGrow: 1,zIndex:1 }}>
        <MapContainer center={[27.67, 85.43]} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

          <ClickHandler enabled={markerMode !== "none" || addDestinationMode} onMapClick={handleMapClick} />

          {touristDestinations.map((place, idx) => (
            <Marker key={"tourist-" + idx} position={[place.lat, place.lon]}>
              <Popup>
                <div>
                  <strong>{place.name}</strong>
                  <br />
                  <button onClick={() => addDestination([place.lat, place.lon])}>Add as Destination</button>
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
                  <button onClick={() => addDestination([marker.lat, marker.lon])}>Add as Destination</button>
                  <br />
                  <button style={{ color: "red" }} onClick={() => removeClickMarker(marker.lat, marker.lon)}>Delete Marker</button>
                </div>
              </Popup>
            </Marker>
          ))}

          {destinations.map((dest, i) => (
            <Marker key={"dest-" + i} position={[dest.lat, dest.lon]}>
              <Popup>
                <div>
                  <strong>{i === 0 ? "Start" : i === destinations.length - 1 ? "End" : `Destination ${i}`}</strong>
                  <br />
                  {dest.name ||
                    `${dest.lat.toFixed(5)}, ${dest.lon.toFixed(5)}`}
                  <br />
                  <button onClick={() => removeDestination(i)}>Remove</button>
                </div>
              </Popup>
            </Marker>
          ))}

          {pathCoords.length > 0 && <Polyline positions={pathCoords} color="blue" weight={5} />}

          {myloc && <Marker position={[myloc.lat, myloc.lon]}><Popup>My Location</Popup></Marker>}
        </MapContainer>
=======
    <div className="flex">
      <Header onSelectView={(view) => setOverlayView(view)} />
        {/* <Search /> */}
      {overlayView !== "none" && (
        <Overlay>
          {(overlayView === "showSites" && selectedMarker!==null) && <ShowSites siteData={touristDestinations[selectedMarker]} />}
          {overlayView === "routePlanner" && (
            <RoutePlanner
              destinations={destinations}
              setDestinations={setDestinations}
              markerMode={markerMode}
              setMarkerMode={setMarkerMode}
              addDestinationMode={addDestinationMode}
              setAddDestinationMode={setAddDestinationMode}
            />
          )}
        </Overlay>
      )}
<div className="bg-green-400 h-screen w-full">
      
    
      <MapView
      
        touristDestinations={touristDestinationsCoords}
        clickMarkers={clickMarkers}
        setClickMarkers={setClickMarkers}
        destinations={destinations}
        setDestinations={setDestinations}
        markerMode={markerMode}
        setMarkerMode={setMarkerMode}
        addDestinationMode={addDestinationMode}
        myloc={myloc}
        pathCoords={pathCoords}
        setSelectedMarker={setSelectedMarker}
      />
>>>>>>> origin/ranjit
      </div>
      <Footer />
    </div>
  );
};

export default Home;