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
