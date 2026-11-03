// =====================================================================
// 支出の計算
//
// 計算ルール（CLAUDE.md「4. 計算ルール」）：
//   ・月額換算額 … 月額契約はそのまま、年額契約は 12 で割る
//   ・年間支出額 … 月額契約は 12 倍、年額契約はそのまま
//   ・小数点が出たら 1 円単位に四捨五入する
//
// 画面やデータベースとは関係のない「ただの計算」だけを置いているので、
// 自動テスト（calculations.test.ts）で確かめやすい。
// =====================================================================
import type { Subscription } from "@/types/subscription";

// 計算に必要な項目だけを取り出した型
// （Pick<型, "項目名"> で、元の型から一部の項目だけを選べる）
type PriceInfo = Pick<Subscription, "price" | "billing_cycle">;

// 1件分の月額換算額（円）
// 例：年額 5,900 円 → 5900 ÷ 12 = 491.66… → 492 円
export function toMonthlyAmount(subscription: PriceInfo): number {
  if (subscription.billing_cycle === "yearly") {
    return Math.round(subscription.price / 12); // Math.round = 四捨五入
  }
  return subscription.price;
}

// 1件分の年間支出額（円）
// 例：月額 980 円 → 980 × 12 = 11,760 円
export function toYearlyAmount(subscription: PriceInfo): number {
  if (subscription.billing_cycle === "monthly") {
    return subscription.price * 12;
  }
  return subscription.price;
}

// ---------------------------------------------------------------------
// 合計
// ---------------------------------------------------------------------

// 合計の計算に必要な項目（料金・契約周期に加えて、契約状況）
type TotalInfo = Pick<Subscription, "price" | "billing_cycle" | "status">;

// 合計の結果
export type Totals = {
  monthly: number; // 月額換算額の合計（円）
  yearly: number; // 年間支出額の合計（円）
  count: number; // 対象になったサブスクの件数
};

// 契約中のサブスクだけを対象に、月額・年間の合計を出す
//   ・解約済みは含めない
//   ・1件ずつ四捨五入してから足す（一覧の金額を足した値と必ず一致させるため）
export function calcTotals(subscriptions: TotalInfo[]): Totals {
  // filter … 条件に合うものだけを残した新しい配列を作る
  const active = subscriptions.filter((s) => s.status === "active");

  let monthly = 0;
  let yearly = 0;
  for (const s of active) {
    monthly += toMonthlyAmount(s); // toMonthlyAmount の中で四捨五入済み
    yearly += toYearlyAmount(s);
  }

  return { monthly, yearly, count: active.length };
}

// ---------------------------------------------------------------------
// 未使用サブスク
// ---------------------------------------------------------------------

// 「使っていない」かつ「契約中」のサブスクだけを取り出す
//   （解約済みはもう支払っていないので、節約の対象にならない）
//
// <T extends ...> は「必要な項目さえ持っていれば、どんな型でも受け取れる」という書き方。
// 渡したデータ（Subscription など）を、そのままの型で返せる。
//
// 未使用サブスクの金額は、この結果を calcTotals に渡せば同じルールで計算できる：
//   calcTotals(getUnusedSubscriptions(subscriptions))
export function getUnusedSubscriptions<
  T extends Pick<Subscription, "usage_status" | "status">,
>(subscriptions: T[]): T[] {
  return subscriptions.filter(
    (s) => s.usage_status === "unused" && s.status === "active",
  );
}
