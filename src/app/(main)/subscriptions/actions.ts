// =====================================================================
// サブスクの登録・更新・削除の処理（Server Action）
// 今は「登録」だけ。更新は2-5、削除は2-6で追加する。
// =====================================================================
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  validateSubscription,
  type SubscriptionFormErrors,
  type SubscriptionFormValues,
} from "@/lib/validation";

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
