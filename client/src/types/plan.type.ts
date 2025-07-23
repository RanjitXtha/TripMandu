// only for response not detailed one destination

interface PlanDestination {
    id: string;
    destinationId: string;
    order: number;
    date: Date | null;
}

export interface PlanForm {
    id: string;
    name: string;
    destinations: PlanDestination[];
}

export interface PlanResponse {
    success: boolean;
    data: PlanForm[];
    message: string;
}

interface DestinationDetails {
    id: string;
    name: string;
    description: string;
    image?: string;
    latitude: number;
    longitude: number,
    order: 1,
    date: Date;
}


interface PlanSingle {
    id: string;
    name: string;
    destinations: DestinationDetails[];
}

export interface PlanResponseById {
    success: boolean;
    data: PlanSingle;
    message: string;
}