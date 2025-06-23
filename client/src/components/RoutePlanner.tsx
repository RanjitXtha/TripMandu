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
    <div className="flex-col overflow-y-auto ">
      <div className="p-2 text-center">
        <div className="text-lg font-semibold px-4 py-2 ">Route Planner</div>
        <div className="mb-2">
          <strong>Start:</strong>
          <br />
          {destinations[0] ? (
            <>
              {destinations[0].name ||
                `${destinations[0].lat.toFixed(
                  5
                )}, ${destinations[0].lon.toFixed(5)}`}
              <br />
              <button onClick={clearStart}>Clear Start</button>
            </>
          ) : (
            <em>Not Set</em>
          )}
          <br />
          <button onClick={() => setMarkerMode("start")}>Set from Map</button>
        </div>

        <div className="mb-2">
          <strong>End:</strong>
          <br />
          {destinations.length > 1 ? (
            <>
              {destinations[destinations.length - 1].name ||
                `${destinations[destinations.length - 1].lat.toFixed(
                  5
                )}, ${destinations[destinations.length - 1].lon.toFixed(5)}`}
              <br />
              <button onClick={clearEnd}>Clear End</button>
            </>
          ) : (
            <em>Not set</em>
          )}
          <br />
          <button onClick={() => setMarkerMode("end")}>Set from Map</button>
        </div>

        <div className="mb-2">
          <button
            className={`${
              addDestinationMode ? "bg-green-500 text-white" : ""
            } px-4 py-2 rounded`}
            onClick={() => setAddDestinationMode(!addDestinationMode)}
          >
            {addDestinationMode
              ? "Add Destinations Mode ON"
              : "Add Destinations Mode OFF"}
          </button>
        </div>

        <div className="mb-2">
          <h3>Destinations</h3>
          {destinations.length === 0 && <p>No destinations added yet.</p>}
          <ul className="pl-2">
            {destinations.map((d, i) => (
              <li key={i} className="mb-3">
                {d.name || `${d.lat.toFixed(5)}, ${d.lon.toFixed(5)}`}
                <button
                  className="ml-8 text-red-600"
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
