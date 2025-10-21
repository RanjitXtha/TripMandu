// only for response not detailed one destination

export interface PlanDestination {
    id: string;
    destinationId?: string;
    order: number;
}

export interface Destination {
    id: Number;
    name: string;
}

export interface NewPlanDestination {
    id: string;
    date: string;
    destination: Destination;
    order: number
}

export interface PlanForm {
    id?: string;
    planName: string;
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
    id: Number;
    name: string;
    description: string;
    image?: string;
    latitude: number;
    longitude: number,
    order: 1,
    date: Date;
    categories: String[]
}


export interface PlanSingle {
    id: string;
    planName: string;
    destinations: DestinationDetails[];
}

export interface PlanResponseById {
    success: boolean;
    data: PlanSingle;
    message: string;
}

export interface FormCUResponse {
  message: string;
  success:boolean;
  data: Plan;
}