import UserDashboardShell from "@/components/user/UserDashboardShell";

export default function OrdersPage() {
  return (
    <UserDashboardShell>
      <div className="px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-neutral-500">ORDERS</p>

          <h1 className="mt-2 text-3xl font-bold">
            我的訂單
          </h1>

          <p className="mt-3 text-neutral-400">
            查看您的訂單與付款紀錄。
          </p>
        </div>
      </div>
    </UserDashboardShell>
  );
}