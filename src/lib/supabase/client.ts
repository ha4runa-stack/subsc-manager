// =====================================================================
// ブラウザ（Client Component）で使う Supabase 接続
//
// 使い方：'use client' と書いたファイルの中で
//   const supabase = createClient();
// =====================================================================
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // .env.local に書いた値を読み込む
  // （NEXT_PUBLIC_ で始まる値は、ブラウザ側でも読める）
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
