"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function UserPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-neutral-400">讀取會員資料中...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-sm text-neutral-400">CosForce 2.0</p>

          <h1 className="text-4xl font-bold">會員中心</h1>

          <p className="mt-6 text-neutral-300">
            您尚未登入。
          </p>

          <button
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
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-sm text-neutral-400">
          CosForce 2.0
        </p>

        <h1 className="text-4xl font-bold">
          會員中心
        </h1>

        <p className="mt-6 text-neutral-300">
          登入成功 🎉
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div>
            <p className="text-sm text-neutral-500">名稱</p>
            <p className="mt-1 text-lg">
              {session.user.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Email</p>
            <p className="mt-1 text-lg">
              {session.user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-xl border border-neutral-700 px-5 py-3 font-semibold transition hover:bg-neutral-900"
        >
          登出
        </button>
      </div>
    </main>
  );
}