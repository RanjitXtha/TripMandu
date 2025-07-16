import React, { useEffect } from "react";
import { reverseToName } from "../apiHandle/detination";
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
  useEffect(() => {
    async function fetchNames() {
      const updated = await Promise.all(
        destinations.map(async (dest) => {
          if (dest.name && dest.name.trim() !== "") return dest;

          try {
            const name = await reverseToName(dest.lat, dest.lon);
            return { ...dest, name };
          } catch {
            return dest;
          }
        })
      );

      // Only update if any name changed to avoid infinite loop
      const hasChanges = updated.some(
        (u, i) => u.name !== destinations[i].name
      );
      if (hasChanges) {
        setDestinations(updated);
      }
    }

    if (destinations.length > 0) {
      fetchNames();
    }
  }, [destinations, setDestinations]);

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
        <div className="text-lg font-semibold px-4 py-2">Route Planner</div>

        {/* Start */}
        <div className="mb-2 p-2 shadow-lg rounded-3xl">
          <strong>Start:</strong>
          <br />
          {destinations[0] ? (
            <>
              {destinations[0].name ||
                `${destinations[0].lat.toFixed(5)}, ${destinations[0].lon.toFixed(5)}`}
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

        {/* End */}
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

        {/* Add Destination Mode */}
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

        {/* Destination List */}
        <div className="mb-2 p-2 shadow-lg rounded-3xl">
          <strong>Destinations</strong>
          {destinations.length === 0 && <p>No destinations added yet.</p>}
          <ul className="mb-2">
            {destinations.map((d, i) => (
              <li
                key={i}
                className="relative mb-3 w-2/3 rounded-full m-auto bg-green-500 text-white px-4 py-1"
              >
                {d.name || `${d.lat.toFixed(5)}, ${d.lon.toFixed(5)}`}
                <button
                  className="absolute right-2 top-1 text-red-600 font-bold"
                  onClick={() => removeDestination(i)}
                >
                  ×
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
