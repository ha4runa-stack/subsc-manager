// =====================================================================
// ダッシュボード（/dashboard）
// 【今は仮の内容】ログイン中のメールアドレスだけを表示する。
// 中身はフェーズ4で作る。
// =====================================================================
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">ダッシュボード</h1>
      {/* ログイン情報（Cookie）を読む部分は Suspense で囲む */}
      <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
        <CurrentUser />
      </Suspense>
    </>
  );
}

async function CurrentUser() {
  const supabase = await createClient();
  // getUser()：Supabase に問い合わせて、本当にログインしているかを確認する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログインしていなければログイン画面へ
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p>
        <span className="font-medium">{user.email}</span> でログイン中です。
      </p>
    </div>
  );
}
