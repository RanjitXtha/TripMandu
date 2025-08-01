// Coordinates of a node
export type NodeType = {
  lat: number;
  lon: number;
};

// Mapping from node ID to its coordinates
export type NodeMap_Type = {
  [nodeId: number]: NodeType;
};

// One edge in the routing graph
export type EdgeType = {
  to: number;             // Target node ID
  cost: number;           // Time-based cost for routing
  edgeId: number;         // Database edge ID (for reference or debugging)
  mode: 'car' | 'bicycle' | 'foot'; // Transport mode this edge supports
};

// Adjacency list: source node → list of outgoing edges
export type Graph_Type = {
  [nodeId: number]: EdgeType[];
};

// Set of turn restrictions, in the format: "from-via-to"
export type TurnRestrictionSet = Set<string>;

// Return value of the graph loader
export type LoadGraphResult = {
  nodeMap: NodeMap_Type;
  graph: Graph_Type;
  turnRestrictions: TurnRestrictionSet;
};
