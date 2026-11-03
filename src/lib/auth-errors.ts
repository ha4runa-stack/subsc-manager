// =====================================================================
// Supabase の認証エラーを、日本語のメッセージに変換する
//
// Supabase のエラーには code（エラーの種類を表す文字列）が付いている。
// その code ごとに、ユーザーに見せる文章を決めておく。
// =====================================================================

const messages: Record<string, string> = {
  invalid_credentials: "メールアドレスまたはパスワードが正しくありません。",
  email_not_confirmed:
    "メールアドレスの確認が完了していません。届いたメールのリンクを開いてください。",
  user_already_exists: "このメールアドレスはすでに登録されています。",
  email_exists: "このメールアドレスはすでに登録されています。",
  weak_password:
    "パスワードが弱すぎます。英字と数字を組み合わせた8文字以上にしてください。",
  over_email_send_rate_limit:
    "メールの送信回数が上限に達しました。しばらく時間をおいてから試してください。",
  over_request_rate_limit:
    "短時間に何度も操作したため、一時的に制限されています。しばらく待ってから試してください。",
  email_address_invalid: "このメールアドレスは使用できません。",
};

export function toJapaneseAuthError(code: string | undefined): string {
  if (code && messages[code]) {
    return messages[code];
  }
  // 想定していないエラーの場合
  return "エラーが発生しました。時間をおいてもう一度お試しください。";
}
