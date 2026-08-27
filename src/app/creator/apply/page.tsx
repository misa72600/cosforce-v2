"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const countries = [
  { code: "TW", name: "台灣 Taiwan" },
  { code: "JP", name: "日本 Japan" },
  { code: "KR", name: "韓國 South Korea" },
  { code: "HK", name: "香港 Hong Kong" },
  { code: "MO", name: "澳門 Macau" },
  { code: "CN", name: "中國 China" },
  { code: "TH", name: "泰國 Thailand" },
  { code: "VN", name: "越南 Vietnam" },
  { code: "MY", name: "馬來西亞 Malaysia" },
  { code: "SG", name: "新加坡 Singapore" },
  { code: "PH", name: "菲律賓 Philippines" },
  { code: "ID", name: "印尼 Indonesia" },
  { code: "US", name: "美國 United States" },
  { code: "CA", name: "加拿大 Canada" },
  { code: "AU", name: "澳洲 Australia" },
  { code: "GB", name: "英國 United Kingdom" },
  { code: "DE", name: "德國 Germany" },
  { code: "FR", name: "法國 France" },
  { code: "OTHER", name: "其他 Other" },
];

const taiwanBanks = [
  { code: "004", name: "臺灣銀行" },
  { code: "005", name: "臺灣土地銀行" },
  { code: "006", name: "合作金庫商業銀行" },
  { code: "007", name: "第一商業銀行" },
  { code: "008", name: "華南商業銀行" },
  { code: "009", name: "彰化商業銀行" },
  { code: "011", name: "上海商業儲蓄銀行" },
  { code: "012", name: "台北富邦商業銀行" },
  { code: "013", name: "國泰世華商業銀行" },
  { code: "017", name: "兆豐國際商業銀行" },
  { code: "021", name: "花旗（台灣）商業銀行" },
  { code: "048", name: "王道商業銀行" },
  { code: "050", name: "臺灣中小企業銀行" },
  { code: "052", name: "渣打國際商業銀行" },
  { code: "053", name: "台中商業銀行" },
  { code: "054", name: "京城商業銀行" },
  { code: "081", name: "滙豐（台灣）商業銀行" },
  { code: "101", name: "瑞興商業銀行" },
  { code: "102", name: "華泰商業銀行" },
  { code: "103", name: "臺灣新光商業銀行" },
  { code: "108", name: "陽信商業銀行" },
  { code: "118", name: "板信商業銀行" },
  { code: "147", name: "三信商業銀行" },
  { code: "700", name: "中華郵政" },
  { code: "803", name: "聯邦商業銀行" },
  { code: "805", name: "遠東國際商業銀行" },
  { code: "806", name: "元大商業銀行" },
  { code: "807", name: "永豐商業銀行" },
  { code: "808", name: "玉山商業銀行" },
  { code: "809", name: "凱基商業銀行" },
  { code: "810", name: "星展（台灣）商業銀行" },
  { code: "812", name: "台新國際商業銀行" },
  { code: "816", name: "安泰商業銀行" },
  { code: "822", name: "中國信託商業銀行" },
];

