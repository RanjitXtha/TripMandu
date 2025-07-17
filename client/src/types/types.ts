export type Site = {
  site: string;
  image: string;
  about: string;
};

export type OverlayView = "none" | "popularSite" | "routePlanner";

export type Location = {
  name?: string;
  lat: number;
  lon: number;
};

export type TouristDestination = {
<<<<<<< HEAD
  coordinates: {
    lat: number;
    lon: number;
  };
  description: string;
  image: string;
  name: string;
};
=======
  lat: number;
  lon: number;
  description?:string,
  image?:string,
  name:string,
}

>>>>>>> origin/snk

export type NearByDestinationType = {
  lat: number;
  lon: number;
  name: string;
  categories: [];
};
