// =====================================================================
// サブスク一覧（/subscriptions）
// =====================================================================
import { Suspense } from "react";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";

export default function SubscriptionsPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">サブスク一覧</h1>
      {/* データの読み込み中は「読み込み中…」を表示する */}
      <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
        <SubscriptionList />
      </Suspense>
    </>
  );
}
