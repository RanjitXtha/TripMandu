import prisma from "./db/index.js";
import { app } from "./app.js";
import dotenv from 'dotenv';
import { loadGraph } from "./utils/GraphLoader.js";
dotenv.config();
const PORT = Number(process.env.PORT) || 8080;
export let nodeMap = {};
export let graph = {};
async function main() {
    try {
        await prisma.$connect();
        console.log("Prisma connected.");
        const loaded = await loadGraph();
        nodeMap = loaded.nodeMap;
        graph = loaded.graph;
        console.log("Graph data loaded into memory.");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
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
