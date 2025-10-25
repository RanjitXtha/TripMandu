import { X, MapPin } from "lucide-react";

interface PlanCreationBannerProps {
  onBack: () => void;
  destinationCount?: number;
}

const PlanCreationBanner = ({ 
  onBack, 
  destinationCount = 0 
}: PlanCreationBannerProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="bg-white border border-blue-200 rounded-xl shadow-lg pointer-events-auto overflow-hidden">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Creating New Plan</h3>
                  <p className="text-blue-50 text-xs">
                    {destinationCount > 0 
                      ? `${destinationCount} destination${destinationCount > 1 ? 's' : ''} added`
                      : 'Add destinations to begin'}
                  </p>
                </div>
              </div>
              <button
                onClick={onBack}
                className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                title="Cancel"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>
          
          {/* Compact Progress Steps - All Blue */}
          <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50">
            <div className="flex items-center justify-center gap-2">
              {/* Step 1 */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white text-blue-600">
                  <span>1</span>
                </div>
                <span className="font-medium text-xs whitespace-nowrap">Add Destinations</span>
              </div>

              {/* Connector */}
              <div className="h-0.5 w-8 bg-blue-600"></div>

              {/* Step 2 */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white text-blue-600">
                  <span>2</span>
                </div>
                <span className="font-medium text-xs whitespace-nowrap">Calculate Route</span>
              </div>

              {/* Connector */}
              <div className="h-0.5 w-8 bg-blue-600"></div>

              {/* Step 3 */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white text-blue-600">
                  <span>3</span>
                </div>
                <span className="font-medium text-xs whitespace-nowrap">Save Plan</span>
              </div>
            </div>
          </div>

          {/* Compact Helpful Tip */}
          <div className="px-5 py-2 bg-blue-50/50 border-t border-blue-100">
            <p className="text-xs text-blue-900 text-center">
              Click on tourist spots or add custom locations to your plan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCreationBanner;
