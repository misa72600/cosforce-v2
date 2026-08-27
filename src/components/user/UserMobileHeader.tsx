"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  { label: "會員首頁", href: "/user" },
  { label: "個人資料", href: "/user/profile" },
  { label: "我的票券", href: "/user/tickets" },
  { label: "我的訂單", href: "/user/orders" },
  { label: "CFOR券", href: "/user/cfor" },
  { label: "CF點數", href: "/user/points" },
  { label: "折價券", href: "/user/coupons" },
  { label: "客服回應", href: "/user/support" },
  { label: "資訊中心", href: "/user/info" },
];

export default function UserMobileHeader() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function handleLogout() {
    await authClient.signOut();

    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="border-b border-neutral-800 bg-neutral-950 md:hidden">
      <div className="flex h-16 items-center justify-between px-5">
        <button
          type="button"
          onClick={() => goTo("/user")}
          className="font-bold"
        >
          CosForce
        </button>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm"
        >
          {open ? "關閉" : "選單"}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-800 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active =
                item.href === "/user"
                  ? pathname === "/user"
                  : pathname.startsWith(item.href);

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => goTo(item.href)}
                  className={[
                    "block w-full rounded-xl px-4 py-3 text-left text-sm",
                    active
                      ? "bg-neutral-800 font-semibold text-white"
                      : "text-neutral-400",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={() => goTo("/creator/apply")}
              className="block w-full rounded-xl border border-neutral-700 px-4 py-3 text-left text-sm"
            >
              ✦ 申請成為創作者
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 block w-full px-4 py-3 text-left text-sm text-neutral-400"
            >
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}