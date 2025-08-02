import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { PlanSingle } from "../types/plan.type";
import { planById } from "../apiHandle/plan";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SinglePlan = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detailsPlan, setDetailsPlan] = useState<PlanSingle | null>(null);

  useEffect(() => {
    const getPlan = async () => {
      if (!id) return;
      try {
        const res = await planById(id);
        setDetailsPlan(res.data);
      } catch (error) {
        console.error("Failed to fetch plan by ID:", error);
      }
    };

    getPlan();
  }, [id]);


  const handleClick = () => {
    if(id) {
      navigate(`/${id}`);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50flex flex-col">
      {/* Header */}
      <div className="w-full p-4 bg-gray-300">
        <Link to="/" className="text-3xl">Map</Link>
      </div>
     <div className="px-6 py-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Plan Details</h1>
          {detailsPlan && (
            <p className="text-lg text-blue-600 mt-1">{detailsPlan.planName}</p>
          )}
        </div>
        <button
        onClick={() => handleClick()}
         className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition">
          ✏️ View Plan
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!detailsPlan ? (
          <div className="text-center text-gray-600 text-lg">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {detailsPlan.destinations
              .sort((a, b) => a.order - b.order)
              .map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                      <h3 className="text-white text-lg font-semibold">{d.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <p className="text-sm text-gray-700 mb-2">{d.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        Stop #{d.order + 1}
                      </span>
                      <span className="text-gray-500">
                        {/* for date if avilable */}
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
