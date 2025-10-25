export type Site = {
  site: string;
  image: string;
  about: string;
};

export type OverlayView = "none" | "showSite" | "popularSite" | "routePlanner" | "planner";

export type Location = {
  name?: string;
  lat: number;
  lon: number;
  touristId?: number;

};

export type TouristDestination = {
  coordinates: {
    lat: number;
    lon: number;
  };
  description: string;
  image: string;
  name: string;
  id: string;
  categories: string[];
};

export type NearByDestinationType = {
  lat: number;
  lon: number;
  name: string;
  categories: [];
};
