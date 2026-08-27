"use client";

import UserAuthGuard from "@/components/user/UserAuthGuard";
import UserSidebar from "@/components/user/UserSidebar";
import UserMobileHeader from "@/components/user/UserMobileHeader";

export default function UserDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-neutral-950 text-white">
        <UserMobileHeader />

        <div className="flex min-h-screen">
          <UserSidebar />

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </UserAuthGuard>
  );
}