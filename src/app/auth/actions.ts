// =====================================================================
// ログイン・新規登録・ログアウトの処理（Server Action）
//
// 'use server' と書くと、この中の関数はサーバー上で実行される。
// フォームの送信ボタンを押すと、ここの関数が呼ばれる。
// =====================================================================
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toJapaneseAuthError } from "@/lib/auth-errors";

// フォームに返す結果の形
export type AuthFormState = {
  error: string | null; // エラーメッセージ（なければ null）
  message: string | null; // 成功時のお知らせ（なければ null）
};

// フォームの入力値を文字列として取り出す小さな関数
function getText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// ---------------------------------------------------------------------
// ログイン
// ---------------------------------------------------------------------
export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getText(formData, "email");
  const password = getText(formData, "password");

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
      message: null,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: toJapaneseAuthError(error.code), message: null };
  }

  // ログイン成功 → ダッシュボードへ
  redirect("/dashboard");
}

// ---------------------------------------------------------------------
// 新規登録
// ---------------------------------------------------------------------
export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getText(formData, "email");
  const password = getText(formData, "password");
  const passwordConfirm = getText(formData, "passwordConfirm");

  // 入力チェック
  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
      message: null,
    };
  }
  if (password.length < 8) {
    return {
      error: "パスワードは8文字以上で入力してください。",
      message: null,
    };
  }
  if (password !== passwordConfirm) {
    return {
      error: "確認用のパスワードが一致しません。",
      message: null,
    };
  }

  // 確認メールのリンクを押したときに戻ってくる URL を作る
  // （開発中は http://localhost:3000、本番では Vercel の URL になる）
  const origin = (await headers()).get("origin");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: toJapaneseAuthError(error.code), message: null };
  }

  // Supabase の設定で「メール確認なし」の場合は、すぐにログイン状態になる
  if (data.session) {
    redirect("/dashboard");
  }

  // 通常は確認メールが送られる
  return {
    error: null,
    message:
      "確認メールを送信しました（英語のメールが届きます）。メールのリンクを開くと登録が完了します。別の端末で開いて「ログインをお試しください」と表示された場合は、そのままログインしてください。",
  };
}

// ---------------------------------------------------------------------
// ログアウト
// ---------------------------------------------------------------------
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
