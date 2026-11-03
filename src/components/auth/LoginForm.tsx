// =====================================================================
// ログインフォーム
//
// 'use client'：ブラウザで動く部品。入力中の状態やエラー表示を扱うため。
// useActionState：フォーム送信の結果（エラーなど）と、送信中かどうかを受け取る仕組み。
// =====================================================================
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = { error: null, message: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

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
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      {/* エラーがあれば表示する */}
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
        {pending ? "ログイン中…" : "ログイン"}
      </button>

      <p className="text-center text-sm text-gray-600">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-blue-600 underline">
          新規登録
        </Link>
      </p>
    </form>
  );
}
