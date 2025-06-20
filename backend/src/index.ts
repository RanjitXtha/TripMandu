import prisma from "./db/index.js";
import { app } from "./app.js";
import dotenv from 'dotenv'

dotenv.config();

const PORT = process.env.PORT || 8080;


async function main() {
    try {
        await prisma.$connect();
        console.log("Prisma connected.");

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
