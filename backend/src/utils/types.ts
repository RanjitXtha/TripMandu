export interface NodeType {
  lat: number;
  lon: number;
}

export interface Graph {
  node: number;
  dist: number;
}

export type NodeMapType = Record<string, NodeType>;
export type GraphType = Record<string, Graph[]>;