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

// 自分のサブスクを全件取得する（新しく登録した順）
export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // エラーを投げると、画面側でエラー表示に切り替えられる
    throw new Error(`サブスクの読み込みに失敗しました: ${error.message}`);
  }

  return data as Subscription[];
}
