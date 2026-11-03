// =====================================================================
// サーバー（Server Component / Server Action）で使う Supabase 接続
//
// 使い方：
//   const supabase = await createClient();
//
// ログイン情報はブラウザの Cookie（小さな保存領域）に入っている。
// サーバー側ではその Cookie を読み書きして「誰がログインしているか」を判断する。
// =====================================================================
import "server-only"; // このファイルがブラウザ側で使われたらエラーにする（安全のため）
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Cookie を全部読む
        getAll() {
          return cookieStore.getAll();
        },
        // Cookie を書き込む（ログイン状態の更新など）
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component の表示中は Cookie を書き込めないため、ここに来ることがある。
            // ログイン状態の更新は proxy.ts（ステップ1-5で作る）が行うので、無視してよい。
          }
        },
      },
    },
  );
}
