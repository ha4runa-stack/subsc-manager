// ログイン画面（/login）
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">ログイン</h1>
        <p className="mb-6 text-sm text-gray-600">サブスクマネージャー</p>
        <LoginForm />
      </div>
    </main>
  );
}
