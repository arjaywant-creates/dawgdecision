import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

console.log("CWD:", process.cwd());
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("SHADOW_DATABASE_URL:", process.env.SHADOW_DATABASE_URL);
const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
