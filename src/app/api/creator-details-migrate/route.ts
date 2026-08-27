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

    await client.query("BEGIN");

    // =========================================================
    // 1. 創作者身分資料
    // =========================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS creator_identity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        creator_profile_id UUID NOT NULL UNIQUE,

        legal_name TEXT NOT NULL,

        gender TEXT NOT NULL,

        document_type TEXT NOT NULL,

        document_number TEXT NOT NULL,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT creator_identity_creator_profile_fk
          FOREIGN KEY (creator_profile_id)
          REFERENCES creator_profiles(id)
          ON DELETE CASCADE,

        CONSTRAINT creator_identity_gender_check
          CHECK (
            gender IN (
              'male',
              'female',
              'other',
              'prefer_not_to_say'
            )
          ),

        CONSTRAINT creator_identity_document_type_check
          CHECK (
            document_type IN (
              'national_id',
              'passport'
            )
          )
      )
    `);

    // =========================================================
    // 2. 創作者收款資料
    // =========================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS creator_payout_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        creator_profile_id UUID NOT NULL UNIQUE,

        payout_type TEXT NOT NULL,

        -- 台灣銀行帳戶
        bank_name TEXT,
        bank_code TEXT,
        bank_account TEXT,
        account_name TEXT,

        -- 國際匯款
        beneficiary_name_en TEXT,
        beneficiary_account TEXT,
        iban TEXT,
        bank_name_en TEXT,
        bank_address_en TEXT,
        swift_code TEXT,
        beneficiary_address_en TEXT,
        beneficiary_phone TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT creator_payout_creator_profile_fk
          FOREIGN KEY (creator_profile_id)
          REFERENCES creator_profiles(id)
          ON DELETE CASCADE,

        CONSTRAINT creator_payout_type_check
          CHECK (
            payout_type IN (
              'tw_bank',
              'international'
            )
          )
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_creator_identity_creator_profile
      ON creator_identity(creator_profile_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_creator_payout_creator_profile
      ON creator_payout_accounts(creator_profile_id)
    `);

    await client.query("COMMIT");

    return Response.json({
      success: true,
      message: "Creator identity and payout migration completed",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Creator details migration failed:", error);

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