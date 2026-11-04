// 確認メールのリンクがうまく使えなかったときに表示するページ
//
// よくある原因は「登録したときとは別の端末・ブラウザでリンクを開いた」場合。
// このときメールアドレスの確認は Supabase 側で完了しているので、ログインすれば使える。
// そのため「失敗」と伝えるのではなく、次にすること（ログイン）を案内する。
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">ログインをお試しください</h1>
        <p className="mb-2 text-gray-700">
          スマホなど、登録したときとは別の端末やブラウザでメールのリンクを開くと、この画面が表示されます。
          メールアドレスの確認は完了していることが多いので、登録したメールアドレスとパスワードでログインしてみてください。
        </p>
        <p className="mb-6 text-sm text-gray-600">
          「確認が完了していません」と表示されるときは、リンクの有効期限が切れている可能性があります。
          もう一度、新規登録からお試しください。
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
