// =====================================================================
// ヘッダー（画面上部の帯）
// アプリ名・ナビゲーション・ログアウトボタンを表示する
// =====================================================================
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-blue-700">
          サブスクマネージャー
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <NavLinks />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
