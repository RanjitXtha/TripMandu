import { X, MapPin, Navigation, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
  }, [destinations.length]);

  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const clearStart = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(1) : prev));
  };

  const clearEnd = () => {
    setDestinations((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setDestinations((prev) => {
      const newDestinations = [...prev];
      [newDestinations[index - 1], newDestinations[index]] = [
        newDestinations[index],
        newDestinations[index - 1],
      ];
      return newDestinations;
    });
  };

  const moveDown = (index: number) => {
    if (index === destinations.length - 1) return;
    setDestinations((prev) => {
      const newDestinations = [...prev];
      [newDestinations[index], newDestinations[index + 1]] = [
        newDestinations[index + 1],
        newDestinations[index],
      ];
      return newDestinations;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setDestinations((prev) => {
      const newDestinations = [...prev];
      const [draggedItem] = newDestinations.splice(draggedIndex, 1);
      newDestinations.splice(dropIndex, 0, draggedItem);
      return newDestinations;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
            <div className="bg-green-50 rounded-lg p-3 mb-2 border-2 border-green-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {startDest.name || "Custom Location"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {startDest.lat.toFixed(5)}, {startDest.lon.toFixed(5)}
                  </p>
                </div>
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  S
                </div>
              </div>
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
            <div className="bg-red-50 rounded-lg p-3 mb-2 border-2 border-red-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {endDest.name || "Custom Location"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {endDest.lat.toFixed(5)}, {endDest.lon.toFixed(5)}
                  </p>
                </div>
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  E
                </div>
              </div>
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
            {destinations.length > 0 && (
              <span className="text-xs text-gray-500">Drag to reorder</span>
            )}
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
                  draggable
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg p-3 border-2 transition-all group cursor-move ${
                    draggedIndex === i
                      ? "opacity-50 scale-95"
                      : dragOverIndex === i
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Drag Handle */}
                    <div className="pt-1 flex-shrink-0">
                      <GripVertical size={16} className="text-gray-400 group-hover:text-gray-600" />
                    </div>

                    {/* Number Badge */}
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>

                    {/* Destination Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {d.name || "Custom Location"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.lat.toFixed(5)}, {d.lon.toFixed(5)}
                      </p>
                    </div>

                    {/* Up/Down Buttons */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded hover:bg-gray-100 transition"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDown(i)}
                        disabled={i === destinations.length - 1}
                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded hover:bg-gray-100 transition"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Delete Button */}
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