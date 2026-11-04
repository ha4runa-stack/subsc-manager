// =====================================================================
// ダッシュボードの「支出の内訳」グラフ
// カテゴリー別・利用状況別の月額換算額を、横棒グラフで表示する。
//
// グラフのライブラリは使わず、HTML と Tailwind CSS だけで作っている。
// 棒の長さは「一番大きい金額を100%としたときの割合」を width に指定して決める。
// =====================================================================
import {
  calcSpendingByCategory,
  calcSpendingByUsage,
  type SpendingRow,
} from "@/lib/calculations";
import { formatYen } from "@/lib/format";
import type { Subscription } from "@/types/subscription";

export function SpendingCharts({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  // 契約中が1件もないときは、サマリーカード側の案内だけを見せる
  if (!subscriptions.some((s) => s.status === "active")) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">支出の内訳（月額換算）</h2>
      {/* スマホでは縦に並べ、画面が広いとき（md 以上）は横に2つ並べる */}
      <div className="grid gap-4 md:grid-cols-2">
        <BarChart
          title="カテゴリー別"
          rows={calcSpendingByCategory(subscriptions)}
        />
        <BarChart title="利用状況別" rows={calcSpendingByUsage(subscriptions)} />
      </div>
    </section>
  );
}

// 横棒グラフ1つ分
function BarChart({ title, rows }: { title: string; rows: SpendingRow[] }) {
  // Math.max(...配列)：配列の中で一番大きい値
  const max = Math.max(...rows.map((row) => row.monthly));

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-medium text-gray-500">{title}</h3>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 text-sm">
            {/* 表示名（一番長い「使っていない」が収まる幅） */}
            <span className="w-24 shrink-0">{row.label}</span>

            {/* 棒の土台。棒そのものは飾りなので、読み上げソフトには読ませない
                （金額は右の文字で伝わる） */}
            <div aria-hidden="true" className="min-w-0 flex-1">
              {row.monthly > 0 && (
                // min-w-1：金額の差が大きくても棒が消えないよう、最小の幅を決めておく
                <div
                  className="h-4 min-w-1 rounded-r bg-blue-500"
                  style={{ width: `${(row.monthly / max) * 100}%` }}
                />
              )}
            </div>

            {/* 金額（tabular-nums：数字の幅をそろえて、縦に読みやすくする） */}
            <span className="shrink-0 text-right font-medium whitespace-nowrap tabular-nums">
              {formatYen(row.monthly)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
