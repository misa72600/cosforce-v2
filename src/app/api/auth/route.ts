import { env } from "cloudflare:workers";
import { createAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = createAuth(env.HYPERDRIVE.connectionString);
  return auth.handler(request);
}

export async function POST(request: Request) {
  const auth = createAuth(env.HYPERDRIVE.connectionString);
  return auth.handler(request);
}