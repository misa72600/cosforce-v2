"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("請輸入名稱");
      return;
    }

    if (!email.trim()) {
      setMessage("請輸入 Email");
      return;
    }

    if (password.length < 8) {
      setMessage("密碼至少需要 8 個字元");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("兩次輸入的密碼不一致");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message || "註冊失敗");
        return;
      }

      if (data) {
        router.push("/user");
      }
    } catch (error) {
      console.error(error);
      setMessage("註冊時發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-10">
          <p className="mb-2 text-sm text-neutral-400">
            CosForce 2.0
          </p>

          <h1 className="text-4xl font-bold">
            建立帳號
          </h1>

          <p className="mt-3 text-neutral-400">
            註冊 CosForce 會員
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              名稱
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
              placeholder="您的名稱"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              密碼
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
              placeholder="至少 8 個字元"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              確認密碼
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
              placeholder="再次輸入密碼"
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
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "建立帳號中..." : "建立帳號"}
          </button>

          <p className="text-center text-sm text-neutral-400">
            已經有帳號？
            <a
              href="/login"
              className="ml-1 text-white underline underline-offset-4"
            >
              登入
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}