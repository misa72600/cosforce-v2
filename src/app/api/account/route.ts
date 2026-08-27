import { env } from "cloudflare:workers";
import { Pool } from "pg";
import { createAuth } from "@/lib/auth";

export async function DELETE(request: Request) {
  const pool = new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
    max: 1,
  });

  try {
    const auth = createAuth(env.HYPERDRIVE.connectionString);

    // 取得目前登入者
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "您尚未登入",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 先刪除 CosForce 自己的會員資料
      await client.query(
        `
        DELETE FROM user_profiles
        WHERE user_id = $1
        `,
        [userId]
      );

      // 刪除 Better Auth user
      // session / account 如果 migration 有設定 ON DELETE CASCADE
      // 會一起被刪除
      const result = await client.query(
        `
        DELETE FROM "user"
        WHERE id = $1
        RETURNING id
        `,
        [userId]
      );

      if (result.rowCount !== 1) {
        throw new Error("找不到會員帳號");
      }

      await client.query("COMMIT");

      return Response.json({
        success: true,
        message: "會員帳號已刪除",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Delete account failed:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "刪除會員帳號失敗",
      },
      { status: 500 }
    );
  } finally {
    await pool.end().catch(() => {});
  }
}