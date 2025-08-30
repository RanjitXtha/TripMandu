import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { PlanSingle } from "../types/plan.type";
import { planById } from "../apiHandle/plan";
import { Eye } from "lucide-react";

const SinglePlan = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detailsPlan, setDetailsPlan] = useState<PlanSingle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPlan = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await planById(id);
        setDetailsPlan(res.data);
      } catch (error) {
        console.error("Failed to fetch plan by ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPlan();
  }, [id]);

  const handleClick = () => {
    if (id) {
      navigate(`/${id}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <div className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            to="/plan"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Plans
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Plan Details
            </h1>
            {detailsPlan && (
              <p className="text-black font-bold text-2xl capitalize">{detailsPlan.planName}</p>
            )}
          </div>
          {detailsPlan && (
            <button
              onClick={handleClick}
              className="mt-4 md:mt-0 inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition-colors duration-200 font-medium text-sm"
            >
              <span className="mr-2"> <Eye /></span> View Plan
            </button>
          )}
        </div>

        {/* Plan Content */}
        <div>
          {isLoading ? (
            // Skeleton Loader
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 animate-pulse"
                >
                  <div className="h-40 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-6 bg-gray-300 rounded-lg w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
              ))}
            </div>
          ) : !detailsPlan ? (
            // Empty State
            <div className="text-center py-16">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Plan Found
                </h3>
                <p className="text-gray-500 mb-6">
                  The requested plan could not be found or was deleted.
                </p>
                <Link
                  to="/create-plan"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 font-medium"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create a Plan
                </Link>
              </div>
            </div>
          ) : (
            // Destinations Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {detailsPlan.destinations
                .sort((a, b) => a.order - b.order)
                .map((d) => (
                  <div
                    key={d.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                        <h3 className="text-white text-lg font-semibold">
                          {d.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <p className="text-sm text-gray-700 mb-2">
                        {d.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          Stop #{d.order + 1}
                        </span>
                        <span className="text-gray-500">
                          {/* Any thing extra */}
                        </span>
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

export default SinglePlan;
