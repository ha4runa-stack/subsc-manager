// =====================================================================
// ナビゲーションのリンク
//
// 今いるページのリンクを色付きにするため、ブラウザで動く部品（'use client'）にしている。
// usePathname()：今開いているページのURL（例：/dashboard）を取得する
// =====================================================================
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/subscriptions", label: "サブスク一覧" },
];

// 今いるページに合わせて色を付けたリンク
export function NavLinks() {
  const pathname = usePathname();
  return <NavLinksView pathname={pathname} />;
}

// URL がまだ分からない間に表示する、色なしのリンク
// （Header で <Suspense fallback={<NavLinksPlaceholder />}> として使う）
export function NavLinksPlaceholder() {
  return <NavLinksView pathname={null} />;
}

// 見た目の部分（pathname が null ならどれも選択中にしない）
function NavLinksView({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex gap-1">
      {links.map((link) => {
        // /subscriptions/new なども「サブスク一覧」を選択中として扱う
        const isActive =
          pathname !== null &&
          (pathname === link.href || pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            // whitespace-nowrap：リンクの文字を途中で改行しない
            // px-2 sm:px-3：スマホでは左右の余白を少し狭くして、横に収まりやすくする
            className={
              isActive
                ? "rounded-lg bg-blue-50 px-2 py-2 text-sm font-medium whitespace-nowrap text-blue-700 sm:px-3"
                : "rounded-lg px-2 py-2 text-sm whitespace-nowrap text-gray-700 hover:bg-gray-100 sm:px-3"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
