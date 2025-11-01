export interface PlanDestination {
    id: number; // always required and must be a number
    order: number;
    date?:Date;
}

export interface Destination {
    id: number;
    name: string;
}

export interface NewPlanDestination {
    id: string;
    date?: string;
    destination: Destination;
    order: number;
}

export interface PlanForm {
    id?: string;
    name: string;
    destinations: PlanDestination[];
}

export interface Plan {
    id: string;
    name: string;
    destinations: NewPlanDestination[];
}

export interface PlanResponse {
    success: boolean;
    data: Plan[];
    message: string;
}

interface DestinationDetails {
    id: number;
    name: string;
    description: string;
    image?: string;
    latitude: number;
    longitude: number;
    order: number;
    date: Date;
    categories: string[];
}

export interface PlanSingle {
  id: string;
  planName: string;
  destinations: DestinationDetails[];
  route?: RouteDetails; // Optional in case route isn't generated yet
}

export interface RouteDetails {
  costType: "time" | "length";
  mode: "foot" | "motorbike" | "car";
  path: [number, number][]; // Full route path
  segments: RouteSegment[];
  totalCostMinutes: number;
  totalDistanceKm: number;
}

export interface RouteSegment {
  path: [number, number][];
  costMinutes: number;
  distanceKm: number;
  fromIndex: number;
  toIndex: number;
}


export interface PlanResponseById {
    success: boolean;
    data: PlanSingle;
    message: string;
}

export interface FormCUResponse {
    message: string;
    success: boolean;
    data: Plan;
}
