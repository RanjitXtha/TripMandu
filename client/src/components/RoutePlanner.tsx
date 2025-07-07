import { marker } from "leaflet";
import type { Location } from "../types/types";

interface RoutePlannerProps {
  destinations: Location[];
  setDestinations: React.Dispatch<React.SetStateAction<Location[]>>;
  markerMode: "none" | "start" | "end";
  setMarkerMode: (mode: "none" | "start" | "end") => void;
  addDestinationMode: boolean;
  setAddDestinationMode: (val: boolean) => void;
}

const RoutePlanner = ({
  destinations,
  setDestinations,
  markerMode,
  setMarkerMode,
  addDestinationMode,
  setAddDestinationMode,
}: RoutePlannerProps) => {
  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const clearStart = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(1) : prev));
  };

  const clearEnd = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  return (
    <div className="w-[300px]">
      <div className="flex-col overflow-y-auto p-2 text-center">
        <div className="text-lg font-semibold px-4 py-2 ">Route Planner</div>
        <div className="mb-2 p-2 shadow-lg rounded-3xl">
          <strong>Start:</strong>
          <br />
          {destinations[0] ? (
            <>
              {destinations[0].name ||
                `${destinations[0].lat.toFixed(
                  5
                )}, ${destinations[0].lon.toFixed(5)}`}
              <br />

              <button
                className="mb-2 mr-2 mt-4 text-sm px-4 py-2 rounded-full font-medium bg-black text-white"
                onClick={clearStart}
              >
                Clear Start
              </button>
            </>
          ) : (
            <em className="mr-2">Not Set</em>
          )}
          
          <button
            className={`mb-2 text-sm px-4 py-2 font-medium border rounded-full ${
              markerMode === "start" ? "bg-black text-white" : ""
            }`}
            onClick={() => setMarkerMode("start")}
          >
            Set from Map
          </button>
        </div>

        <div className="mb-2 p-2 shadow-lg rounded-3xl">
          <strong>End:</strong>
          <br />
          {destinations.length > 1 ? (
            <>
              {destinations[destinations.length - 1].name ||
                `${destinations[destinations.length - 1].lat.toFixed(
                  5
                )}, ${destinations[destinations.length - 1].lon.toFixed(5)}`}
              <br />
              <button
                className="mb-2 mr-2 mt-4 text-sm px-4 py-2 rounded-full font-medium bg-black text-white"
                onClick={clearEnd}
              >
                Clear End
              </button>
            </>
          ) : (
            <em className="mr-2">Not set</em>
          )}
        
          <button
            className={`mb-2 text-sm px-4 py-2 font-medium border rounded-full ${
              markerMode === "end" ? "bg-black text-white" : ""
            }`}
            onClick={() => setMarkerMode("end")}
          >
            Set from Map
          </button>
        </div>

        <div className="mb-2">
          <button
            className={`${
              addDestinationMode
                ? "bg-green-500 border-green-500 text-white rounded"
                : "border rounded"
            } px-4 py-2 rounded`}
            onClick={() => setAddDestinationMode(!addDestinationMode)}
          >
            {addDestinationMode
              ? "Add Destinations Mode ON"
              : "Add Destinations Mode OFF"}
          </button>
        </div>

        <div className="mb-2 p-2 shadow-lg rounded-3xl">
          <strong>Destinations</strong>
          {destinations.length === 0 && <p>No destinations added yet.</p>}
          <ul className="mb-2 ">
            {destinations.map((d, i) => (
              <li
                key={i}
                className="mb-3  w-2/3 rounded-full m-auto bg-green-500 text-white"
              >
                {d.name || `${d.lat.toFixed(5)}, ${d.lon.toFixed(5)}`}
                <button
                  className="absolute right-4 text-red-600"
                  onClick={() => removeDestination(i)}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
