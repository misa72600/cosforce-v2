import { env } from "cloudflare:workers";
import { Client } from "pg";

function generateUid() {
  let uid = "";

  for (let i = 0; i < 14; i++) {
    uid += Math.floor(Math.random() * 10).toString();
  }

  return uid;
}

export async function POST(request: Request) {
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

  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    // 建立 CosForce 會員資料表
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        uid CHAR(14) UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        real_name TEXT,
        phone_country_code VARCHAR(8),
        phone_number VARCHAR(32),
        role VARCHAR(32) NOT NULL DEFAULT 'member',
        language VARCHAR(16) NOT NULL DEFAULT 'zh-TW',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT user_profiles_user_id_fk
          FOREIGN KEY (user_id)
          REFERENCES "user"(id)
          ON DELETE CASCADE
      )
    `);

    // 找出目前還沒有 profile 的既有會員
    const users = await client.query(`
      SELECT u.id, u.name
      FROM "user" u
      LEFT JOIN user_profiles p
        ON p.user_id = u.id
      WHERE p.user_id IS NULL
    `);

    let createdProfiles = 0;

    for (const user of users.rows) {
      let created = false;

      while (!created) {
        const uid = generateUid();

        try {
          await client.query(
            `
              INSERT INTO user_profiles (
                user_id,
                uid,
                display_name,
                role,
                language
              )
              VALUES ($1, $2, $3, 'member', 'zh-TW')
            `,
            [user.id, uid, user.name || "會員"]
          );

          created = true;
          createdProfiles++;
        } catch (error) {
          // 如果極低機率 UID 撞號，就重新產生
          if (
            error instanceof Error &&
            "code" in error &&
            error.code === "23505"
          ) {
            continue;
          }

          throw error;
        }
      }
    }

    return Response.json({
      success: true,
      message: "user_profiles migration completed",
      profilesCreated: createdProfiles,
    });
  } catch (error) {
    console.error("Profile migration failed:", error);

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