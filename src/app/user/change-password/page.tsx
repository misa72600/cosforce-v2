"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!currentPassword) {
      setErrorMessage("請輸入目前密碼");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("新密碼至少需要 8 個字元");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("兩次輸入的新密碼不一致");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("新密碼不能與目前密碼相同");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setErrorMessage(
          error.message || "密碼變更失敗，請確認目前密碼是否正確"
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("密碼已成功變更");
    } catch (error) {
      console.error("Change password failed:", error);
      setErrorMessage("密碼變更失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-md">
          <p className="text-neutral-400">讀取會員資料中...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-md">
          <p className="text-neutral-300">您尚未登入。</p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            前往登入
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-white">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={() => router.push("/user/profile")}
          className="mb-8 text-sm text-neutral-400 transition hover:text-white"
        >
          ← 返回會員資料
        </button>

        <p className="mb-2 text-sm text-neutral-400">
          CosForce 2.0
        </p>

        <h1 className="text-4xl font-bold">
          更改密碼
        </h1>

        <p className="mt-3 text-sm leading-6 text-neutral-400">
          更改密碼後，其他裝置上的登入狀態將會失效。
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium"
            >
              目前密碼
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              autoComplete="current-password"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium"
            >
              新密碼
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              確認新密碼
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "變更中..." : "更改密碼"}
          </button>
        </form>
      </div>
    </main>
  );
}