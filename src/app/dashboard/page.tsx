// =====================================================================
// ダッシュボード（/dashboard）
// 【今は仮の内容】ログインできているかを確かめるために、
// ログイン中のメールアドレスとログアウトボタンだけを表示する。
// 中身はフェーズ4で作る。
// =====================================================================
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">ダッシュボード</h1>
      {/* ログイン情報（Cookie）を読む部分は Suspense で囲む */}
      <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
        <CurrentUser />
      </Suspense>
    </main>
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
      <p className="mb-4">
        <span className="font-medium">{user.email}</span> でログイン中です。
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
