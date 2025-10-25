import { useEffect, useState } from "react";
import CloseButton from "../ui/CloseButton";

// overlay for plan form
interface PlanFormProps {
  mode: "edit" | "create";
  isOpen: boolean;
  onSubmit: (data: string) => void;
  planeName?: string;
  onClose: () => void;
}

const PlanFormCard: React.FC<PlanFormProps> = ({
  mode = "create",
  isOpen,
  onSubmit,
  planeName,
  onClose,
}) => {
  const [planName, setPlanName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (planeName && mode === "edit") {
      setPlanName(planeName);
    } else {
      setPlanName("");
    }
  }, [planeName, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!planName.trim()) return;
    
    setIsSubmitting(true);
    try {
      onSubmit(planName.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md mx-4 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <CloseButton onClick={onClose} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            {mode === "create" ? "Create New Plan" : "Edit Plan"}
          </h2>
          <p className="text-sm text-gray-600 text-center mt-1">
            {mode === "create" 
              ? "Give your plan a memorable name" 
              : "Update your plan name"
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-700"
            >
              Plan Name
            </label>
            <input
              type="text"
              id="title"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Enter plan name..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-300 hover:bg-gray-400 hover:text-white rounded-xl transition-colors duration-200 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!planName.trim() || isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200 font-medium"
            >
              {isSubmitting 
                ? "Saving..." 
                : mode === "create" 
                  ? "Create Plan" 
                  : "Update Plan"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanFormCard;