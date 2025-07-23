import prisma from "../db/index.js";
function parseCoords(coord) {
    const [lon, lat] = coord.replace("POINT(", "").replace(")", "").split(" ");
    return [parseFloat(lon), parseFloat(lat)];
}
export async function loadGraph() {
    const rawNodes = await prisma.$queryRawUnsafe(`
    SELECT id, ST_AsText(location) as coord FROM "Node";
  `);
    const nodeMap = {};
    for (const node of rawNodes) {
        const [lon, lat] = parseCoords(node.coord);
        nodeMap[node.id.toString()] = { lat, lon };
    }
    // Fetch all edges with fromId, toId, cost
    const rawEdges = await prisma.$queryRawUnsafe(`
    SELECT "fromId", "toId", cost FROM "Edge";
  `);
    const graph = {};
    for (const edge of rawEdges) {
        const from = edge.fromId.toString();
        if (!graph[from])
            graph[from] = [];
        graph[from].push({ node: edge.toId, dist: edge.cost });
    }
    return { nodeMap, graph };
}
