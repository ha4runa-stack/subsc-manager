// =====================================================================
// サブスク登録・編集フォームの入力チェック
//
// フォームから届く値はすべて「文字列」なので、
//   1. 必須項目が空でないか
//   2. 数字や日付として正しいか
//   3. 決められた選択肢の中の値か
// を確かめてから、データベースに保存できる形に変換する。
//
// この関数は画面やデータベースに触れない「純粋関数」なので、
// 自動テスト（フェーズ3で導入する Vitest）で確かめやすい。
// =====================================================================
import type { BillingCycle, UsageStatus } from "@/types/subscription";

// フォームの入力値（すべて文字列）
export type SubscriptionFormValues = {
  name: string;
  price: string;
  billing_cycle: string;
  next_billing_date: string;
  usage_status: string;
  memo: string;
};

// 入力チェックを通ったあとの、保存できる形のデータ
export type SubscriptionInput = {
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  usage_status: UsageStatus;
  memo: string | null;
};

// 項目ごとのエラーメッセージ（エラーがない項目は入らない）
export type SubscriptionFormErrors = Partial<
  Record<keyof SubscriptionFormValues, string>
>;

// チェック結果：成功なら data、失敗なら errors が入る
export type ValidationResult =
  | { success: true; data: SubscriptionInput }
  | { success: false; errors: SubscriptionFormErrors };

const MAX_PRICE = 10_000_000; // 料金の上限（1,000万円）
const BILLING_CYCLES: BillingCycle[] = ["monthly", "yearly"];
const USAGE_STATUSES: UsageStatus[] = ["often", "sometimes", "unused"];

export function validateSubscription(
  values: SubscriptionFormValues,
): ValidationResult {
  const errors: SubscriptionFormErrors = {};

  // --- サービス名 ---
  const name = values.name.trim();
  if (!name) {
    errors.name = "サービス名を入力してください。";
  } else if (name.length > 100) {
    errors.name = "サービス名は100文字以内で入力してください。";
  }

  // --- 料金 ---
  const priceText = values.price.trim();
  const price = Number(priceText);
  if (!priceText) {
    errors.price = "料金を入力してください。";
  } else if (!Number.isInteger(price)) {
    // 小数や文字が入っている場合
    errors.price = "料金は整数（円）で入力してください。";
  } else if (price <= 0) {
    errors.price = "料金は1円以上で入力してください。";
  } else if (price > MAX_PRICE) {
    errors.price = "料金が大きすぎます。金額を確認してください。";
  }

  // --- 契約周期 ---
  if (!BILLING_CYCLES.includes(values.billing_cycle as BillingCycle)) {
    errors.billing_cycle = "契約周期を選んでください。";
  }

  // --- 次回請求日（空でもOK） ---
  const nextBillingDate = values.next_billing_date.trim();
  if (nextBillingDate && !isValidDate(nextBillingDate)) {
    errors.next_billing_date = "正しい日付を入力してください。";
  }

  // --- 利用状況 ---
  if (!USAGE_STATUSES.includes(values.usage_status as UsageStatus)) {
    errors.usage_status = "利用状況を選んでください。";
  }

  // --- メモ（空でもOK） ---
  const memo = values.memo.trim();
  if (memo.length > 1000) {
    errors.memo = "メモは1000文字以内で入力してください。";
  }

  // エラーが1つでもあれば失敗
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      price,
      billing_cycle: values.billing_cycle as BillingCycle,
      next_billing_date: nextBillingDate || null, // 空なら null
      usage_status: values.usage_status as UsageStatus,
      memo: memo || null,
    },
  };
}

// "2026-12-01" の形で、実在する日付かどうか（2月30日などを弾く）
function isValidDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
