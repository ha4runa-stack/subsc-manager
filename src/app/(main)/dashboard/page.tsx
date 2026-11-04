// =====================================================================
// ダッシュボード（/dashboard）
// 支出の状況をひと目で確認する画面。
//   ・サマリーカード（月額合計・年間合計・契約数）
//   ・支出の内訳のグラフ（カテゴリー別・利用状況別）
//   ・未使用サブスクのセクション（年間◯円の節約）
// ※ ログインしていない人は proxy.ts がログイン画面へ移動させる。
// =====================================================================
import { Suspense } from "react";
import { SpendingCharts } from "@/components/dashboard/SpendingCharts";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { UnusedSection } from "@/components/dashboard/UnusedSection";
import { getSubscriptions } from "@/lib/subscriptions";

export default function DashboardPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">ダッシュボード</h1>
      {/* データの読み込み中は「読み込み中…」を表示する */}
      <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

// データを1回だけ読み込んで、それぞれの部品に同じものを渡す
// （部品ごとに読み込むと、データベースへの問い合わせが2回になってしまう）
async function DashboardContent() {
  const subscriptions = await getSubscriptions();

  return (
    <>
      <SummaryCards subscriptions={subscriptions} />
      <SpendingCharts subscriptions={subscriptions} />
      <UnusedSection subscriptions={subscriptions} />
    </>
  );
}
