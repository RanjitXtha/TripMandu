import { X, MapPin, Navigation, Eye, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import type { PlanSingle } from "../../types/plan.type";
import { planById } from "../../apiHandle/plan";

interface PlanDetailsModalProps {
  planId: string;
  planName: string;
  onClose: () => void;
  onViewOnMap: (planId: string) => void;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  planId,
  planName,
  onClose,
  onViewOnMap,
}) => {
  const [detailsPlan, setDetailsPlan] = useState<PlanSingle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPlan = async () => {
      try {
        setIsLoading(true);
        const res = await planById(planId);
        setDetailsPlan(res.data);
      } catch (error) {
        console.error("Failed to fetch plan by ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPlan();
  }, [planId]);

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 flex-shrink-0">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{planName}</h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {detailsPlan ? `${detailsPlan.destinations.length} destination${detailsPlan.destinations.length !== 1 ? 's' : ''}` : 'Loading...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {detailsPlan && (
                <button
                  onClick={() => onViewOnMap(planId)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-xs sm:text-sm shadow-sm hover:shadow-md"
                >
                  <Eye size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">View on Map</span>
                  <span className="xs:hidden">View</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl p-2 transition-all"
                aria-label="Close"
              >
                <X size={20} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {isLoading ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-200">
                  <div className="h-40 sm:h-48 bg-gray-200"></div>
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-3 sm:h-4 bg-gray-100 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !detailsPlan ? (
            // Error State
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Failed to Load Plan</h3>
              <p className="text-sm sm:text-base text-gray-500">Please try again later.</p>
            </div>
          ) : detailsPlan.destinations.length === 0 ? (
            // Empty State
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Destinations</h3>
              <p className="text-sm sm:text-base text-gray-500">This plan doesn't have any destinations yet.</p>
            </div>
          ) : (
            // Destinations Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {detailsPlan.destinations
                .sort((a, b) => a.order - b.order)
                .map((d, index) => (
                  <div
                    key={index}
                    className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 sm:px-4 py-2 sm:py-3">
                        <h3 className="text-white text-sm sm:text-base font-bold leading-tight line-clamp-2">
                          {d.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-1 leading-relaxed">
                        {d.description || "No description available."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-green-50 text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold">
                          <Navigation size={10} className="sm:w-3 sm:h-3" />
                          Stop #{index + 1}
                        </span>
                        <div className="text-xs text-gray-400 font-medium">
                          {index + 1} of {detailsPlan.destinations.length}
                        </div>
                      </div>
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

export default PlanDetailsModal;