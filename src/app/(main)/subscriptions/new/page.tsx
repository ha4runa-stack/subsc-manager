// =====================================================================
// サブスク新規登録（/subscriptions/new）
// =====================================================================
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { createSubscription } from "../actions";

export default function NewSubscriptionPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">サブスクを登録</h1>
      <SubscriptionForm
        action={createSubscription}
        submitLabel="登録する"
        // 最初は空。よく使う選択肢（月額・よく使う）を選んだ状態にしておく
        initialValues={{
          name: "",
          price: "",
          billing_cycle: "monthly",
          next_billing_date: "",
          usage_status: "often",
          memo: "",
        }}
      />
    </>
  );
}
