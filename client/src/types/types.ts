export type Site = {
  site: string;
  image: string;
  about: string;
};

export type OverlayView = "none" | "showSite" | "popularSite" | "routePlanner";

export type Location = {
  id?: string;
  lat: number;
  lon: number;
  name?: string;
};

export type TouristDestination = {
  lat: number;
  lon: number;
  description: string;
  image?: string;
  name: string;
};

export type NearByDestinationType = {
  lat: number;
  lon: number;
  name: string;
  categories: [];
};
