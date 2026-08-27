import { Pool } from "pg";
import { betterAuth } from "better-auth";

export function createAuth(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 5,
  });

  return betterAuth({
    database: pool,

    baseURL: {
      allowedHosts: [
        "cosforce-v2.misa72600.workers.dev",
        "localhost:3000",
      ],
      fallback: "https://cosforce-v2.misa72600.workers.dev",
      protocol: "auto",
    },

    emailAndPassword: {
      enabled: true,
    },
  });
}