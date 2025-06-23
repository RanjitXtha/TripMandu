import React from "react";
import { Card, CardContent } from "./ui/Card";
import type { Site } from "../types/types";

const EventCard: React.FC<Site> = ({ site, image, about }) => {
  return (
    <Card className="relative rounded-2xl overflow-hidden shadow-lg">
      <img src={image} alt={site} className="w-full h-48 object-cover" />
      <div className="absolute top-2 left-2 rounded-full px-3 py-2">Image</div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{site}</h3>
        <div className="flex items-center text-sm text-gray-600">{about}</div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
