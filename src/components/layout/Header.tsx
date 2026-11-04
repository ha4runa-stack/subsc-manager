// =====================================================================
// ヘッダー（画面上部の帯）
// アプリ名・ナビゲーション・ログアウトボタンを表示する
// =====================================================================
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/auth/actions";
import { NavLinks, NavLinksPlaceholder } from "./NavLinks";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-blue-700">
          サブスクマネージャー
        </Link>

        {/* flex-wrap：とても狭い画面で入りきらないときは、ボタンごと次の行へ送る */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-3">
          {/* NavLinks は URL を読むので Suspense で囲む（URL はアクセス時に決まるため） */}
          <Suspense fallback={<NavLinksPlaceholder />}>
            <NavLinks />
          </Suspense>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-2 py-2 text-sm whitespace-nowrap text-gray-600 hover:bg-gray-100 sm:px-3"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
