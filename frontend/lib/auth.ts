import "dotenv/config";
import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [
    "https://www.dawgdecision.app",
    "https://dawgdecision.app",
    "https://dawgdecision-v2.vercel.app",
    "http://localhost:3000",
  ],
});