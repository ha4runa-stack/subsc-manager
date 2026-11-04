// =====================================================================
// サブスクの一覧（カード形式）
// スマホでも見やすいように、表ではなくカードを縦に並べる。
// 「契約中」と「解約済み」の2つに分けて表示する。
// 並び順は「次回請求日が近い順」（getSubscriptions で並べ替え済み）。
// =====================================================================
import Link from "next/link";
import { getSubscriptions } from "@/lib/subscriptions";
import { DeleteButton } from "./DeleteButton";
import { StatusToggleButton } from "./StatusToggleButton";
import { UsageStatusButtons } from "./UsageStatusButtons";
import { parseUsageFilter, USAGE_STATUSES } from "@/lib/usage-status";
import { formatDate, formatYen } from "@/lib/format";
import { toMonthlyAmount, toYearlyAmount } from "@/lib/calculations";
import {
  getBillingDateStatus,
  getTodayInTokyo,
  type BillingDateStatus,
} from "@/lib/dates";
import {
  BILLING_CYCLE_UNITS,
  UNCATEGORIZED_LABEL,
  USAGE_STATUS_LABELS,
  USAGE_STATUS_STYLES,
} from "@/lib/constants";
import type { Subscription, UsageStatus } from "@/types/subscription";

export async function SubscriptionList({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const subscriptions = await getSubscriptions();
  const today = getTodayInTokyo(); // 日本時間の今日

  // URL の ?usage=◯◯ から、絞り込みの条件を読み取る（なければ null）
  const usageFilter = parseUsageFilter((await searchParams).usage);

  // 1件もないとき
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm">
        <p className="mb-1 font-medium">まだサブスクが登録されていません。</p>
        <p className="text-sm">契約中のサービスを登録してみましょう。</p>
      </div>
    );
  }

  // filter：条件に合うものだけを取り出す
  const activeList = subscriptions.filter((s) => s.status === "active");
  const cancelledList = subscriptions.filter((s) => s.status === "cancelled");

  // 絞り込みの条件に合う契約中のサブスク（条件がなければ全部）
  const visibleActiveList = usageFilter
    ? activeList.filter((s) => s.usage_status === usageFilter)
    : activeList;

  return (
    <div className="space-y-8">
      {/* 契約中 */}
      <section>
        {activeList.length > 0 && (
          <UsageFilter current={usageFilter} activeList={activeList} />
        )}
        <h2 className="mb-3 text-lg font-bold">
          契約中（{visibleActiveList.length}件）
        </h2>
        {visibleActiveList.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-sm">
            {usageFilter
              ? `「${USAGE_STATUS_LABELS[usageFilter]}」のサブスクはありません。`
              : "契約中のサブスクはありません。"}
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleActiveList.map((subscription) => (
              <ActiveCard
                key={subscription.id}
                subscription={subscription}
                billingStatus={getBillingDateStatus(
                  subscription.next_billing_date,
                  today,
                )}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 解約済み（1件以上あるときだけ表示。絞り込み中は契約中の見直しに集中できるよう隠す） */}
      {!usageFilter && cancelledList.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-500">
            解約済み（{cancelledList.length}件）
          </h2>
          <ul className="space-y-3">
            {cancelledList.map((subscription) => (
              <CancelledCard key={subscription.id} subscription={subscription} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// 利用状況の絞り込み
// 条件を URL に入れるので、再読み込みしても絞り込みが保たれる
// ---------------------------------------------------------------------
function UsageFilter({
  current,
  activeList,
}: {
  current: UsageStatus | null;
  activeList: Subscription[];
}) {
  return (
    <nav aria-label="利用状況で絞り込み" className="mb-4 flex flex-wrap gap-2">
      <FilterLink
        href="/subscriptions"
        label="すべて"
        count={activeList.length}
        isSelected={current === null}
      />
      {USAGE_STATUSES.map((status) => (
        <FilterLink
          key={status}
          href={`/subscriptions?usage=${status}`}
          label={USAGE_STATUS_LABELS[status]}
          count={activeList.filter((s) => s.usage_status === status).length}
          isSelected={current === status}
        />
      ))}
    </nav>
  );
}

function FilterLink({
  href,
  label,
  count,
  isSelected,
}: {
  href: string;
  label: string;
  count: number;
  isSelected: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isSelected ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${
        isSelected
          ? "bg-blue-600 font-medium text-white"
          : "bg-white text-gray-700 ring-1 ring-gray-200 ring-inset hover:bg-gray-100"
      }`}
    >
      {label}（{count}）
    </Link>
  );
}

// ---------------------------------------------------------------------
// 契約中のカード
// ---------------------------------------------------------------------
function ActiveCard({
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
      <CardHeader
        subscription={subscription}
        usage={
          <UsageStatusButtons
            id={subscription.id}
            name={subscription.name}
            usageStatus={subscription.usage_status}
          />
        }
      />

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
        <CardActions subscription={subscription} />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------
// 解約済みのカード（薄く表示し、請求日の代わりに解約日を出す）
// ---------------------------------------------------------------------
function CancelledCard({ subscription }: { subscription: Subscription }) {
  return (
    <li className="rounded-xl bg-gray-100 p-4">
      <div className="opacity-60">
        {/* 解約済みは切り替えられないので、利用状況は表示だけにする */}
        <CardHeader
          subscription={subscription}
          usage={
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                USAGE_STATUS_STYLES[subscription.usage_status]
              }`}
            >
              {USAGE_STATUS_LABELS[subscription.usage_status]}
            </span>
          }
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          解約日：
          {subscription.cancelled_at
            ? formatDate(subscription.cancelled_at)
            : "不明"}
        </p>
        <CardActions subscription={subscription} />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------
// カードの共通部品
// ---------------------------------------------------------------------

// 上段：サービス名・カテゴリー・利用状況・料金
// usage：利用状況の表示（契約中は切り替えボタン、解約済みはラベル）
function CardHeader({
  subscription,
  usage,
}: {
  subscription: Subscription;
  usage: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      {/* min-w-0 と break-words：スペースのない長い名前でも途中で折り返し、
          画面からはみ出さないようにする */}
      <div className="min-w-0 break-words">
        <p className="text-lg font-bold">{subscription.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {/* ?? ：左が null なら右の値を使う */}
            {subscription.category ?? UNCATEGORIZED_LABEL}
          </span>
          {usage}
        </div>
      </div>
      {/* 料金（大きく）と、計算した月額換算額・年間支出額（小さく）
          ml-auto：名前が長くて次の行に送られたときも、右端にそろえる */}
      <div className="ml-auto text-right">
        <p className="text-lg font-bold">
          {formatYen(subscription.price)}
          <span className="text-sm font-normal text-gray-500">
            {" "}
            / {BILLING_CYCLE_UNITS[subscription.billing_cycle]}
          </span>
        </p>
        <p className="text-xs text-gray-500">
          月額換算 {formatYen(toMonthlyAmount(subscription))} ／ 年間{" "}
          {formatYen(toYearlyAmount(subscription))}
        </p>
      </div>
    </div>
  );
}

// 操作ボタン：編集・契約状況の切り替え・削除
function CardActions({ subscription }: { subscription: Subscription }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Link
        href={`/subscriptions/${subscription.id}/edit`}
        className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
      >
        編集
      </Link>
      <StatusToggleButton
        id={subscription.id}
        name={subscription.name}
        status={subscription.status}
      />
      <DeleteButton id={subscription.id} name={subscription.name} />
    </div>
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
