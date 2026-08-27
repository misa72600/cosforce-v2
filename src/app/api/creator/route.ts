import { env } from "cloudflare:workers";
import { Client } from "pg";
import { createAuth } from "@/lib/auth";

function generateCreatorId() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function GET(request: Request) {
  const auth = createAuth(env.HYPERDRIVE.connectionString);

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

  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    const result = await client.query(
      `
        SELECT
          id,
          user_id,
          creator_id,
          creator_name,
          avatar_url,
          cover_url,
          country,
          bio,
          instagram_url,
          x_url,
          facebook_url,
          other_url,
          status,
          created_at,
          updated_at
        FROM creator_profiles
        WHERE user_id = $1
        LIMIT 1
      `,
      [session.user.id]
    );

    if (result.rowCount === 0) {
      return Response.json({
        success: true,
        isCreator: false,
        creator: null,
      });
    }

    return Response.json({
      success: true,
      isCreator: true,
      creator: result.rows[0],
    });
  } catch (error) {
    console.error("Get creator profile failed:", error);

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

export async function POST(request: Request) {
  const auth = createAuth(env.HYPERDRIVE.connectionString);

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

  const creatorName =
    typeof body.creatorName === "string"
      ? body.creatorName.trim()
      : "";

  const country =
    typeof body.country === "string"
      ? body.country.trim()
      : "";

  const bio =
    typeof body.bio === "string"
      ? body.bio.trim()
      : "";

  const instagramUrl =
    typeof body.instagramUrl === "string"
      ? body.instagramUrl.trim()
      : "";

  const xUrl =
    typeof body.xUrl === "string"
      ? body.xUrl.trim()
      : "";

  const facebookUrl =
    typeof body.facebookUrl === "string"
      ? body.facebookUrl.trim()
      : "";

  const otherUrl =
    typeof body.otherUrl === "string"
      ? body.otherUrl.trim()
      : "";

  if (!creatorName) {
    return Response.json(
      {
        success: false,
        error: "請輸入創作者名稱",
      },
      { status: 400 }
    );
  }

  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    // 一個會員只能建立一個 Creator Profile
    const existing = await client.query(
      `
        SELECT creator_id
        FROM creator_profiles
        WHERE user_id = $1
        LIMIT 1
      `,
      [session.user.id]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return Response.json(
        {
          success: false,
          error: "此會員已經是創作者",
          creatorId: existing.rows[0].creator_id,
        },
        { status: 409 }
      );
    }

    // 最多嘗試 20 次產生唯一 Creator ID
    for (let attempt = 0; attempt < 20; attempt++) {
      const creatorId = generateCreatorId();

      try {
        const result = await client.query(
          `
            INSERT INTO creator_profiles (
              user_id,
              creator_id,
              creator_name,
              country,
              bio,
              instagram_url,
              x_url,
              facebook_url,
              other_url,
              status
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              'active'
            )
            RETURNING
              id,
              user_id,
              creator_id,
              creator_name,
              avatar_url,
              cover_url,
              country,
              bio,
              instagram_url,
              x_url,
              facebook_url,
              other_url,
              status,
              created_at,
              updated_at
          `,
          [
            session.user.id,
            creatorId,
            creatorName,
            country || null,
            bio || null,
            instagramUrl || null,
            xUrl || null,
            facebookUrl || null,
            otherUrl || null,
          ]
        );

        return Response.json({
          success: true,
          message: "創作者資料建立成功",
          creator: result.rows[0],
        });
      } catch (error) {
        // PostgreSQL unique_violation
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "23505"
        ) {
          continue;
        }

        throw error;
      }
    }

    return Response.json(
      {
        success: false,
        error: "無法產生 Creator ID，請稍後再試",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Create creator profile failed:", error);

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