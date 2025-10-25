import { ArrowRight, Eye, Trash2, MapPin, Calendar, Navigation } from "lucide-react";
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

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      setIsDeleting(true);
      await dispatch(deltePlanById(plan.id));
      console.log("Deleting id: ", plan.id);
    }
  };

  const sortedDestinations = [...plan.destinations].sort((a, b) => a.order - b.order);
  const destinationCount = sortedDestinations.length;

  return (
    <div className={`group w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between gap-4">
          {/* Plan Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 truncate">{plan.name}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 ml-13">
              <div className="flex items-center gap-1.5">
                <Navigation size={14} />
                <span>{destinationCount} {destinationCount === 1 ? 'stop' : 'stops'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onViewDetails(plan.id, plan.name)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow-md"
            >
              <Eye size={16} />
              View
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-xl transition-all font-medium text-sm"
              disabled={isDeleting}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Path */}
      <div className="px-6 py-5">
        <div className="flex items-center flex-wrap gap-2">
          {sortedDestinations.map((d, index, arr) => (
            <div key={d.id} className="flex items-center gap-2">
              {/* Destination Badge */}
              <div className="relative group/badge">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-900 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-default">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="max-w-[200px] truncate">{d.destination.name}</span>
                </div>
                
                {/* Tooltip on hover */}
                {d.destination.name.length > 25 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.destination.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
                  </div>
                )}
              </div>

              {/* Arrow */}
              {index < arr.length - 1 && (
                <ArrowRight className="text-gray-400 flex-shrink-0" size={20} strokeWidth={2.5} />
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {destinationCount === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No destinations added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard;