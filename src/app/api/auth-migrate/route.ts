import { env } from "cloudflare:workers";
import { createAuth } from "@/lib/auth";
import { getMigrations } from "better-auth/db/migration";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${env.MIGRATION_SECRET}`) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const auth = createAuth(env.HYPERDRIVE.connectionString);

    const { toBeCreated, toBeAdded, runMigrations } =
      await getMigrations(auth.options);

    await runMigrations();

    return Response.json({
      success: true,
      message: "Better Auth migration completed",
      created: toBeCreated,
      added: toBeAdded,
    });
  } catch (error) {
    console.error("Better Auth migration failed:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}