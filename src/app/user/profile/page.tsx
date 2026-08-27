"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Profile = {
  uid: string;
  display_name: string;
  real_name: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  role: string;
  language: string;
  email: string;
};

const countryCodes = [
  { code: "+886", label: "🇹🇼 台灣 +886" },
  { code: "+81", label: "🇯🇵 日本 +81" },
  { code: "+82", label: "🇰🇷 韓國 +82" },
  { code: "+852", label: "🇭🇰 香港 +852" },
  { code: "+853", label: "🇲🇴 澳門 +853" },
  { code: "+86", label: "🇨🇳 中國 +86" },
  { code: "+65", label: "🇸🇬 新加坡 +65" },
  { code: "+60", label: "🇲🇾 馬來西亞 +60" },
  { code: "+66", label: "🇹🇭 泰國 +66" },
  { code: "+84", label: "🇻🇳 越南 +84" },
  { code: "+1", label: "🇺🇸 美國 / 加拿大 +1" },
  { code: "+61", label: "🇦🇺 澳洲 +61" },
];

const languages = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "th", label: "ภาษาไทย" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [realName, setRealName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] =
    useState("+886");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [language, setLanguage] = useState("zh-TW");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionPending) {
      return;
    }

    if (!session) {
      router.replace("/login");
      return;
    }

    loadProfile();
  }, [session, sessionPending]);

  async function loadProfile() {
    try {
      setLoading(true);

      const response = await fetch("/api/profile", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "讀取會員資料失敗");
      }

      const profileData: Profile = data.profile;

      setProfile(profileData);
      setDisplayName(profileData.display_name || "");
      setRealName(profileData.real_name || "");
      setPhoneCountryCode(
        profileData.phone_country_code || "+886"
      );
      setPhoneNumber(profileData.phone_number || "");
      setLanguage(profileData.language || "zh-TW");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "讀取會員資料失敗"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setMessage("");
    setError("");

    if (!displayName.trim()) {
      setError("請輸入顯示名稱");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          realName,
          phoneCountryCode,
          phoneNumber,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "儲存失敗");
      }

      setMessage("會員資料已儲存");
      await loadProfile();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "儲存會員資料失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteAccount() {
    alert("刪除會員功能將於下一步加入");
  }

  if (sessionPending || loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-neutral-400">
            讀取會員資料中...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-red-400">
            {error || "找不到會員資料"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => router.push("/user")}
          className="mb-8 text-sm text-neutral-400 transition hover:text-white"
        >
          ← 返回會員中心
        </button>

        <p className="mb-2 text-sm text-neutral-400">
          CosForce 2.0
        </p>

        <h1 className="text-4xl font-bold">
          會員資料
        </h1>

        <div className="mt-10 space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              會員 UID
            </label>

            <input
              type="text"
              value={profile.uid}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-neutral-500"
            />

            <p className="mt-2 text-xs text-neutral-500">
              會員 UID 無法變更
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              顯示名稱（暱稱）
            </label>

            <input
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(event.target.value)
              }
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              真實名稱
            </label>

            <input
              type="text"
              value={realName}
              onChange={(event) =>
                setRealName(event.target.value)
              }
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              手機號碼
            </label>

            <div className="flex gap-3">
              <select
                value={phoneCountryCode}
                onChange={(event) =>
                  setPhoneCountryCode(event.target.value)
                }
                className="w-40 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-3 outline-none"
              >
                {countryCodes.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(event.target.value)
                }
                placeholder="912345678"
                className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              登入 Email
            </label>

            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-neutral-500"
            />

            <p className="mt-2 text-xs text-neutral-500">
              Email 變更功能將另外進行驗證
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              會員角色
            </label>

            <input
              type="text"
              value={
                profile.role === "member"
                  ? "一般會員"
                  : profile.role
              }
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              介面語言
            </label>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none"
            >
              {languages.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div className="rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存變更"}
          </button>
        </div>
        <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold">
            帳號安全
          </h2>
        
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            管理您的登入密碼與帳號安全設定。
          </p>

          <button
            type="button"
            onClick={() => router.push("/user/change-password")}
            className="mt-5 rounded-xl border border-neutral-700 px-5 py-3 font-semibold transition hover:bg-neutral-800"
          >
            更改密碼
          </button>
        </div>
        
        <div className="mt-12 rounded-2xl border border-red-950 bg-red-950/20 p-6">
          <h2 className="text-xl font-semibold text-red-300">
            刪除我的會員帳號
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            刪除會員資料後將無法恢復。部分依法或因帳務需要保存的交易紀錄可能仍會保留。
          </p>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="mt-5 rounded-xl border border-red-800 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-950/50"
          >
            刪除會員資料
          </button>
        </div>
      </div>
    </main>
  );
}