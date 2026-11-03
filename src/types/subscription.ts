// =====================================================================
// サブスクのデータの「型」（どんな項目があり、それぞれ何が入るか）
//
// TypeScript は、この型をもとに「間違った値を入れていないか」を
// コードを書いている段階でチェックしてくれる。
// 項目名はデータベースの列名（subscriptions テーブル）と同じにしている。
// =====================================================================

// 契約周期：月額 / 年額
export type BillingCycle = "monthly" | "yearly";

// 利用状況：よく使う / たまに使う / 使っていない
export type UsageStatus = "often" | "sometimes" | "unused";

// 契約状況：契約中 / 解約済み
export type SubscriptionStatus = "active" | "cancelled";

// サブスク1件分のデータ
export type Subscription = {
  id: string;
  user_id: string;
  name: string; // サービス名
  category: string | null; // カテゴリー（null = 未設定）
  price: number; // 料金（円）
  billing_cycle: BillingCycle;
  next_billing_date: string | null; // 次回請求日（"2026-12-01" の形）
  usage_status: UsageStatus;
  status: SubscriptionStatus;
  cancelled_at: string | null; // 解約日
  memo: string | null;
  created_at: string;
  updated_at: string;
};
