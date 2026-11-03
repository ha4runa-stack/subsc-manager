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

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {links.map((link) => {
        // /subscriptions/new なども「サブスク一覧」を選択中として扱う
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                : "rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
