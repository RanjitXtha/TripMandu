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
  category:string,
  coordinates:{
    lat:number,
    lon:number
  },
  description:string,
  image:string,
  name:string,
  tags:[],
  wikiUrl:string,
  wiki_title:string
}


export type NearByDestinationType = {
  lat:number,
  lon:number,
  name:string,
  categories:[]
}

