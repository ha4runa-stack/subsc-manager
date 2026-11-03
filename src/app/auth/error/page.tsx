// 確認メールのリンクがうまく使えなかったときに表示するページ
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">確認できませんでした</h1>
        <p className="mb-2 text-gray-700">
          リンクの有効期限が切れているか、すでに使われている可能性があります。
        </p>
        <p className="mb-6 text-gray-700">
          新規登録をしたときと同じブラウザでリンクを開いてください。
          すでに確認済みの場合は、そのままログインできます。
        </p>
        <Link
          href="/login"
          className="block rounded-lg bg-blue-600 py-2 text-center font-medium text-white hover:bg-blue-700"
        >
          ログイン画面へ
        </Link>
      </div>
    </main>
  );
}
