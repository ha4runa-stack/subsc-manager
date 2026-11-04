// =====================================================================
// ダッシュボードのサマリーカード
// 「月額合計」「年間合計」「契約数」の3枚のカードを並べる。
//
// 金額は calcTotals（src/lib/calculations.ts）で計算するので、
// 一覧画面の金額を足した値と必ず一致する。解約済みは含めない。
// =====================================================================
import Link from "next/link";
import { calcTotals } from "@/lib/calculations";
import { formatYen } from "@/lib/format";
import type { Subscription } from "@/types/subscription";

export function SummaryCards({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const totals = calcTotals(subscriptions);

  // 契約中のサブスクが1件もないとき
  if (totals.count === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm">
        <p className="mb-1 font-medium">契約中のサブスクがありません。</p>
        <p className="mb-4 text-sm">
          サブスクを登録すると、ここに毎月・毎年の支出が表示されます。
        </p>
        <Link
          href="/subscriptions/new"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          ＋ サブスクを登録する
        </Link>
      </div>
    );
  }

  return (
    // スマホでは縦に1列、画面が広いとき（sm 以上）は横に3列並べる
    <div className="grid gap-4 sm:grid-cols-3">
      <Card label="月額合計" value={formatYen(totals.monthly)} note="年額契約は12で割って計算" />
      <Card label="年間合計" value={formatYen(totals.yearly)} note="1年間に支払う金額" />
      <Card label="契約数" value={`${totals.count}件`} note="契約中のサブスク" />
    </div>
  );
}

// カード1枚分の見た目
function Card({
  label,
  value,
  note,
}: {
  label: string; // 見出し
  value: string; // 大きく表示する値
  note: string; // 補足の説明
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {/* 3列に並び始める幅（sm）はカードが狭いので、文字を一段小さくする */}
      <p className="mt-1 text-3xl font-bold break-words sm:text-2xl md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
  );
}
