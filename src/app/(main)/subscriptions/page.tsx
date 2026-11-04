// =====================================================================
// サブスク一覧（/subscriptions）
// =====================================================================
import Link from "next/link";
import { Suspense } from "react";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";

export default function SubscriptionsPage({
  searchParams,
}: PageProps<"/subscriptions">) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">サブスク一覧</h1>
        <Link
          href="/subscriptions/new"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 font-medium whitespace-nowrap text-white hover:bg-blue-700"
        >
          ＋ 登録する
        </Link>
      </div>
      {/* データの読み込み中は「読み込み中…」を表示する */}
      <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
        {/* searchParams：URL の ? より後ろの部分（例：?usage=unused） */}
        <SubscriptionList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
