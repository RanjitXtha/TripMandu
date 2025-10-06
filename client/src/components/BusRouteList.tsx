// components/BusRouteList.tsx
import React from "react";

export interface BusSegment {
  routeId: string;
  startStop: string;
  endStop: string;
}

export interface BusRecommendation {
  from: { lat: number; lon: number; name?: string };
  to: { lat: number; lon: number; name?: string };
  busSegments: BusSegment[];
}

interface Props {
  busRecommendations: BusRecommendation[];
}

const BusRouteList: React.FC<Props> = ({ busRecommendations }) => {
  if (!busRecommendations.length) return null;

  return (
    <div className="p-4 bg-white shadow-lg rounded max-h-[80vh] overflow-auto absolute top-20 right-4 z-50">
      <h2 className="font-bold text-xl mb-3">Bus Recommendations</h2>
      {busRecommendations.map((rec, i) => (
        <div key={i} className="mb-4 border-b pb-2">
          <h3 className="font-semibold mb-1">
            Leg {i + 1}: {rec.from.name || "Start"} → {rec.to.name || "End"}
          </h3>
          {rec.busSegments.map((seg, j) => (
            <div key={j} className="pl-4 mb-1">
              Take <span className="font-bold">{seg.routeId}</span> from{" "}
              <span className="text-blue-600">{seg.startStop}</span> to{" "}
              <span className="text-blue-600">{seg.endStop}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BusRouteList;
