import { useState } from "react";
import type { PathSegment } from "../pages/Home";
import type { Location, TouristDestination } from "../types/types";

interface RouteSequenceModalProps {
  segments: PathSegment[];
  destinations: Location[];
  touristDestinations: TouristDestination[];
  tspOrder: number[];
  totalDistance: number;
  totalCost: number;
  onClose: () => void;
  currentSegmentIndex: number;
  setCurrentSegmentIndex: (index: number) => void;
  showAllSegments: boolean;
  setShowAllSegments: (show: boolean) => void;
}

const getSegmentColor = (index: number, total: number) => {
  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#84CC16",
  ];
  
  if (total <= colors.length) {
    return colors[index % colors.length];
  }
  
  const hue = (index / total) * 360;
  return `hsl(${hue}, 70%, 55%)`;
};

const RouteSequenceModal = ({
  segments,
  destinations,
  touristDestinations,
  tspOrder,
  totalDistance,
  totalCost,
  onClose,
  currentSegmentIndex,
  setCurrentSegmentIndex,
  showAllSegments,
  setShowAllSegments,
}: RouteSequenceModalProps) => {
  
  const getDestinationName = (index: number) => {
    
    const dest = destinations[index];
    if (!dest) return `Stop ${index + 1}`;
    
   if(dest.name){
    return dest.name;
   }
    return `Stop ${index + 1}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const handlePrevious = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
    }
  };

  const currentSegment = segments[currentSegmentIndex];

  return (
    <div className="fixed right-6 top-20 bottom-6 w-[360px] flex items-stretch z-[500] pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden pointer-events-auto border border-gray-100">
        {/* Compact Header */}
        <div className="bg-gradient-to-br border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Route Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Trip Summary - Compact */}
          <div className="flex items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-900">{formatDuration(totalCost)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-semibold text-gray-900">{totalDistance.toFixed(1)} km</span>
            </div>
          </div>

          {/* View Toggle - Pills */}
          <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setShowAllSegments(true)}
              className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                showAllSegments
                  ? "bg-blue-600 text-white shadow-sm": "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Steps
            </button>
            <button
              onClick={() => setShowAllSegments(false)}
              className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                !showAllSegments
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Step-by-Step
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showAllSegments ? (
            /* All Steps View - Cleaner Cards */
            <div className="p-4 space-y-2">
              {segments.map((segment, index) => {
                const color = getSegmentColor(index, segments.length);
                const fromName = getDestinationName(segment.fromIndex);
                const toName = getDestinationName(segment.toIndex);

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setShowAllSegments(false);
                      setCurrentSegmentIndex(index);
                    }}
                    className="w-full bg-white hover:shadow-md border border-gray-200 hover:border-gray-300 rounded-xl p-3 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Step Number - Smaller */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {index + 1}
                      </div>

                      {/* Route Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{fromName}</p>
                          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <p className="text-sm font-semibold text-gray-900 truncate">{toName}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="font-medium">{segment.distance.toFixed(1)} km</span>
                          <span>•</span>
                          <span className="font-medium">{formatDuration(segment.cost)}</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition flex-shrink-0 mt-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Single Step View - Enhanced Design */
            <div className="p-5 space-y-5">
              {/* Step Indicator - More Prominent */}
              <div className="text-center">
                <div
                  className="inline-flex w-16 h-16 rounded-full items-center justify-center text-white font-bold text-2xl shadow-lg mb-2"
                  style={{ backgroundColor: getSegmentColor(currentSegmentIndex, segments.length) }}
                >
                  {currentSegmentIndex + 1}
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Step {currentSegmentIndex + 1} of {segments.length}
                </p>
              </div>

              {/* Route Display - Modern Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="space-y-3">
                  {/* From */}
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0 shadow-sm"></div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Starting Point</p>
                      <p className="text-base font-bold text-gray-900 leading-tight">
                        {getDestinationName(currentSegment.fromIndex)}
                      </p>
                    </div>
                  </div>

                  {/* Divider with animation */}
                  <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  {/* To */}
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0 shadow-sm"></div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Destination</p>
                      <p className="text-base font-bold text-gray-900 leading-tight">
                        {getDestinationName(currentSegment.toIndex)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats - Refined Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-xs font-bold text-blue-700 uppercase">Distance</p>
                  </div>
                  <p className="text-2xl font-black text-blue-900">{currentSegment.distance.toFixed(1)}</p>
                  <p className="text-xs text-blue-700 font-medium">kilometers</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs font-bold text-green-700 uppercase">Duration</p>
                  </div>
                  <p className="text-2xl font-black text-green-900">{Math.round(currentSegment.cost)}</p>
                  <p className="text-xs text-green-700 font-medium">minutes</p>
                </div>
              </div>

              {/* Progress Bar - Enhanced */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-600">Route Progress</span>
                  <span className="font-bold text-gray-900">{Math.round(((currentSegmentIndex + 1) / segments.length) * 100)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full shadow-sm"
                    style={{ width: `${((currentSegmentIndex + 1) / segments.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center text-gray-500">
                  {currentSegmentIndex + 1} of {segments.length} steps completed
                </p>
              </div>

              {/* Navigation Buttons - Modern Style */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentSegmentIndex === 0}
                  className="flex-1 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 border-2 border-gray-200 disabled:border-gray-100 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentSegmentIndex === segments.length - 1}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="text-sm">Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteSequenceModal;