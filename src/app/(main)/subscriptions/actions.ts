// =====================================================================
// サブスクの登録・更新・削除の処理（Server Action）
// =====================================================================
"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayInTokyo } from "@/lib/dates";
import {
  validateSubscription,
  type SubscriptionFormErrors,
  type SubscriptionFormValues,
} from "@/lib/validation";
import { isUsageStatus } from "@/lib/usage-status";
import type { SubscriptionStatus, UsageStatus } from "@/types/subscription";

// ---------------------------------------------------------------------
// 契約状況の切り替え（契約中 ⇔ 解約済み）
//   解約済みにする → 解約日に「今日（日本時間）」を記録
//   契約中に戻す   → 解約日を空にする
// ---------------------------------------------------------------------
export async function changeSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<void> {
  // 決められた値以外は受け付けない（画面を通さずに呼ばれても安全なように）
  if (status !== "active" && status !== "cancelled") {
    throw new Error("契約状況の値が正しくありません。");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      cancelled_at: status === "cancelled" ? getTodayInTokyo() : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error("更新に失敗しました。時間をおいてもう一度お試しください。");
  }

  refresh();
}

// ---------------------------------------------------------------------
// 利用状況の切り替え（一覧のボタンから呼ぶ）
// ---------------------------------------------------------------------
export async function changeUsageStatus(
  id: string,
  usageStatus: UsageStatus,
): Promise<void> {
  // 決められた値以外は受け付けない（画面を通さずに呼ばれても安全なように）
  if (!isUsageStatus(usageStatus)) {
    throw new Error("利用状況の値が正しくありません。");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // RLS により、自分のデータしか更新できない
  const { error } = await supabase
    .from("subscriptions")
    .update({ usage_status: usageStatus })
    .eq("id", id);

  if (error) {
    throw new Error("更新に失敗しました。時間をおいてもう一度お試しください。");
  }

  refresh();
}

// フォームに返す結果の形
export type SubscriptionFormState = {
  values: SubscriptionFormValues; // 入力された値（エラー時にフォームへ戻すため）
  errors: SubscriptionFormErrors; // 項目ごとのエラー
  message: string | null; // フォーム全体のエラー（保存失敗など）
};

// フォームから値を取り出す
function readForm(formData: FormData): SubscriptionFormValues {
  const get = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    name: get("name"),
    category: get("category"),
    price: get("price"),
    billing_cycle: get("billing_cycle"),
    next_billing_date: get("next_billing_date"),
    usage_status: get("usage_status"),
    memo: get("memo"),
  };
}

// ---------------------------------------------------------------------
// 登録
// ---------------------------------------------------------------------
export async function createSubscription(
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const values = readForm(formData);

  // 1. 入力チェック
  const result = validateSubscription(values);
  if (!result.success) {
    return { values, errors: result.errors, message: null };
  }

  // 2. ログインしているか確認（画面を通さずに呼ばれても安全なように）
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 3. 保存（user_id はデータベース側で自動的にログイン中のユーザーになる）
  const { error } = await supabase.from("subscriptions").insert(result.data);

  if (error) {
    return {
      values,
      errors: {},
      message: "保存に失敗しました。時間をおいてもう一度お試しください。",
    };
  }

  // 4. 成功したら一覧へ
  redirect("/subscriptions");
}

// ---------------------------------------------------------------------
// 更新
// 編集画面で updateSubscription.bind(null, id) として id を先に渡しておく。
// （bind：引数の一部をあらかじめ決めた、新しい関数を作る仕組み）
// ---------------------------------------------------------------------
export async function updateSubscription(
  id: string,
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const values = readForm(formData);

  // 1. 入力チェック
  const result = validateSubscription(values);
  if (!result.success) {
    return { values, errors: result.errors, message: null };
  }

  // 2. ログインしているか確認
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 3. 更新（RLS により、自分のデータしか更新できない）
  //    .select("id") で、実際に更新できた行を受け取る
  const { data, error } = await supabase
    .from("subscriptions")
    .update(result.data)
    .eq("id", id)
    .select("id");

  if (error) {
    return {
      values,
      errors: {},
      message: "保存に失敗しました。時間をおいてもう一度お試しください。",
    };
  }
  if (data.length === 0) {
    // 削除済み、または他の人のデータだった場合
    return {
      values,
      errors: {},
      message: "このサブスクは見つかりませんでした。",
    };
  }

  // 4. 成功したら一覧へ
  redirect("/subscriptions");
}

// ---------------------------------------------------------------------
// 削除
// ---------------------------------------------------------------------
export async function deleteSubscription(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // RLS により、自分のデータしか削除できない
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) {
    throw new Error("削除に失敗しました。時間をおいてもう一度お試しください。");
  }

  // 画面を最新の状態に更新する（削除したカードが消える）
  refresh();
}
