import { X, ArrowRight, MapPin, Navigation, Eye } from "lucide-react";
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">{planName}</h2>
                <p className="text-sm text-gray-500">
                  {detailsPlan ? `${detailsPlan.destinations.length} destinations` : 'Loading...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {detailsPlan && (
                <button
                  onClick={() => onViewOnMap(planId)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow-md"
                >
                  <Eye size={16} />
                  View on Map
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl p-2.5 transition-all"
              >
                <X size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !detailsPlan ? (
            // Error State
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Plan</h3>
              <p className="text-gray-500">Please try again later.</p>
            </div>
          ) : (
            // Destinations Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {detailsPlan.destinations
                .sort((a, b) => a.order - b.order)
                .map((d, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 py-3">
                        <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">
                          {d.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                        {d.description || "No description available."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          <Navigation size={12} />
                          Stop #{index + 1}
                        </span>
                        {index < detailsPlan.destinations.length - 1 && (
                          <ArrowRight className="text-gray-400" size={16} />
                        )}
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