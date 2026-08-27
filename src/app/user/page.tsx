"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import UserDashboardShell from "@/components/user/UserDashboardShell";

export default function UserPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  return (
    <UserDashboardShell>
      <div className="px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-neutral-500">
            MEMBER
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            會員中心
          </h1>

          <p className="mt-3 text-neutral-400">
            歡迎回來，{session?.user.name}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push("/user/tickets")}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-left transition hover:border-neutral-700"
            >
              <p className="text-sm text-neutral-500">TICKETS</p>
              <h2 className="mt-2 text-xl font-semibold">我的票券</h2>
              <p className="mt-2 text-sm text-neutral-400">
                查看目前持有的活動票券
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push("/user/orders")}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-left transition hover:border-neutral-700"
            >
              <p className="text-sm text-neutral-500">ORDERS</p>
              <h2 className="mt-2 text-xl font-semibold">我的訂單</h2>
              <p className="mt-2 text-sm text-neutral-400">
                查看購買與付款紀錄
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push("/user/cfor")}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-left transition hover:border-neutral-700"
            >
              <p className="text-sm text-neutral-500">CFOR</p>
              <h2 className="mt-2 text-xl font-semibold">CFOR券</h2>
              <p className="mt-2 text-sm text-neutral-400">
                查看持有數量與使用紀錄
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push("/user/points")}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-left transition hover:border-neutral-700"
            >
              <p className="text-sm text-neutral-500">POINTS</p>
              <h2 className="mt-2 text-xl font-semibold">CF點數</h2>
              <p className="mt-2 text-sm text-neutral-400">
                查看點數餘額與紀錄
              </p>
            </button>
          </div>
        </div>
      </div>
    </UserDashboardShell>
  );
}