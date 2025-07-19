import { X } from "lucide-react";
import React from "react";
import { Card, CardContent } from "./ui/Card";
import type { TouristDestination } from "../types/types";

const SiteCard: React.FC<TouristDestination & { onBack?: () => void }> = ({
  description,
  image,
  name,
  onBack,
}) => {
  return (
    <div className="max-w-[400px] h-full p-2 rounded-3xl">
      <Card className="rounded-3xl overflow-hidden shadow-lg max-w-[400px]">
        {/* Close Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-2 right-2 z-10 bg-white p-1 rounded-3xl shadow hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}

        <img src={image} alt={name} className="w-full h-60 object-cover" />
        <div className="h-full">
          <CardContent className="p-4 h-full">
            <h3 className="text-lg font-semibold mb-2">{name}</h3>
            <div className="text-sm text-gray-600">{description}</div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default SiteCard;
