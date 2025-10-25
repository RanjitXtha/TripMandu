import { ArrowRight, Eye, Trash2, MapPin, Navigation, ChevronDown } from "lucide-react";
import type { Plan } from "../../types/plan.type";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { deltePlanById } from "../../features/plan";
import { useState } from "react";

interface PlanProps {
  plan: Plan;
  onViewDetails: (planId: string, planName: string) => void;
}

const PlanCard: React.FC<PlanProps> = ({ plan, onViewDetails }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      setIsDeleting(true);
      await dispatch(deltePlanById(plan.id));
    }
  };

  const sortedDestinations = [...plan.destinations].sort((a, b) => a.order - b.order);
  const destinationCount = sortedDestinations.length;
  const PREVIEW_COUNT = 3;
  const hasMore = destinationCount > PREVIEW_COUNT;
  const displayedDestinations = isExpanded ? sortedDestinations : sortedDestinations.slice(0, PREVIEW_COUNT);

  return (
    <div 
      className={`group w-full bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Header Section */}
      <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Plan Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{plan.name}</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 ml-10.5">
              <Navigation size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>{destinationCount} {destinationCount === 1 ? 'stop' : 'stops'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(plan.id, plan.name)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-xs sm:text-sm"
            >
              <Eye size={14} />
              <span>View</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-lg transition-all font-medium text-xs sm:text-sm"
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Path - Compact Version */}
      <div className="px-4 sm:px-5 py-3">
        {destinationCount === 0 ? (
          /* Empty State */
          <div className="text-center py-4 text-gray-400">
            <MapPin className="w-5 h-5 mx-auto mb-1.5 opacity-50" />
            <p className="text-xs">No destinations added</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Destinations List */}
            <div className="flex items-center flex-wrap gap-1.5">
              {displayedDestinations.map((d, index, arr) => (
                <div key={d.id} className="flex items-center gap-1.5">
                  {/* Compact Badge */}
                  <div className="relative group/badge">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors cursor-default">
                      <div className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="max-w-[100px] sm:max-w-[140px] truncate">{d.destination.name}</span>
                    </div>
                    
                    {/* Tooltip on hover */}
                    {d.destination.name.length > 15 && (
                      <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        {d.destination.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5"></div>
                      </div>
                    )}
                  </div>

                  {/* Compact Arrow */}
                  {index < displayedDestinations.length - 1 && (
                    <ArrowRight className="text-gray-300 flex-shrink-0" size={14} strokeWidth={2} />
                  )}
                </div>
              ))}
              
              {/* Show More Indicator */}
              {!isExpanded && hasMore && (
                <span className="text-xs text-gray-400 font-medium">
                  +{destinationCount - PREVIEW_COUNT} more
                </span>
              )}
            </div>

            {/* Expand/Collapse Button */}
            {hasMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 hover:bg-blue-50 rounded-md transition-colors"
              >
                <span>{isExpanded ? 'Show less' : `Show all ${destinationCount} stops`}</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard;