import React from "react";
import CloseButton from "./ui/CloseButton";
import { Card, CardContent } from "./ui/Card";
import type { TouristDestination } from "../types/types";

const SiteCard: React.FC<TouristDestination & { onClose?: () => void }> = ({
  description,
  image,
  name,
  onClose,
}) => {
  return (
    <div className="max-w-[400px] h-full p-2 ">
      {onClose && <CloseButton onClick={onClose} />}

      <Card className="rounded-3xl overflow-hidden shadow-lg max-w-[400px]">
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
