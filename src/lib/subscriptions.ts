// =====================================================================
// サブスクのデータを Supabase から取り出す関数
//
// データの読み込みをこのファイルにまとめておくと、
// 一覧画面・ダッシュボードなど、どこからでも同じ方法で使える。
// ※ RLS があるので、ログイン中のユーザー自身のデータだけが返ってくる。
// =====================================================================
import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/types/subscription";

// 自分のサブスクを全件取得する
// 並び順：次回請求日が近い順 → 請求日が未設定のものは最後（その中は新しく登録した順）
export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_billing_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    // エラーを投げると、画面側でエラー表示に切り替えられる
    throw new Error(`サブスクの読み込みに失敗しました: ${error.message}`);
  }

  return data as Subscription[];
}

// IDを指定して1件取得する（見つからなければ null）
export async function getSubscription(
  id: string,
): Promise<Subscription | null> {
  // IDの形（UUID）が正しくなければ、問い合わせずに「見つからない」とする
  if (!isUuid(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .maybeSingle(); // 0件なら null、1件ならそのデータ

  if (error) {
    throw new Error(`サブスクの読み込みに失敗しました: ${error.message}`);
  }

  // 他の人のデータは RLS により取得できないので、ここでも null になる
  return data as Subscription | null;
}

// UUID（例：1b4e28ba-2fa1-11d2-883f-0016d3cca427）の形かどうか
export function isUuid(text: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    text,
  );
}
