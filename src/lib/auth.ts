import { Pool } from "pg";
import { betterAuth } from "better-auth";

function generateUid() {
  let uid = "";

  for (let i = 0; i < 14; i++) {
    uid += Math.floor(Math.random() * 10).toString();
  }

  return uid;
}

export function createAuth(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 5,
  });

  return betterAuth({
    database: pool,

    baseURL: {
      allowedHosts: [
        "cosforce-v2.misa72600.workers.dev",
        "localhost:3000",
      ],
      fallback: "https://cosforce-v2.misa72600.workers.dev",
      protocol: "auto",
    },

    emailAndPassword: {
      enabled: true,
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            let created = false;

            while (!created) {
              const uid = generateUid();

              try {
                await pool.query(
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
                  [
                    user.id,
                    uid,
                    user.name || "會員",
                  ]
                );

                created = true;
              } catch (error) {
                if (
                  error &&
                  typeof error === "object" &&
                  "code" in error &&
                  error.code === "23505"
                ) {
                  continue;
                }

                throw error;
              }
            }
          },
        },
      },
    },
  });
}