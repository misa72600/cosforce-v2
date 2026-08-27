import { env } from "cloudflare:workers";
import { Pool } from "pg";
import { betterAuth } from "better-auth";

const pool = new Pool({
  connectionString: env.HYPERDRIVE.connectionString,
});

export const auth = betterAuth({
  database: pool,

  emailAndPassword: {
    enabled: true,
  },
});