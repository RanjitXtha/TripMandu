import { useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../app/store"
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAllPlans } from "../features/plan";
import PlanCard from "../components/plan/PlanCard";
import PlanDetailsModal from "../components/plan/PlanDetailModal";
import { useNavigate } from "react-router";
import { X, Plus, MapPin, Sparkles } from "lucide-react";
import type { OverlayView } from "../types/types";

const ManageYourPlan = ({ onBack, setIsCreatingPlan, setOverlayView }: { 
  onBack: () => void, 
  setIsCreatingPlan: React.Dispatch<React.SetStateAction<boolean>>, 
  setOverlayView: React.Dispatch<React.SetStateAction<OverlayView>> 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        await dispatch(getAllPlans());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [dispatch]);

  const { plan } = useSelector((state: RootState) => state.plan);

  const handleCreatePlan = () => {
    setIsCreatingPlan(true);
    setOverlayView("none");
    onBack();
  };

  const handleViewDetails = (planId: string, planName: string) => {
    setSelectedPlanId(planId);
    setSelectedPlanName(planName);
  };

  const handleViewOnMap = (planId: string) => {
    setSelectedPlanId(null);
    onBack();
    navigate(`/${planId}`);
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
        {/* Compact Header */}
        <div className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Title Section */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Travel Plans</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {plan.length === 0 
                      ? 'Ready to start your adventure?' 
                      : `${plan.length} ${plan.length === 1 ? 'plan' : 'plans'}`}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleCreatePlan}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02]"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>New Plan</span>
                </button>
                
                {onBack && (
                  <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl p-2.5 transition-all flex-shrink-0"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Constrained Width */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {isLoading ? (
            /* Loading Skeletons */
            <div className="space-y-4 sm:space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 p-4 sm:p-6 animate-pulse">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3 sm:space-y-4 flex-1">
                      <div className="h-5 sm:h-6 bg-gray-200 rounded-lg w-1/3"></div>
                      <div className="h-3 sm:h-4 bg-gray-100 rounded-lg w-2/3"></div>
                      <div className="h-3 sm:h-4 bg-gray-100 rounded-lg w-1/2"></div>
                    </div>
                    <div className="w-full sm:w-24 h-9 sm:h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : plan.length === 0 ? (
            /* Empty State */
            <div className="flex items-center justify-center py-12 sm:py-16 lg:py-24">
              <div className="text-center max-w-lg px-4">
                {/* Animated Icon */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent"></div>
                    <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 relative z-10" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Your Journey Starts Here
                </h3>
                <p className="text-gray-500 mb-8 sm:mb-10 leading-relaxed text-base sm:text-lg">
                  Create your first travel plan and discover the best routes to explore amazing destinations.
                </p>

                {/* CTA Button */}
                <button
                  onClick={handleCreatePlan}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl sm:rounded-2xl transition-all font-bold text-base sm:text-lg shadow-2xl shadow-blue-600/30 hover:shadow-3xl hover:shadow-blue-600/40 hover:scale-[1.02]"
                >
                  <Plus size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                  Create Your First Plan
                </button>

                {/* Features List */}
                <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Add Destinations</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Optimize Route</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Save & Share</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Plans List */
            <div className="space-y-4 sm:space-y-5">
              {plan.map(p => (
                <PlanCard 
                  key={p.id} 
                  plan={p} 
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plan Details Modal */}
      {selectedPlanId && (
        <PlanDetailsModal
          planId={selectedPlanId}
          planName={selectedPlanName}
          onClose={() => setSelectedPlanId(null)}
          onViewOnMap={handleViewOnMap}
        />
      )}
    </>
  );
};

export default ManageYourPlan;