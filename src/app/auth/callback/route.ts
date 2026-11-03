// =====================================================================
// 確認メールのリンクを開いたときに呼ばれる URL（/auth/callback）
//
// リンクには「code」という一時的な合言葉が付いている。
// それを Supabase に渡してログイン状態（セッション）に交換する。
// =====================================================================
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 成功 → ダッシュボードへ
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 失敗（リンクが古い・別のブラウザで開いた など）→ エラーページへ
  return NextResponse.redirect(`${origin}/auth/error`);
}
