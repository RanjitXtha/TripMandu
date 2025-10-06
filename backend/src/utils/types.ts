export type NodeType = {
  lat: number;
  lon: number;
};

export type NodeMap_Type = {
  [nodeId: number]: NodeType;
};

export type ModeCost = {
  cost: number;         // forward cost
  reverseCost?: number; // optional backward cost
};

export interface EdgeType {
  to: number;
  length_m: number;      // optional, for length-based routing
  modes: {
    car?: ModeCost;
    motorbike?: ModeCost;
    foot?: ModeCost;
  };
}

export type Graph_Type = {
  [nodeId: number]: EdgeType[];
};

export type TurnRestrictionSet = Set<string>;

export type LoadGraphResult = {
  nodeMap: NodeMap_Type;
  graph: Graph_Type;
  turnRestrictions: TurnRestrictionSet;
};
