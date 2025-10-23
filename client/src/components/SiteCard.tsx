import { X, MapPin, Heart } from "lucide-react";
import React from "react";
import type { TouristDestination } from "../types/types";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { addFavourite, removeFavourite } from "../features/favourites"; // <-- added removeFavourite

interface Recommendation {
  name: string;
  description: string;
  image: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  distanceKm: number;
  similarityScore: number;
}

interface SiteCardProps extends TouristDestination {
  onBack?: () => void;
  recommendations?: Recommendation[];
  onRecommendationClick?: (lat: number, lon: number, name: string) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({
  description,
  image,
  name,
  id,
  onBack,
  recommendations = [],
  onRecommendationClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.user.id);
  const favourites = useSelector((state: RootState) => state.favourites.items);
  const isAlreadyFavourited = favourites.includes(Number(id));

  const handleFavouriteClick = () => {
    if (!userId) return;

    if (isAlreadyFavourited) {
      dispatch(removeFavourite({ userId, destinationId: Number(id) }));
    } else {
      dispatch(addFavourite({ userId, destinationId: Number(id) }));
    }
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    if (onRecommendationClick) {
      onRecommendationClick(rec.coordinates.lat, rec.coordinates.lon, rec.name);
    }
  };

  return (
    <div className="w-full max-w-[30rem] h-full flex flex-col bg-white overflow-hidden">
      {/* Header with Image */}
      <div className="relative">
        <img src={image} alt={name} className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Close Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            aria-label="Close"
          >
            <X size={18} className="text-gray-700" />
          </button>
        )}

        {/* Favourite Button */}
        <button
          onClick={handleFavouriteClick}
          className={`absolute top-4 left-4 p-2 rounded-full transition-all shadow-lg ${
            isAlreadyFavourited
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-700"
          }`}
          aria-label="Favorite"
        >
          <Heart size={18} fill={isAlreadyFavourited ? "currentColor" : "none"} />
        </button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <MapPin size={14} />
            <span>Tourist Destination</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            About
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>

        {recommendations && recommendations.length > 0 && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Similar Places
              </h3>
              <span className="text-xs text-gray-400">
                {recommendations.length} nearby
              </span>
            </div>

            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <button
                  key={index}
                  onClick={() => handleRecommendationClick(rec)}
                  className="w-full bg-white hover:bg-gray-50 rounded-lg p-3 transition-all cursor-pointer border border-gray-200 hover:border-gray-300 hover:shadow-sm text-left"
                >
                  <div className="flex gap-3">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {rec.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin size={12} />
                        <span>{rec.distanceKm.toFixed(2)} km away</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteCard;
