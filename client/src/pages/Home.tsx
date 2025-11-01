import { useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";
import RoutePlanner from "../components/RoutePlanner";
import RouteSequenceModal from "../components/RouteSequenceModal";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import type {
  Location,
  TouristDestination,
  OverlayView,
  NearByDestinationType,
} from "../types/types";
import Header from "../components/Header";
import Overlay from "../components/Overlay";
import Footer from "../components/Footer";
import SiteCard from "../components/SiteCard";
import PopularSites from "../components/PopularSites";
import { Bike, Car, Footprints } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { fetchFavourites } from "../features/favourites";
import PlanFormCard from "../components/plan/PlanForm";
import { createPlan, updatePlan } from "../features/plan";
import type { PlanDestination } from "../types/plan.type";
import { mapOrderToId } from "../utils/helper";
import { planById } from "../apiHandle/plan";
import ManageYourPlan from "./ManageYourPlan";
import PlanCreationBanner from "../components/plan/PlanCreationBanner";

export interface PathSegment {
  path: [number, number][];
  cost: number;
  distance: number;
  fromIndex: number;
  toIndex: number;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

const Home = () => {
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
  const [touristDestinations, setTouristDestinations] = useState<
    TouristDestination[]
  >([]);
  const [touristDestinationsCoords, setTouristDestinationsCoords] = useState<
    Location[]
  >([]);
  const [markerMode, setMarkerMode] = useState<"none" | "start" | "end">(
    "none"
  );
  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [tspOrder, setTspOrder] = useState<number[]>([]);
  const [mode, setMode] = useState<"foot" | "motorbike" | "car">("foot");
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showAllSegments, setShowAllSegments] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [mapTarget, setMapTarget] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.user.id);
  
  // ✅ Ref to track if we're loading a plan (to prevent clearing paths)
  const isLoadingPlanRef = useRef(false);

  useEffect(() => {
    const getFavourites = async () => {
      if (userId) {
        const favourites = await dispatch(fetchFavourites(userId));
      }
    };
    getFavourites();
  }, [userId, dispatch]);

  useEffect(() => {
    const GetDestinations = async () => {
      try {
        const response = await fetch("/new_destinations.json");
        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }
        const touristDestinations: TouristDestination[] = await response.json();
        const coords = touristDestinations.map((d) => ({
          name: d.name,
          lat: d.coordinates?.lat,
          lon: d.coordinates?.lon,
        }));
        setTouristDestinations(touristDestinations);
        setTouristDestinationsCoords(coords);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    GetDestinations();
  }, []);

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

  // ✅ Only clear paths when manually changing destinations (not when loading a plan)
  useEffect(() => {
    if (isLoadingPlanRef.current) {
      console.log("Skipping path clear - loading plan");
      return;
    }
    
    console.log("Clearing paths due to destination change");
    setPathCoords([]);
    setPathSegments([]);
    setTspOrder([]);
    setCurrentSegmentIndex(0);
  }, [destinations]);

  /** ✅ Helper: add a destination with name and touristId */
  const addDestinationFromTourist = (
    lat: number,
    lon: number,
    name: string,
    touristId: number
  ) => {
    setDestinations((prev) => [...prev, { lat, lon, name, touristId }]);
  };

  const calculateTSPRoute = async () => {
    if (destinations.length < 2) {
      alert("Please add at least two destinations");
      return;
    }
    setIsLoading(true);

    const updatedDestinations = destinations.map((d: any) => ({
      lat: Number(d.lat),
      lon: Number(d.lon),
    }));
    try {
      const res = await axios.post("http://localhost:8080/api/map/solveTsp", {
        destinations: updatedDestinations,
        mode,
        costType: "time",
      });
      const {
        path,
        segments,
        tspOrder: order,
        totalCost,
        totalDistance,
      } = res.data;

      console.log("TSP Result:", res.data);

      if (totalCost === 0 || totalDistance === 0) {
        alert("Failed to calculate valid route between the selected destinations.");
      }

      const formDesintaion = mapOrderToId(destinations, order);
      setPlannedDestination(formDesintaion);

      setTotalCost(totalCost);
      setTotalDistance(totalDistance);
      if (!Array.isArray(path)) throw new Error("Invalid path");
      if (!Array.isArray(segments)) throw new Error("Invalid segments");
      setTspOrder(order);
      setPathCoords(path);
      setPathSegments(segments);
      setCurrentSegmentIndex(0);
      setShowAllSegments(true);
      setShowRouteModal(true);
    } catch (err) {
      console.error("Failed to calculate route:", err);
      alert("Failed to calculate TSP route");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async (
    name: string,
    type: "similar" | "nearby"
  ) => {
    try {
      const res = await axios.post("http://localhost:8080/api/map/recommend", {
        name,
        type,
      });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setRecommendations([]);
    }
  };

  const handleRecommendationClick = (
    lat: number,
    lon: number,
    name: string
  ) => {
    const destinationIndex = touristDestinations.findIndex(
      (dest) => dest.name === name
    );
    if (destinationIndex !== -1) {
      setSelectedMarker(destinationIndex);
      setMapTarget({ lat, lon });
      fetchRecommendations(name, "similar");
    }
  };

  useEffect(() => {
    if (selectedMarker !== null) {
      setOverlayView("showSite");
    }
  }, [selectedMarker]);

  // for update and view
  const { id } = useParams<{ id: string }>();
  const [planeame, setPlanName] = useState<string>("");

  // ✅ Load plan by ID with proper flag management
useEffect(() => {
  const getPlan = async () => {
    console.log("Fetching plan for id:", id);
    if (!id) return;
    
    isLoadingPlanRef.current = true;
    
    try {
      const res = await planById(id);
      const data = res?.data;
      console.log("Loaded plan:", data);

      setPlanName(data.planName);
      setFormMode("edit");

      // Map destination coordinates
      const des: Location[] = data.destinations.map((d: any) => ({
        touristId: d.id,
        id: d.id,
        name: d.name,
        lat: d.latitude,
        lon: d.longitude,
      }));
      console.log("Mapped destinations:", des);

      if (data.route) {
        const route = data.route;

        // ✅ CRITICAL FIX: Backend sends [lat, lon], keep it that way
        // The path from backend is already [lat, lon][]
        const pathCoords: [number, number][] = route.path;

        // Normalize segments - backend already sends [lat, lon]
        const normalizedSegments: PathSegment[] = (route.segments || []).map((seg: any) => ({
          path: seg.path, // Already [lat, lon][]
          cost: seg.costMinutes,
          distance: seg.distanceKm,
          fromIndex: seg.fromIndex,
          toIndex: seg.toIndex,
        }));

        // Set everything at once
        setDestinations(des);
        setPathCoords(pathCoords);
        setPathSegments(normalizedSegments);
        setTotalCost(route.totalCostMinutes);
        setTotalDistance(route.totalDistanceKm);
        setMode(route.mode);
        
        // Generate tspOrder from destination indices
        const tspOrder = des.map((_, index) => index);
        setTspOrder(tspOrder);

        setCurrentSegmentIndex(0);
        setShowAllSegments(true);
        setShowRouteModal(true);
      } else {
        setDestinations(des);
      }
    } catch (error) {
      console.error("Failed to fetch plan by ID:", error);
    } finally {
      setTimeout(() => {
        isLoadingPlanRef.current = false;
      }, 100);
    }
  };

  getPlan();
}, [id]);


useEffect(() => {
  console.log("MapView coordinate details:", {
    pathCoordsLength: pathCoords.length,
    segmentsLength: pathSegments.length,
    firstPathCoord: pathCoords[0],
    lastPathCoord: pathCoords[pathCoords.length - 1],
    firstSegment: pathSegments[0] ? {
      pathLength: pathSegments[0].path.length,
      firstCoord: pathSegments[0].path[0],
      lastCoord: pathSegments[0].path[pathSegments[0].path.length - 1]
    } : null,
    // Check if coordinates look valid (Kathmandu area)
    coordsValid: pathCoords.length > 0 && 
      pathCoords[0][0] > 27 && pathCoords[0][0] < 28 &&
      pathCoords[0][1] > 85 && pathCoords[0][1] < 86
  });
}, [pathCoords, pathSegments]);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isOpenPlanForm, setIsOpenPlanForm] = useState<boolean>(false);
  const [plannedDestination, setPlannedDestination] = useState<
    PlanDestination[]
  >([]);
  const navigate = useNavigate();

  const handleSubmit = async (planName: string) => {
    const desination = plannedDestination.slice(0, -1);
    const data = {
      name: planName,
      destinations: desination,
    };

    if (formMode === "edit") {
      await dispatch(updatePlan({ formData: data, id: id! }));
      setDestinations([]);
      setPlannedDestination([]);
      navigate("/");
    } else {
      await dispatch(createPlan(data));
      setDestinations([]);
      setPlannedDestination([]);
    }
  };

  const saveRoute = () => {
    setIsOpenPlanForm(true);
    setIsCreatingPlan(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Header
        setSelectedMarker={setSelectedMarker}
        onSelectView={(view) => {
          setOverlayView(view);
          if (view === "popularSite") {
            setSelectedMarker(null);
          }
        }}
      />

      {destinations.length !== 0 && (
        <button
          onClick={() => {
            setDestinations([]);
            navigate("/");
          }}
          className="bg-blue-600 drop-shadow-md shadow-black hover:bg-blue-400 fixed px-4 py-2 top-6 rounded-3xl z-1000 right-26 text-white"
        >
          Clear
        </button>
      )}

      {isCreatingPlan && (
        <PlanCreationBanner onBack={() => setIsCreatingPlan(false)} />
      )}

      {destinations.length === 1 && (
        <div className="absolute text-white text-lg bg-blue-600 font-bold flex justify-center items-center py-6 px-4 z-1000 top-24 left-1/2 -translate-x-1/2 rounded-lg">
          <p>Select at least 2 destinations</p>
        </div>
      )}

      {overlayView !== "none" && (
        <Overlay>
          {overlayView === "showSite" && selectedMarker !== null && (
            <SiteCard
              key={`site-${selectedMarker}`}
              {...touristDestinations[selectedMarker]}
              onBack={() => setOverlayView("none")}
              recommendations={recommendations}
              onRecommendationClick={handleRecommendationClick}
            />
          )}
          {overlayView === "popularSite" && selectedMarker === null && (
            <PopularSites
              myloc={myloc}
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
          {overlayView === "planner" && (
            <ManageYourPlan
              setOverlayView={setOverlayView}
              setIsCreatingPlan={setIsCreatingPlan}
              onBack={() => setOverlayView("none")}
            />
          )}
        </Overlay>
      )}

      {showRouteModal && pathSegments.length > 0 && (
        <RouteSequenceModal
          segments={pathSegments}
          destinations={destinations}
          touristDestinations={touristDestinations}
          tspOrder={tspOrder}
          totalDistance={totalDistance || 0}
          totalCost={totalCost || 0}
          onClose={() => setShowRouteModal(false)}
          currentSegmentIndex={currentSegmentIndex}
          setCurrentSegmentIndex={setCurrentSegmentIndex}
          showAllSegments={showAllSegments}
          setShowAllSegments={setShowAllSegments}
        />
      )}

      <div className="flex-1 relative">
        <MapView
          touristDestinations={touristDestinations}
          clickMarkers={clickMarkers}
          setClickMarkers={setClickMarkers}
          destinations={destinations}
          setDestinations={setDestinations}
          markerMode={markerMode}
          setMarkerMode={setMarkerMode}
          addDestinationMode={addDestinationMode}
          setAddDestinationMode={setAddDestinationMode}
          myloc={myloc}
          pathCoords={pathCoords}
          pathSegments={pathSegments}
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          nearByDestinations={nearByDestinations}
          tspOrder={tspOrder}
          setOverlayView={setOverlayView}
          currentSegmentIndex={currentSegmentIndex}
          showAllSegments={showAllSegments}
          fetchRecommendations={fetchRecommendations}
          mapTarget={mapTarget}
        />

        {/* Compact Floating Control Panel */}
        <div className="absolute top-4 right-12 z-[999] pointer-events-none">
          <div className="pointer-events-auto w-full flex flex-col items-end">
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="mb-3 bg-white hover:bg-gray-50 rounded-full shadow-lg p-3 transition-all border border-gray-200"
              title={showControls ? "Hide controls" : "Show controls"}
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showControls ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Collapsible Controls */}
            {showControls && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Transport Mode - Compact Pills */}
                <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex gap-1">
                  {(["foot", "motorbike", "car"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`p-2.5 rounded-full transition-all ${
                        mode === m
                          ? "bg-blue-600 hover:bg-blue-400 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title={m.charAt(0).toUpperCase() + m.slice(1)}
                    >
                      {m === "foot" && <Footprints size={18} />}
                      {m === "motorbike" && <Bike size={18} />}
                      {m === "car" && <Car size={18} />}
                    </button>
                  ))}
                </div>
                {/* Action Buttons - Stacked */}
                {destinations.length >= 2 && (
                  <button
                    disabled={isLoading}
                    onClick={calculateTSPRoute}
                    className="w-full bg-blue-600 hover:bg-blue-400 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                          />
                        </svg>
                        <span>Calculate Route</span>
                      </>
                    )}
                  </button>
                )}
                {pathSegments.length > 0 && (
                  <button
                    onClick={saveRoute}
                    className="w-full bg-blue-600 hover:bg-blue-400 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span>Save Route</span>
                  </button>
                )}
                {/* plan form during creation */}
                {isOpenPlanForm && formMode === "create" && (
                  <PlanFormCard
                    isOpen={isOpenPlanForm}
                    mode="create"
                    onSubmit={handleSubmit}
                    onClose={() => {
                      setPathCoords([]);
                      setTspOrder([]);
                      setIsOpenPlanForm(false);
                    }}
                  />
                )}
                {/* plan form during updation */}
                {isOpenPlanForm && formMode === "edit" && (
                  <PlanFormCard
                    mode="edit"
                    isOpen={isOpenPlanForm}
                    planeName={planeame}
                    onSubmit={handleSubmit}
                    onClose={() => {
                      setIsOpenPlanForm(false);
                      setPathCoords([]);
                      setTspOrder([]);
                    }}
                  />
                )}
                {pathSegments.length > 0 && (
                  <button
                    onClick={() => setShowRouteModal(true)}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span>View Route</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Minimal Trip Summary - Bottom */}
        {tspOrder.length > 0 &&
          totalCost !== null &&
          totalDistance !== null &&
          !showRouteModal && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-5 py-2.5 flex items-center gap-3 border border-gray-200/50 pointer-events-auto">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDuration(totalCost)}
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalDistance.toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Home;