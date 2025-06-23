import prisma from "./db/index.js";
import { app } from "./app.js";
import dotenv from 'dotenv'
import { loadGraph } from "./utils/GraphLoader.js";
import type { NodeMapType,GraphType, NodeType } from "./utils/types.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
export let nodeMap:NodeMapType = {};
export let graph:GraphType = {};


async function main() {
    try {
        await prisma.$connect();
        console.log("Prisma connected.");

        const loaded = await loadGraph();
        nodeMap = loaded.nodeMap;
        graph = loaded.graph;
        console.log("Graph data loaded into memory.");


        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error:any) {
        console.error(error?.message || "Error during db connection");
        process.exit(1); 
    }
}

process.on('SIGINT', async () => {
    console.log("Shutting down..");
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log("Shutting down...");
    await prisma.$disconnect();
    process.exit(0);
});

main();