export default function CreatorApplyPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [checkingCreator, setCheckingCreator] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // Creator profile
  const [creatorName, setCreatorName] = useState("");
  const [country, setCountry] = useState("TW");
  const [bio, setBio] = useState("");

  const [instagramUrl, setInstagramUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [otherUrl, setOtherUrl] = useState("");

  // Identity
  const [legalName, setLegalName] = useState("");
  const [gender, setGender] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  // Payout
  const [payoutType, setPayoutType] = useState("tw_bank");

  // Taiwan bank
  const [bankCode, setBankCode] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountName, setAccountName] = useState("");

  // International
  const [beneficiaryNameEn, setBeneficiaryNameEn] = useState("");
  const [beneficiaryAccount, setBeneficiaryAccount] = useState("");
  const [iban, setIban] = useState("");
  const [bankNameEn, setBankNameEn] = useState("");
  const [bankAddressEn, setBankAddressEn] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [beneficiaryAddressEn, setBeneficiaryAddressEn] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");

  const isTaiwan = country === "TW";

  const selectedBank = taiwanBanks.find(
    (bank) => bank.code === bankCode
  );

  useEffect(() => {
    if (isTaiwan) {
      setPayoutType("tw_bank");
    }
  }, [isTaiwan]);

  useEffect(() => {
    if (isPending || !session) {
      return;
    }

    async function checkCreator() {
      try {
        const response = await fetch("/api/creator", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.isCreator) {
          router.replace("/creator");
          return;
        }
      } catch (error) {
        console.error("Check creator failed:", error);
      } finally {
        setCheckingCreator(false);
      }
    }

    checkCreator();
  }, [isPending, session, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!creatorName.trim()) {
      setErrorMessage("請輸入創作者名稱");
      return;
    }

    if (!country) {
      setErrorMessage("請選擇國籍 / 地區");
      return;
    }

    if (!legalName.trim()) {
      setErrorMessage("請輸入真實姓名");
      return;
    }

    if (!gender) {
      setErrorMessage("請選擇性別");
      return;
    }

    if (!documentNumber.trim()) {
      setErrorMessage(
        isTaiwan ? "請輸入身分證字號" : "請輸入護照號碼"
      );
      return;
    }

    if (payoutType === "tw_bank") {
      if (!bankCode || !bankAccount.trim() || !accountName.trim()) {
        setErrorMessage("請完整填寫台灣銀行帳戶資料");
        return;
      }
    }

    if (payoutType === "international") {
      if (
        !beneficiaryNameEn.trim() ||
        !beneficiaryAccount.trim() ||
        !bankNameEn.trim() ||
        !bankAddressEn.trim() ||
        !swiftCode.trim() ||
        !beneficiaryAddressEn.trim() ||
        !beneficiaryPhone.trim()
      ) {
        setErrorMessage("請完整填寫國際匯款資料");
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/creator", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorName,
          country,
          bio,

          instagramUrl,
          xUrl,
          facebookUrl,
          otherUrl,

          legalName,
          gender,
          documentNumber,

          payoutType,

          bankName: selectedBank?.name || "",
          bankCode,
          bankAccount,
          accountName,

          beneficiaryNameEn,
          beneficiaryAccount,
          iban,
          bankNameEn,
          bankAddressEn,
          swiftCode,
          beneficiaryAddressEn,
          beneficiaryPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.error || "建立創作者資料失敗，請稍後再試"
        );
        return;
      }

      router.push("/creator");
      router.refresh();
    } catch (error) {
      console.error("Creator application failed:", error);

      setErrorMessage(
        "建立創作者資料失敗，請稍後再試"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending || checkingCreator) {
    return (
      <main className="min-h-screen bg-neutral-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-neutral-400">
            讀取會員資料中...
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-neutral-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">
            申請成為創作者
          </h1>

          <p className="mt-4 text-neutral-400">
            請先登入 CosForce 會員。
          </p>

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
    <main className="min-h-screen bg-neutral-950 px-5 py-10 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/user")}
          className="text-sm text-neutral-400 transition hover:text-white"
        >
          ← 返回會員中心
        </button>

        <div className="mt-8">
          <p className="text-sm text-neutral-500">
            COSFORCE CREATOR
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            申請成為創作者
          </h1>

          <p className="mt-4 leading-7 text-neutral-400">
            建立創作者資料後，即可使用 CosForce
            創作者相關功能。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-8"
        >
          {/* Creator */}
          <Section
            title="創作者資料"
            description="這些資料將用於活動報名及創作者相關功能。"
          >
            <Field label="創作者名稱" required>
              <Input
                value={creatorName}
                onChange={setCreatorName}
                placeholder="請輸入創作者名稱"
              />
            </Field>

            <Field label="國籍 / 地區" required>
              <select
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
                className={inputClass}
              >
                {countries.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="個人介紹">
              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                rows={5}
                placeholder="簡單介紹自己..."
                className={inputClass}
              />
            </Field>

            <Field label="Instagram">
              <Input
                value={instagramUrl}
                onChange={setInstagramUrl}
                placeholder="https://instagram.com/..."
              />
            </Field>

            <Field label="X">
              <Input
                value={xUrl}
                onChange={setXUrl}
                placeholder="https://x.com/..."
              />
            </Field>

            <Field label="Facebook">
              <Input
                value={facebookUrl}
                onChange={setFacebookUrl}
                placeholder="https://facebook.com/..."
              />
            </Field>

            <Field label="其他連結">
              <Input
                value={otherUrl}
                onChange={setOtherUrl}
                placeholder="https://..."
              />
            </Field>
          </Section>

          {/* Identity */}
          <Section
            title="身分資料"
            description="此區資料不會公開顯示，用於身分確認及相關行政作業。"
          >
            <Field label="真實姓名" required>
              <Input
                value={legalName}
                onChange={setLegalName}
                placeholder="請填寫證件上的真實姓名"
                autoComplete="name"
              />
            </Field>

            <Field label="性別" required>
              <select
                value={gender}
                onChange={(event) =>
                  setGender(event.target.value)
                }
                className={inputClass}
              >
                <option value="">請選擇</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">其他</option>
                <option value="prefer_not_to_say">
                  不願透露
                </option>
              </select>
            </Field>

            <Field
              label={isTaiwan ? "身分證字號" : "護照號碼"}
              required
            >
              <Input
                value={documentNumber}
                onChange={setDocumentNumber}
                placeholder={
                  isTaiwan
                    ? "請輸入身分證字號"
                    : "請輸入護照號碼"
                }
              />
            </Field>
          </Section>

          {/* Payout */}
          <Section
            title="收款資料"
            description="此資料用於活動分潤及其他款項撥付，不會公開顯示。"
          >
            {!isTaiwan && (
              <Field label="收款方式" required>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice
                    checked={payoutType === "international"}
                    onClick={() =>
                      setPayoutType("international")
                    }
                    title="國際匯款"
                    description="使用海外銀行帳戶"
                  />

                  <Choice
                    checked={payoutType === "tw_bank"}
                    onClick={() =>
                      setPayoutType("tw_bank")
                    }
                    title="台灣銀行帳戶"
                    description="我有台灣銀行帳戶"
                  />
                </div>
              </Field>
            )}

            {payoutType === "tw_bank" ? (
              <>
                <Field label="銀行名稱＋代碼" required>
                  <select
                    value={bankCode}
                    onChange={(event) =>
                      setBankCode(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      請選擇銀行
                    </option>

                    {taiwanBanks.map((bank) => (
                      <option
                        key={bank.code}
                        value={bank.code}
                      >
                        {bank.code} {bank.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="銀行帳號" required>
                  <Input
                    value={bankAccount}
                    onChange={setBankAccount}
                    placeholder="請輸入銀行帳號"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="戶名" required>
                  <Input
                    value={accountName}
                    onChange={setAccountName}
                    placeholder="請輸入銀行帳戶戶名"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="英文戶名" required>
                  <Input
                    value={beneficiaryNameEn}
                    onChange={setBeneficiaryNameEn}
                    placeholder="Beneficiary Name"
                  />
                </Field>

                <Field label="收款帳號" required>
                  <Input
                    value={beneficiaryAccount}
                    onChange={setBeneficiaryAccount}
                    placeholder="Account Number"
                  />
                </Field>

                <Field label="IBAN Code">
                  <Input
                    value={iban}
                    onChange={setIban}
                    placeholder="適用國家請填寫 IBAN"
                  />
                </Field>

                <Field label="收款銀行英文名稱" required>
                  <Input
                    value={bankNameEn}
                    onChange={setBankNameEn}
                    placeholder="Bank Name"
                  />
                </Field>

                <Field label="收款銀行英文地址" required>
                  <textarea
                    value={bankAddressEn}
                    onChange={(event) =>
                      setBankAddressEn(event.target.value)
                    }
                    rows={3}
                    placeholder="Bank / Branch Address"
                    className={inputClass}
                  />
                </Field>

                <Field label="SWIFT Code" required>
                  <Input
                    value={swiftCode}
                    onChange={setSwiftCode}
                    placeholder="例如 ABCDTWTP"
                  />
                </Field>

                <Field label="收款人英文地址" required>
                  <textarea
                    value={beneficiaryAddressEn}
                    onChange={(event) =>
                      setBeneficiaryAddressEn(
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Street, City, Country..."
                    className={inputClass}
                  />
                </Field>

                <Field label="收款人電話" required>
                  <Input
                    value={beneficiaryPhone}
                    onChange={setBeneficiaryPhone}
                    placeholder="+82..."
                    type="tel"
                  />
                </Field>
              </>
            )}
          </Section>

          {errorMessage && (
            <div className="rounded-2xl border border-red-900 bg-red-950/40 px-5 py-4 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pb-12 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/user")}
              disabled={submitting}
              className="rounded-xl border border-neutral-700 px-6 py-3 font-semibold text-neutral-300 transition hover:bg-neutral-900 disabled:opacity-50"
            >
              取消
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-white px-8 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "建立中..."
                : "申請成為創作者"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-400";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 md:p-7">
      <div className="mb-6 border-b border-neutral-800 pb-5">
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {description}
        </p>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?:
    | "none"
    | "text"
    | "decimal"
    | "numeric"
    | "tel"
    | "search"
    | "email"
    | "url";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      className={inputClass}
    />
  );
}

function Choice({
  checked,
  onClick,
  title,
  description,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border p-4 text-left transition",
        checked
          ? "border-white bg-neutral-800"
          : "border-neutral-700 bg-neutral-950 hover:border-neutral-500",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-1 h-4 w-4 shrink-0 rounded-full border",
            checked
              ? "border-white bg-white"
              : "border-neutral-600",
          ].join(" ")}
        />

        <div>
          <p className="font-semibold">
            {title}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}