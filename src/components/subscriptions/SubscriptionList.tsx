// =====================================================================
// サブスクの一覧（カード形式）
// スマホでも見やすいように、表ではなくカードを縦に並べる。
// 並び順は「次回請求日が近い順」（getSubscriptions で並べ替え済み）。
// =====================================================================
import Link from "next/link";
import { getSubscriptions } from "@/lib/subscriptions";
import { DeleteButton } from "./DeleteButton";
import { formatDate, formatYen } from "@/lib/format";
import {
  getBillingDateStatus,
  getTodayInTokyo,
  type BillingDateStatus,
} from "@/lib/dates";
import {
  BILLING_CYCLE_UNITS,
  USAGE_STATUS_LABELS,
  USAGE_STATUS_STYLES,
} from "@/lib/constants";
import type { Subscription } from "@/types/subscription";

export async function SubscriptionList() {
  const subscriptions = await getSubscriptions();
  const today = getTodayInTokyo(); // 日本時間の今日

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
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          billingStatus={getBillingDateStatus(
            subscription.next_billing_date,
            today,
          )}
        />
      ))}
    </ul>
  );
}

// サブスク1件分のカード
function SubscriptionCard({
  subscription,
  billingStatus,
}: {
  subscription: Subscription;
  billingStatus: BillingDateStatus;
}) {
  const isOverdue = billingStatus.type === "overdue";

  return (
    <li
      className={`rounded-xl bg-white p-4 shadow-sm ${
        isOverdue ? "ring-2 ring-red-300" : ""
      }`}
    >
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

      {/* 請求日が過ぎているときの注意 */}
      {isOverdue && (
        <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">
          ⚠ 請求日が過ぎています。「編集」から次回請求日を更新してください。
        </p>
      )}

      {/* 下段：次回請求日と操作ボタン */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>
            次回請求日：
            {subscription.next_billing_date
              ? formatDate(subscription.next_billing_date)
              : "未設定"}
          </span>
          <BillingDateBadge status={billingStatus} />
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

// 請求日までの日数を示す小さなラベル
function BillingDateBadge({ status }: { status: BillingDateStatus }) {
  const base = "rounded-full px-2 py-0.5 text-xs font-medium";

  switch (status.type) {
    case "overdue":
      return (
        <span className={`${base} bg-red-100 text-red-800`}>
          {status.days}日経過
        </span>
      );
    case "today":
      return (
        <span className={`${base} bg-orange-100 text-orange-800`}>今日</span>
      );
    case "soon":
      return (
        <span className={`${base} bg-orange-100 text-orange-800`}>
          あと{status.days}日
        </span>
      );
    default:
      // 8日以上先・未設定のときは何も出さない
      return null;
  }
}
