// =====================================================================
// 削除ボタン
// 押すと確認ダイアログを出し、「OK」のときだけ削除する。
// =====================================================================
"use client";

import { useTransition } from "react";
import { deleteSubscription } from "@/app/(main)/subscriptions/actions";

type Props = {
  id: string;
  name: string;
};

export function DeleteButton({ id, name }: Props) {
  // useTransition：処理中かどうか（isPending）を知るための仕組み
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // ブラウザ標準の確認ダイアログ（OK なら true、キャンセルなら false）
    const ok = window.confirm(
      `「${name}」を削除しますか？\nこの操作は取り消せません。`,
    );
    if (!ok) return;

    startTransition(async () => {
      try {
        await deleteSubscription(id);
      } catch {
        window.alert("削除に失敗しました。時間をおいてもう一度お試しください。");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "削除中…" : "削除"}
    </button>
  );
}
