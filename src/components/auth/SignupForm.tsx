// =====================================================================
// 新規登録フォーム（仕組みは LoginForm と同じ）
// =====================================================================
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = { error: null, message: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  // 確認メールを送ったら、フォームの代わりにお知らせを表示する
  if (state.message) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {state.message}
        </p>
        <Link
          href="/login"
          className="block text-center text-sm text-blue-600 underline"
        >
          ログイン画面へ
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          パスワード（8文字以上）
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="passwordConfirm"
          className="mb-1 block text-sm font-medium"
        >
          パスワード（確認用）
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "登録中…" : "新規登録"}
      </button>

      <p className="text-center text-sm text-gray-600">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-blue-600 underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
