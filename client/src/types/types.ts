export type Site = {
  site: string;
  image: string;
  about: string;
};

export type Location = {
  name?: string;
  lat: number;
  lon: number;
};

export type TouristDestination = {
  lat: number;
  lon: number;
  description?:string,
  image?:string,
  name:string,
}


export type NearByDestinationType = {
  lat:number,
  lon:number,
  name:string,
  categories:[]
}

