import UserDashboardShell from "@/components/user/UserDashboardShell";

export default function TicketsPage() {
  return (
    <UserDashboardShell>
      <div className="px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-neutral-500">TICKETS</p>

          <h1 className="mt-2 text-3xl font-bold">
            我的票券
          </h1>

          <p className="mt-3 text-neutral-400">
            查看目前持有的活動票券。
          </p>
        </div>
      </div>
    </UserDashboardShell>
  );
}