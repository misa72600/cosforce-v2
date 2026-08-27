import { env } from "cloudflare:workers";
import { Pool } from "pg";
import { createAuth } from "@/lib/auth";

function createPool() {
  return new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
    max: 5,
  });
}

/**
 * 取得目前登入會員資料
 */
export async function GET(request: Request) {
  const auth = createAuth(env.HYPERDRIVE.connectionString);

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const pool = createPool();

    try {
      const result = await pool.query(
        `
          SELECT
            p.uid,
            p.display_name,
            p.real_name,
            p.phone_country_code,
            p.phone_number,
            p.role,
            p.language,
            u.email
          FROM user_profiles p
          INNER JOIN "user" u
            ON u.id = p.user_id
          WHERE p.user_id = $1
          LIMIT 1
        `,
        [session.user.id]
      );

      if (result.rows.length === 0) {
        return Response.json(
          {
            success: false,
            error: "Profile not found",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        profile: result.rows[0],
      });
    } finally {
      await pool.end().catch(() => {});
    }
  } catch (error) {
    console.error("Get profile failed:", error);

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
  }
}

/**
 * 更新目前登入會員資料
 */
export async function PUT(request: Request) {
  const auth = createAuth(env.HYPERDRIVE.connectionString);

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim()
        : "";

    const realName =
      typeof body.realName === "string"
        ? body.realName.trim()
        : "";

    const phoneCountryCode =
      typeof body.phoneCountryCode === "string"
        ? body.phoneCountryCode.trim()
        : "";

    const phoneNumber =
      typeof body.phoneNumber === "string"
        ? body.phoneNumber.trim()
        : "";

    const language =
      typeof body.language === "string"
        ? body.language.trim()
        : "zh-TW";

    if (!displayName) {
      return Response.json(
        {
          success: false,
          error: "顯示名稱不可為空白",
        },
        { status: 400 }
      );
    }

    const allowedLanguages = [
      "zh-TW",
      "en",
      "ja",
      "ko",
      "th",
    ];

    if (!allowedLanguages.includes(language)) {
      return Response.json(
        {
          success: false,
          error: "不支援的介面語言",
        },
        { status: 400 }
      );
    }

    const pool = createPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
          UPDATE user_profiles
          SET
            display_name = $1,
            real_name = $2,
            phone_country_code = $3,
            phone_number = $4,
            language = $5,
            updated_at = NOW()
          WHERE user_id = $6
        `,
        [
          displayName,
          realName || null,
          phoneCountryCode || null,
          phoneNumber || null,
          language,
          session.user.id,
        ]
      );

      // 同步 Better Auth 的顯示名稱
      await client.query(
        `
          UPDATE "user"
          SET
            name = $1,
            "updatedAt" = NOW()
          WHERE id = $2
        `,
        [displayName, session.user.id]
      );

      await client.query("COMMIT");

      return Response.json({
        success: true,
        message: "會員資料已更新",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
      await pool.end().catch(() => {});
    }
  } catch (error) {
    console.error("Update profile failed:", error);

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
  }
}