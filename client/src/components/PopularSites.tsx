import React, { useEffect, useState } from "react";
import { X, MapPin, Sparkles, TrendingUp, Tag, Heart } from "lucide-react";
import type { TouristDestination } from "../types/types";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import SiteCard from "./SiteCard"; // ✅ Reuse your SiteCard

interface Recommendation {
  id: number;
  name: string;
  description: string;
  image: string;
  lat: number;
  lon: number;
  categories: string[];
  similarityScore?: number;
}

interface PopularSitesProps {
  myloc: { lat: number; lon: number } | null;
  onBack?: () => void;
  touristDestinations: TouristDestination[];
  onSiteClick?: (lat: number, lon: number, name: string) => void;
}

const PopularSites: React.FC<PopularSitesProps> = ({
  myloc,
  onBack,
  touristDestinations,
  onSiteClick,
}) => {
  const [activeTab, setActiveTab] = useState<"popular" | "recommended" | "favourites">("popular");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const [favouriteDetails, setFavouriteDetails] = useState<TouristDestination[]>([]);
  const [isLoadingFav, setIsLoadingFav] = useState(false);

  const userId = useSelector((state: RootState) => state.user.id);
  const favourites = useSelector((state: RootState) => state.favourites.items);

  const defaultRecommendations: Recommendation[] = [
    {
      name: "Kathmandu Durbar Square",
      description: "One of three royal palace squares in the Kathmandu Valley, this UNESCO World Heritage Site is a historic plaza renowned for its exquisite architecture, temples, courtyards, and the Kumari Ghar, residence of the living goddess.",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Basantapurpalace.JPG/330px-Basantapurpalace.JPG",
        lat: 27.7047132,
        lon: 85.3074368,
      categories: ["Heritage", "Hindu", "Historical"],
      id: 1,
    },
    {
      name: "Patan Durbar Square",
      description: "Situated in the center of Lalitpur, this UNESCO World Heritage Site is a marvel of Newar architecture. The square is home to the medieval royal palace, along with a stunning array of temples and idols, including the famed Krishna Mandir.",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Patan_Durbar_Square_entrance_2022.jpg/330px-Patan_Durbar_Square_entrance_2022.jpg",
        lat: 27.6735518,
        lon: 85.3252331,
      categories: ["Heritage", "Hindu", "Historical"],
      id: 2,
    },
    {
      name: "Bhaktapur Durbar Square",
      description: "The royal palace plaza of the former Bhaktapur Kingdom and a UNESCO World Heritage Site. The square is famous for its rich culture and historical monuments, including the 55-Window Palace, the Golden Gate, and the nearby Nyatapola Temple.",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bhaktapur_Durbar_Square_area_at_dusk.jpg/330px-Bhaktapur_Durbar_Square_area_at_dusk.jpg",

      lat: 27.6721531,
      lon: 85.4283489,

      categories: ["Heritage", "Hindu", "Historical"],
      id: 3,
    },
    {
      name: "Changu Narayan Temple",
      description: "Considered the oldest Hindu temple in Nepal, this ancient temple is dedicated to Lord Vishnu. Located on a high hilltop, it is adorned with some of the finest examples of stone, wood, and metal craft in the Kathmandu Valley.",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Nepal_-_Changu_Narayan_%283566057331%29.jpg/330px-Nepal_-_Changu_Narayan_%283566057331%29.jpg",
        lat: 27.71635,
        lon: 85.42781,
      categories: ["Hindu", "Nature", "Temple"],
      id: 4,
    },
    {
      name: "Budhanilkantha Temple",
      description: "An open-air Hindu temple dedicated to Lord Vishnu, featuring a large reclining statue of the deity sleeping on a bed of cosmic serpents in a pool of water. It is a revered site for both Hindus and Buddhists.",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Budhanilkantha_Narayan_Murti_%282023%29_-_IMG_03.jpg/330px-Budhanilkantha_Narayan_Murti_%282023%29_-_IMG_03.jpg",
        lat: 27.7686123,
        lon: 85.3653456,
      categories: ["Buddhist", "Hindu", "Temple"],
      id: 5,
    },
  ]
  // Fetch Recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
 
      setIsLoadingRec(true);
      try {
        const res = await axios.get("http://localhost:8080/api/destination/recommendations", {
          params: { userId },
        });
        console.log("Recommendations response:", res.data);
        if(res.data.recommendations.length === 0) {
          setRecommendations(defaultRecommendations);
          return;
        }
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setRecommendations([]);
      } finally {
        setIsLoadingRec(false);
      }
    };

    fetchRecommendations();
  }, [userId, favourites]);

  // Fetch Favourite Details
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!userId) {
        setFavouriteDetails([]);
        return;
      }

      setIsLoadingFav(true);
      try {
        const res = await axios.get(
          `http://localhost:8080/api/destination/getfavorites/${userId}`
        );
        const favs = res.data.favorites.map((f: any) => ({
          id: f.destination.id,
          name: f.destination.name,
          description: f.destination.description,
          image: f.destination.image,
          lat: f.destination.lat,
          lon: f.destination.lon,
          categories: f.destination.categories,
        }));
        setFavouriteDetails(favs);
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
        setFavouriteDetails([]);
      } finally {
        setIsLoadingFav(false);
      }
    };

    fetchFavourites();
  }, [userId, favourites]);

  const handleCardClick = (lat: number, lon: number, name: string) => {
    if (onSiteClick) {
      onSiteClick(lat, lon, name);
    }
  };

  return (
    <div className="w-[420px] h-full flex flex-col bg-white rounded-r-2xl shadow-2xl border-r border-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Explore</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("popular")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all ${activeTab === "popular"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <TrendingUp size={14} />
            <span>Popular</span>
          </button>

          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all ${activeTab === "recommended"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <Sparkles size={14} />
            <span>For You</span>
          </button>

          <button
            onClick={() => setActiveTab("favourites")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all ${activeTab === "favourites"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <Heart size={14} />
            <span>Favourites</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "popular" && (
          <div className="space-y-4">
            {touristDestinations.map((site) => (
              <SiteCard
                key={site.id}
                {...site}
                onRecommendationClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {activeTab === "recommended" && (
          <div>
            {isLoadingRec ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            ) :recommendations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No Recommendations
                </h3>
                <p className="text-xs text-gray-600">
                  Add more favorites for better recommendations!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <button
                    key={index}
                    onClick={() => handleCardClick(rec.lat, rec.lon, rec.name)}
                    className="w-full bg-white hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 overflow-hidden transition-all hover:shadow-md text-left"
                  >
                    <div className="relative">
                      <img src={rec.image} alt={rec.name} className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                        <Sparkles size={10} />
                        <span>For You</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-base text-gray-900 mb-1.5 line-clamp-1">
                        {rec.name}
                      </h3>
                      {rec.categories && rec.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {rec.categories.slice(0, 2).map((cat, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                            >
                              <Tag size={9} />
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{rec.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={11} />
                        <span>Recommended</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favourites Tab */}
        {activeTab === "favourites" && (
          <div>
            {isLoadingFav ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading favourites...</p>
                </div>
              </div>
            ) : favouriteDetails.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart size={24} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No Favourites Yet
                </h3>
                <p className="text-xs text-gray-600">
                  Tap the heart icon on any destination to add it to favourites.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {favouriteDetails.map((site) => (
                  <SiteCard
                    key={site.id}
                    {...site}
                    onRecommendationClick={handleCardClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularSites;
