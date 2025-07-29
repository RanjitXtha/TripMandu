import { ArrowBigRight, Eye, Trash2 } from "lucide-react";
import type { Plan } from "../../types/plan.type";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import type { AppDispatch } from "../../app/store";
import { deltePlanById } from "../../features/plan";


interface PlanProps {
  plan: Plan;
}

const PlanCard: React.FC<PlanProps> = ({ plan }) => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

   const handleDelete = () => {
    dispatch(deltePlanById(plan.id));
    console.log("Deleting id: ", plan.id)
  };

  const handleView = () => {
    navigate(`/plan/${plan.id}`);
  };
  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4">
      {/* Header: Name + Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
        <div className="flex gap-2">
          <button
            
            className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={handleView}
          >
            <Eye size={18} /> View
          </button>
          <button
       
            className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      {/* Destination Path */}
      <div className="flex items-center flex-wrap gap-3">
        {[...plan.destinations]
          .sort((a, b) => a.order - b.order)
          .map((d, index, arr) => (
            <div key={d.id} className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium shadow-sm">
                {d.destination.name}
              </div>
              {index < arr.length - 1 && (
                <ArrowBigRight className="text-gray-400" />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default PlanCard;
