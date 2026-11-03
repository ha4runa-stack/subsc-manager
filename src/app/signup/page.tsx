// 新規登録画面（/signup）
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">新規登録</h1>
        <p className="mb-6 text-sm text-gray-600">サブスクマネージャー</p>
        <SignupForm />
      </div>
    </main>
  );
}
