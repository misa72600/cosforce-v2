import { env } from "cloudflare:workers";
import { Client } from "pg";

export async function GET() {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        NOW() AS database_time,
        current_database() AS database_name
    `);

    return Response.json({
      success: true,
      database: result.rows[0],
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => {});
  }
}