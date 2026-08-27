import { env } from "cloudflare:workers";
import { Client } from "pg";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (
    !env.MIGRATION_SECRET ||
    authorization !== `Bearer ${env.MIGRATION_SECRET}`
  ) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    // 建立 creator_profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS creator_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id TEXT NOT NULL UNIQUE,

        creator_id VARCHAR(6) NOT NULL UNIQUE,

        creator_name TEXT NOT NULL,

        avatar_url TEXT,
        cover_url TEXT,
        country TEXT,
        bio TEXT,

        instagram_url TEXT,
        x_url TEXT,
        facebook_url TEXT,
        other_url TEXT,

        status TEXT NOT NULL DEFAULT 'active',

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT creator_profiles_creator_id_format
          CHECK (creator_id ~ '^[1-9][0-9]{5}$'),

        CONSTRAINT creator_profiles_status_check
          CHECK (status IN ('pending', 'active', 'suspended'))
      )
    `);

    // user_id 查詢索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id
      ON creator_profiles(user_id)
    `);

    // creator_id 查詢索引
    // UNIQUE 本身已有索引，這裡其實不需要額外建立。

    return Response.json({
      success: true,
      message: "creator_profiles migration completed",
    });
  } catch (error) {
    console.error("Creator profiles migration failed:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => {});
  }
}