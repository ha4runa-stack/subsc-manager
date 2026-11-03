// =====================================================================
// サブスクの一覧（カード形式）
// スマホでも見やすいように、表ではなくカードを縦に並べる。
// =====================================================================
import Link from "next/link";
import { getSubscriptions } from "@/lib/subscriptions";
import { DeleteButton } from "./DeleteButton";
import { formatDate, formatYen } from "@/lib/format";
import {
  BILLING_CYCLE_UNITS,
  USAGE_STATUS_LABELS,
  USAGE_STATUS_STYLES,
} from "@/lib/constants";
import type { Subscription } from "@/types/subscription";

export async function SubscriptionList() {
  const subscriptions = await getSubscriptions();

  // 1件もないとき
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm">
        <p className="mb-1 font-medium">まだサブスクが登録されていません。</p>
        <p className="text-sm">契約中のサービスを登録してみましょう。</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </ul>
  );
}

// サブスク1件分のカード
function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <li className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* 左側：サービス名と利用状況 */}
        <div>
          <p className="text-lg font-bold">{subscription.name}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              USAGE_STATUS_STYLES[subscription.usage_status]
            }`}
          >
            {USAGE_STATUS_LABELS[subscription.usage_status]}
          </span>
        </div>

        {/* 右側：料金 */}
        <p className="text-lg font-bold">
          {formatYen(subscription.price)}
          <span className="text-sm font-normal text-gray-500">
            {" "}
            / {BILLING_CYCLE_UNITS[subscription.billing_cycle]}
          </span>
        </p>
      </div>

      {/* 下段：次回請求日と操作ボタン */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          次回請求日：
          {subscription.next_billing_date
            ? formatDate(subscription.next_billing_date)
            : "未設定"}
        </p>
        <div className="flex gap-1">
          <Link
            href={`/subscriptions/${subscription.id}/edit`}
            className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
          >
            編集
          </Link>
          <DeleteButton id={subscription.id} name={subscription.name} />
        </div>
      </div>
    </li>
  );
}
