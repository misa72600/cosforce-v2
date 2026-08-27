import { env } from "cloudflare:workers";
import { Client } from "pg";
import { createAuth } from "@/lib/auth";

function generateCreatorId() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
          cp.id,
          cp.user_id,
          cp.creator_id,
          cp.creator_name,
          cp.avatar_url,
          cp.cover_url,
          cp.country,
          cp.bio,
          cp.instagram_url,
          cp.x_url,
          cp.facebook_url,
          cp.other_url,
          cp.status,
          cp.created_at,
          cp.updated_at
        FROM creator_profiles cp
        WHERE cp.user_id = $1
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

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: "Invalid JSON",
      },
      { status: 400 }
    );
  }

  // =========================================================
  // Creator Profile
  // =========================================================

  const creatorName = cleanString(body.creatorName);
  const country = cleanString(body.country).toUpperCase();
  const bio = cleanString(body.bio);

  const instagramUrl = cleanString(body.instagramUrl);
  const xUrl = cleanString(body.xUrl);
  const facebookUrl = cleanString(body.facebookUrl);
  const otherUrl = cleanString(body.otherUrl);

  // =========================================================
  // Identity
  // =========================================================

  const legalName = cleanString(body.legalName);
  const gender = cleanString(body.gender);

  const documentType =
    country === "TW" ? "national_id" : "passport";

  const documentNumber = cleanString(body.documentNumber);

  // =========================================================
  // Payout
  // =========================================================

  const payoutType = cleanString(body.payoutType);

  // Taiwan bank
  const bankName = cleanString(body.bankName);
  const bankCode = cleanString(body.bankCode);
  const bankAccount = cleanString(body.bankAccount);
  const accountName = cleanString(body.accountName);

  // International
  const beneficiaryNameEn = cleanString(
    body.beneficiaryNameEn
  );

  const beneficiaryAccount = cleanString(
    body.beneficiaryAccount
  );

  const iban = cleanString(body.iban);

  const bankNameEn = cleanString(body.bankNameEn);
  const bankAddressEn = cleanString(body.bankAddressEn);
  const swiftCode = cleanString(body.swiftCode).toUpperCase();

  const beneficiaryAddressEn = cleanString(
    body.beneficiaryAddressEn
  );

  const beneficiaryPhone = cleanString(
    body.beneficiaryPhone
  );

  // =========================================================
  // Validation
  // =========================================================

  if (!creatorName) {
    return Response.json(
      {
        success: false,
        error: "請輸入創作者名稱",
      },
      { status: 400 }
    );
  }

  if (!country) {
    return Response.json(
      {
        success: false,
        error: "請選擇國籍 / 地區",
      },
      { status: 400 }
    );
  }

  if (!legalName) {
    return Response.json(
      {
        success: false,
        error: "請輸入真實姓名",
      },
      { status: 400 }
    );
  }

  if (
    !["male", "female", "other", "prefer_not_to_say"].includes(
      gender
    )
  ) {
    return Response.json(
      {
        success: false,
        error: "請選擇性別",
      },
      { status: 400 }
    );
  }

  if (!documentNumber) {
    return Response.json(
      {
        success: false,
        error:
          country === "TW"
            ? "請輸入身分證字號"
            : "請輸入護照號碼",
      },
      { status: 400 }
    );
  }

  // 台灣籍只能使用台灣銀行帳戶
  if (country === "TW" && payoutType !== "tw_bank") {
    return Response.json(
      {
        success: false,
        error: "台灣籍創作者請填寫台灣銀行帳戶",
      },
      { status: 400 }
    );
  }

  if (
    payoutType !== "tw_bank" &&
    payoutType !== "international"
  ) {
    return Response.json(
      {
        success: false,
        error: "請選擇收款方式",
      },
      { status: 400 }
    );
  }

  if (payoutType === "tw_bank") {
    if (!bankName || !bankCode || !bankAccount || !accountName) {
      return Response.json(
        {
          success: false,
          error: "請完整填寫台灣銀行帳戶資料",
        },
        { status: 400 }
      );
    }
  }

  if (payoutType === "international") {
    if (
      !beneficiaryNameEn ||
      !beneficiaryAccount ||
      !bankNameEn ||
      !bankAddressEn ||
      !swiftCode ||
      !beneficiaryAddressEn ||
      !beneficiaryPhone
    ) {
      return Response.json(
        {
          success: false,
          error: "請完整填寫國際匯款資料",
        },
        { status: 400 }
      );
    }
  }

  // =========================================================
  // Database
  // =========================================================

  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    await client.query("BEGIN");

    // 防止同一會員重複建立
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
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          error: "此會員已經是創作者",
          creatorId: existing.rows[0].creator_id,
        },
        { status: 409 }
      );
    }

    let creator = null;

    // =========================================================
    // 建立 Creator Profile
    // =========================================================

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
              country,
              status,
              created_at
          `,
          [
            session.user.id,
            creatorId,
            creatorName,
            country,
            bio || null,
            instagramUrl || null,
            xUrl || null,
            facebookUrl || null,
            otherUrl || null,
          ]
        );

        creator = result.rows[0];
        break;
      } catch (error) {
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

    if (!creator) {
      throw new Error("Unable to generate unique Creator ID");
    }

    // =========================================================
    // 建立 Identity
    // =========================================================

    await client.query(
      `
        INSERT INTO creator_identity (
          creator_profile_id,
          legal_name,
          gender,
          document_type,
          document_number
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        creator.id,
        legalName,
        gender,
        documentType,
        documentNumber,
      ]
    );

    // =========================================================
    // 建立 Payout
    // =========================================================

    if (payoutType === "tw_bank") {
      await client.query(
        `
          INSERT INTO creator_payout_accounts (
            creator_profile_id,
            payout_type,
            bank_name,
            bank_code,
            bank_account,
            account_name
          )
          VALUES ($1, 'tw_bank', $2, $3, $4, $5)
        `,
        [
          creator.id,
          bankName,
          bankCode,
          bankAccount,
          accountName,
        ]
      );
    } else {
      await client.query(
        `
          INSERT INTO creator_payout_accounts (
            creator_profile_id,
            payout_type,
            beneficiary_name_en,
            beneficiary_account,
            iban,
            bank_name_en,
            bank_address_en,
            swift_code,
            beneficiary_address_en,
            beneficiary_phone
          )
          VALUES (
            $1,
            'international',
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9
          )
        `,
        [
          creator.id,
          beneficiaryNameEn,
          beneficiaryAccount,
          iban || null,
          bankNameEn,
          bankAddressEn,
          swiftCode,
          beneficiaryAddressEn,
          beneficiaryPhone,
        ]
      );
    }

    await client.query("COMMIT");

    return Response.json({
      success: true,
      message: "創作者資料建立成功",
      creator: {
        creatorId: creator.creator_id,
        creatorName: creator.creator_name,
        country: creator.country,
        status: creator.status,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

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