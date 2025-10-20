import { X, MapPin, Navigation, Plus, Trash2, Map as MapIcon } from "lucide-react";
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
  onBack?: () => void;
}

const RoutePlanner = ({
  destinations,
  setDestinations,
  markerMode,
  setMarkerMode,
  addDestinationMode,
  setAddDestinationMode,
  onBack,
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

  const startDest = destinations[0];
  const endDest = destinations.length > 1 ? destinations[destinations.length - 1] : null;

  return (
    <div className="w-[380px] max-w-[95vw] h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
        <div className="flex items-center gap-3">
          <Navigation size={20} className="text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">Route Planner</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Start Location */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Location</label>
          
          {startDest ? (
            <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {startDest.name || "Custom Location"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {startDest.lat.toFixed(5)}, {startDest.lon.toFixed(5)}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-2 border border-dashed border-gray-300 text-center">
              <p className="text-sm text-gray-400">Not set</p>
            </div>
          )}

          <div className="flex gap-2">
            {startDest && (
              <button
                onClick={clearStart}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition border border-gray-300 text-sm"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setMarkerMode(markerMode === "start" ? "none" : "start")}
              className={`flex-1 font-medium py-2 rounded-lg transition text-sm ${
                markerMode === "start"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {markerMode === "start" ? "Click on Map..." : "Set from Map"}
            </button>
          </div>
        </div>

        {/* End Location */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">End Location</label>
          
          {endDest ? (
            <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {endDest.name || "Custom Location"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {endDest.lat.toFixed(5)}, {endDest.lon.toFixed(5)}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-2 border border-dashed border-gray-300 text-center">
              <p className="text-sm text-gray-400">Not set</p>
            </div>
          )}

          <div className="flex gap-2">
            {endDest && (
              <button
                onClick={clearEnd}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition border border-gray-300 text-sm"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setMarkerMode(markerMode === "end" ? "none" : "end")}
              className={`flex-1 font-medium py-2 rounded-lg transition text-sm ${
                markerMode === "end"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {markerMode === "end" ? "Click on Map..." : "Set from Map"}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Add Custom Markers Toggle */}
        <button
          onClick={() => setAddDestinationMode(!addDestinationMode)}
          className={`w-full font-medium py-3 rounded-lg transition flex items-center justify-center gap-2 ${
            addDestinationMode
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Plus size={18} />
          <span>
            {addDestinationMode
              ? "Adding Markers..."
              : "Add Custom Markers"}
          </span>
        </button>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Destinations List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">
              All Destinations ({destinations.length})
            </label>
          </div>

          {destinations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No destinations added</p>
            </div>
          ) : (
            <div className="space-y-2">
              {destinations.map((d, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {d.name || "Custom Location"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.lat.toFixed(5)}, {d.lon.toFixed(5)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeDestination(i)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;