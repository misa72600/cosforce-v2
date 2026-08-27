"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setMessage(error.message || "登入失敗");
        return;
      }

      router.push("/user");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("登入時發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-md">
        <p className="mb-2 text-sm text-neutral-400">
          CosForce 2.0
        </p>

        <h1 className="text-4xl font-bold">
          登入
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <div>
            <label className="mb-2 block text-sm">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              密碼
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "登入中..." : "登入"}
          </button>

          <p className="text-center text-sm text-neutral-400">
            還沒有帳號？
            <a
              href="/register"
              className="ml-1 text-white underline"
            >
              註冊
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}