import { useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../app/store"
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAllPlans } from "../features/plan";
import PlanCard from "../components/plan/PlanCard";
import { Link } from "react-router";

const ManageYourPlan = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <div className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Map
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Manage Your Plans
          </h1>
          <p className="text-gray-600">
            View, edit, and organize all your travel plans in one place
          </p>
        </div>

        {/* Plans Section */}
        <div className="space-y-6">
          {/* Plans Grid/List */}
          {isLoading ? (
            <div className="grid gap-4 md:gap-6">
              {/* Loading Skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="h-6 bg-gray-300 rounded-xl w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                    </div>
                    <div className="w-24 h-10 bg-gray-300 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : plan.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Plans Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start planning your next adventure by creating your first travel plan.
                </p>
                <Link 
                  to="/" 
                  className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Plan
                </Link>
              </div>
            </div>
          ) : (
            /* Plans List */
            <div className="space-y-4">
              <div className="flex items-center justify-end mb-2">
                <Link 
                  to="/" 
                  className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 font-medium text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Plan
                </Link>
              </div>
              
              <div className="grid gap-4 md:gap-6">
                {plan.map(p => (
                  <PlanCard key={p.id} plan={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Section Placeholder */}
       
      </div>
    </div>
  );
};

export default ManageYourPlan;