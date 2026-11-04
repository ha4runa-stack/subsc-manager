// =====================================================================
// ログイン後の画面に共通のエラー表示
//
// error.tsx は Next.js が決めた特別なファイル名で、
// 同じフォルダ以下のページで予想外のエラーが起きたときに、この内容へ切り替わる。
// （例：データベースに接続できず、サブスクを読み込めなかったとき）
// ヘッダーは (main)/layout.tsx にあるので、エラーのときも表示されたまま。
//
// エラーの受け止め役はブラウザで動く必要があるので 'use client' を付ける。
// =====================================================================
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function MainError({
  error,
  retry,
}: {
  error: unknown; // 起きたエラーの内容
  retry: () => void; // データを読み込み直して、もう一度ページを表示する関数
}) {
  // 原因を調べられるよう、ブラウザの開発者ツールにエラーを記録する
  // （エラーの詳しい内容は利用者には見せない）
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="rounded-xl bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-xl font-bold">うまく表示できませんでした</h1>
      <p className="mb-6 text-gray-700">
        通信状況を確認して、もう一度お試しください。
        登録したデータが消えたわけではありません。
      </p>
      {/* スマホでは縦に、画面が広いときは横に並べる（登録フォームのボタンと同じ） */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
        >
          ダッシュボードへ
        </Link>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
