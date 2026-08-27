"use client";

import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  {
    label: "會員首頁",
    href: "/user",
    icon: "⌂",
  },
  {
    label: "個人資料",
    href: "/user/profile",
    icon: "●",
  },
  {
    label: "我的票券",
    href: "/user/tickets",
    icon: "▣",
  },
  {
    label: "我的訂單",
    href: "/user/orders",
    icon: "▤",
  },
  {
    label: "CFOR券",
    href: "/user/cfor",
    icon: "◇",
  },
  {
    label: "CF點數",
    href: "/user/points",
    icon: "✦",
  },
  {
    label: "折價券",
    href: "/user/coupons",
    icon: "％",
  },
  {
    label: "客服回應",
    href: "/user/support",
    icon: "◌",
  },
  {
    label: "資訊中心",
    href: "/user/info",
    icon: "◆",
  },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();

    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/user") {
      return pathname === "/user";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 md:flex">
      {/* Logo */}
      <div className="border-b border-neutral-800 px-6 py-6">
        <button
          type="button"
          onClick={() => router.push("/user")}
          className="text-left"
        >
          <div className="text-xl font-bold tracking-wide">
            CosForce
          </div>

          <div className="mt-1 text-xs text-neutral-500">
            MEMBER
          </div>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition",
                active
                  ? "bg-neutral-800 font-semibold text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white",
              ].join(" ")}
            >
              <span className="flex w-5 justify-center text-base">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Creator */}
      <div className="border-t border-neutral-800 p-4">
        <button
          type="button"
          onClick={() => router.push("/creator/apply")}
          className="w-full rounded-xl border border-neutral-700 px-4 py-3 text-left text-sm font-medium transition hover:bg-neutral-900"
        >
          ✦ 申請成為創作者
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
        >
          登出
        </button>
      </div>
    </aside>
  );
}