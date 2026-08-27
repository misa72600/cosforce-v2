"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function UserAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />

          <p className="mt-4 text-sm text-neutral-400">
            讀取會員資料中...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  return <>{children}</>;
}