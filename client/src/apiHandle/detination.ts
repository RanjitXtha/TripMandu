import { api } from "../utils/axiosInstance";

export interface Destination {
  id: string;
  name: string;
  image?:string;
  description:string;
  lat:number,
  lon:number
}

export interface DestinatinReponse {
  success: boolean;
  data: Destination[];
  meessage: string;
}
export async function reverseToName(lat: number, long: number): Promise<string> {
  try {
   // console.log(lat);
   // console.log(long);
    const response = await api.get(`/destination/getName?lat=${lat}&long=${long}`);
    console.log(response.data.data);
   return response.data.data[0].name || "Not Found";
  } catch (error: any) {
    return error?.message || "Unknown error";
  }
}

export async function getAllPoints(): Promise<DestinatinReponse> {
  try {
    const response = await api.get<DestinatinReponse>("/destination/getAllLocations");
    //console.log(response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching destinations:", error.message || error);
    throw error;
  }
}

export async function getNearByLocationsByCoOrdinate(lat: number, long: number): Promise<DestinatinReponse> {
  try {
    const response = await api.get<DestinatinReponse>(`/destination/getNearbyLocations?lat=${lat}&long=${long}`);
    return response.data;
  } catch (error:any) {
    console.error(error?.message || "Something went wrong");
    throw error;
  }
}
