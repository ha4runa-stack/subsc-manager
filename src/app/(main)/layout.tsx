// =====================================================================
// ログイン後の画面に共通のレイアウト
//
// (main) のようにカッコで囲んだフォルダは「ルートグループ」と呼ばれ、
// URL には含まれない。/dashboard や /subscriptions に同じヘッダーを付けるために使う。
// （/login や /signup はこのフォルダの外なので、ヘッダーは表示されない）
// =====================================================================
import { Header } from "@/components/layout/Header";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {children}
      </main>
    </>
  );
}
