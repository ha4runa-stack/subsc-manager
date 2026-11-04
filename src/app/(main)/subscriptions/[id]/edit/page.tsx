// =====================================================================
// サブスク編集（/subscriptions/[id]/edit）
//
// [id] のように角かっこで囲んだフォルダは「動的ルート」と呼ばれ、
// URL のその部分（サブスクのID）を params.id として受け取れる。
// =====================================================================
import Link from "next/link";
import { Suspense } from "react";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { getSubscription } from "@/lib/subscriptions";
import type { SubscriptionFormValues } from "@/lib/validation";
import type { Subscription } from "@/types/subscription";
import { updateSubscription } from "../../actions";

export default function EditSubscriptionPage({
  params,
}: PageProps<"/subscriptions/[id]/edit">) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">サブスクを編集</h1>
      {/* URL の id はアクセスされたときに決まるので、Suspense で囲む */}
      <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subscription = await getSubscription(id);

  // 見つからない（存在しない・削除済み・他の人のデータ）とき
  if (!subscription) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-gray-700">このサブスクは見つかりませんでした。</p>
        <Link href="/subscriptions" className="text-blue-600 underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <SubscriptionForm
      // id をあらかじめ渡した「更新処理」を作る
      action={updateSubscription.bind(null, subscription.id)}
      initialValues={toFormValues(subscription)}
      submitLabel="保存する"
    />
  );
}

// データベースの値を、フォームの入力値（文字列）の形に変換する
function toFormValues(subscription: Subscription): SubscriptionFormValues {
  return {
    name: subscription.name,
    category: subscription.category ?? "", // null（未分類）なら空にする
    price: String(subscription.price),
    billing_cycle: subscription.billing_cycle,
    next_billing_date: subscription.next_billing_date ?? "",
    usage_status: subscription.usage_status,
    memo: subscription.memo ?? "",
  };
}
