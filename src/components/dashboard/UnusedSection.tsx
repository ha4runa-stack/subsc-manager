// =====================================================================
// ダッシュボードの「使っていないサブスク」セクション
// 利用状況が「使っていない」の契約中サブスクを並べ、
// 解約するといくら節約できるかを表示する。
//
// 金額はサマリーカードと同じ calcTotals で計算するので、
// 一覧画面の金額を足した値と必ず一致する。
// =====================================================================
import Link from "next/link";
import { calcTotals, getUnusedSubscriptions, toYearlyAmount } from "@/lib/calculations";
import { formatYen } from "@/lib/format";
import type { Subscription } from "@/types/subscription";

export function UnusedSection({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  // 契約中が1件もないときは、サマリーカード側の案内だけを見せる
  // （some … 条件に合うものが1つでもあれば true）
  if (!subscriptions.some((s) => s.status === "active")) {
    return null;
  }

  const unusedList = getUnusedSubscriptions(subscriptions);
  const unusedTotals = calcTotals(unusedList);

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">
        使っていないサブスク（{unusedList.length}件）
      </h2>

      {unusedList.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-sm">
          使っていないサブスクはありません。
        </p>
      ) : (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          {/* 節約できる金額 */}
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <p className="text-sm font-medium">すべて解約すると</p>
            <p className="mt-1 text-2xl font-bold">
              年間 {formatYen(unusedTotals.yearly)} の節約
            </p>
            <p className="mt-1 text-sm">
              月額換算で {formatYen(unusedTotals.monthly)} です
            </p>
          </div>

          {/* サービスごとの金額 */}
          <ul className="mt-3 divide-y divide-gray-100">
            {unusedList.map((subscription) => (
              <li
                key={subscription.id}
                className="flex flex-wrap items-center justify-between gap-x-4 py-3"
              >
                {/* 長いサービス名でも折り返して、画面からはみ出さないようにする */}
                <span className="min-w-0 font-medium break-words">
                  {subscription.name}
                </span>
                <span className="text-sm text-gray-600">
                  年間 {formatYen(toYearlyAmount(subscription))}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/subscriptions"
            className="mt-2 inline-block rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
          >
            一覧で見直す →
          </Link>
        </div>
      )}
    </section>
  );
}
