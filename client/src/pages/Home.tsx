import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import axios from "axios";
import type {
  Location,
  OverlayView,
  NearByDestinationType,
} from "../types/types";
import Header from "../components/Header";
import Overlay from "../components/Overlay";
import Footer from "../components/Footer";
import SiteCard from "../components/SiteCard";
import PopularSites from "../components/PopularSites";
import { getAllPoints, type Destination } from "../apiHandle/detination";
import PlanFormCard from "../components/plan/PlanForm";
import type { PlanDestination } from "../types/plan.type";

// for redux management states and exports
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { createPlan } from "../features/plan";
import { useSearchLocation } from "../features/searchHook";
// import { useSelector } from "react-redux";
// import type { RootOptions } from "react-dom/client";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  //
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [clickMarkers, setClickMarkers] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myloc, setMyloc] = useState<{ lat: number; lon: number } | null>(null);
  const [addDestinationMode, setAddDestinationMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<null | number>(null);
  const [nearByDestinations, setNearByDestinations] = useState<
    NearByDestinationType[]
  >([]);
  const [touristDestinations, setTouristDestinations] = useState<Destination[]>(
    []
  );
  const [touristDestinationsCoords, setTouristDestinationsCoords] = useState<
    Location[]
  >([]);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">(
    "none"
  );
  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);
  const [tspOrder, setTspOrder] = useState<number[]>([]);

  // for plan state
  const [isOpenPlanForm, setIsOpenPlanForm] = useState<boolean>(false);
  const [togglePlanFormAndCalculateRoute, setTogglePlanFormAndCalculateRoute] =
    useState<boolean>(true);
  const [plannedDestination, setPlannedDestination] = useState<
    PlanDestination[]
  >([]);

  


  // get searched location(and selectd)

  const { selectedLocation } = useSearchLocation();

  console.log("Selected location is:", selectedLocation);

//  get all location points
  useEffect(() => {
    const GetDestinations = async () => {
      try {
        const response = await getAllPoints();
        if (!response.success) {
          throw new Error("Failed to fetch destinations");
        }

        const destinations: Destination[] = response.data;
        console.log("Fetched destinations:", destinations);

        const coords = destinations.map((d) => ({
          id: d.id,
          name: d.name,
          lat: d.lat,
          lon: d.lon,
        }));

        setTouristDestinations(destinations);
        setTouristDestinationsCoords(coords);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    GetDestinations();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setMyloc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Reset path and TSP order when destinations change

  useEffect(() => {
    setPathCoords([]);
    setTspOrder([]);
  }, [destinations]);

  // Calculate TSP route when destinations are updated

  const calculateTSPRoute = async () => {
    if (destinations.length < 2) {
      setTogglePlanFormAndCalculateRoute(false);
      alert("Please add at least two destinations");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Calculating TSP route for destinations:", destinations);
      const res = await axios.post("http://localhost:8080/api/map/solveTsp", {
        destinations,
      });

      console.log("TSP route response:", res.data);
      const {
        path,
        tspResponse,
      }: {
        path: [number, number][];
        tspResponse: Record<string, { id: string; order: number }>;
      } = res.data;
      console.log("TSP Order:", tspResponse);

      const tspDataResponse = Object.values(tspResponse);
      console.log("TSP Data Response:", tspDataResponse);

      setPlannedDestination(tspDataResponse);

      const order = tspDataResponse.map((item) => item?.order);
      //  console.log("TSP Order Indices:", order);

      if (!Array.isArray(path)) throw new Error("Invalid path");

      setTspOrder(order);
      setPathCoords(path);
    } catch (err) {
      console.error("Failed to calculate route:", err);
      alert("Failed to calculate TSP route");
    } finally {
      setIsLoading(false);
    }
  };
  // hanlde toggle state

  const handletoggle = () => {
    setTogglePlanFormAndCalculateRoute((p) => !p);
  };

  useEffect(() => {
    if (selectedMarker !== null) {
      setOverlayView("showSite");
      console.log("From selected marker: ", selectedMarker)
    }
  }, [selectedMarker]);

  // to show plan form
  const handleSubmit = async (planName: string) => {
    console.log("Planned Destination:", plannedDestination);
    console.log("Plan Name: ", planName);
    const desination = plannedDestination.slice(0, -1);
    const data = {
      planName,
      destinations: desination,
    };
    await dispatch(createPlan(data));
    console.log(data);
  };

  return (
    <div className="flex">
      <Header
        setSelectedMarker={setSelectedMarker}
        onSelectView={(view) => {
          setOverlayView(view);
          if (view === "popularSite") {
            setSelectedMarker(null); // ← reset to force ShowSites
          }
        }}
      />

      {overlayView !== "none" && (
        <Overlay>
          {overlayView === "showSite" && selectedMarker !== null && (
            <SiteCard
              key={`site-${selectedMarker}`} // force remount
              {...touristDestinations[selectedMarker]}
              onBack={() => setOverlayView("none")} //  back handler
            />
          )}

          {overlayView === "popularSite" && selectedMarker === null && (
            <PopularSites
              myloc={myloc}
              setNearByDestinations={setNearByDestinations}
              onBack={() => setOverlayView("none")}
              touristDestinations={touristDestinations}
            />
          )}

          {overlayView === "routePlanner" && (
            <RoutePlanner
              destinations={destinations}
              setDestinations={setDestinations}
              markerMode={markerMode}
              setMarkerMode={setMarkerMode}
              addDestinationMode={addDestinationMode}
              setAddDestinationMode={setAddDestinationMode}
              onBack={() => setOverlayView("none")}
            />
          )}
        </Overlay>
      )}

      <div className="w-full bg-green-400 relative">
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
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          nearByDestinations={nearByDestinations}
          tspOrder={tspOrder}
          setOverlayView={setOverlayView}
        />
        {/* Calculate TSP Button */}
        {togglePlanFormAndCalculateRoute ? (
          <button
            disabled={isLoading}
            onClick={() => {
              calculateTSPRoute();
              handletoggle();
            }}
            className="absolute top-3 right-16 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[1.2rem] shadow-lg"
          >
            {isLoading ? "Calculating..." : "Calculate Route"}
          </button>
        ) : (
          <button
            onClick={() => {
              setIsOpenPlanForm(true);
              // alert("Click")
            }}
            className="absolute top-3 right-16 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[1.2rem] shadow-lg"
          >
            Save Plan
          </button>
        )}
      </div>
      {
        // form overlay
        isOpenPlanForm && (
          <PlanFormCard
            isOpen={isOpenPlanForm}
            mode="create"
            onSubmit={handleSubmit}
            onClose={() => {
              setIsOpenPlanForm(false);
              handletoggle();
            }}
          />
        )
      }

      <Footer />
    </div>
  );
};

export default Home;
