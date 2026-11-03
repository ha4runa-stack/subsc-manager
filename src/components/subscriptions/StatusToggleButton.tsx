// =====================================================================
// 契約状況の切り替えボタン
//   契約中のとき   → 「解約済みにする」（確認ダイアログあり）
//   解約済みのとき → 「契約中に戻す」
// =====================================================================
"use client";

import { useTransition } from "react";
import { changeSubscriptionStatus } from "@/app/(main)/subscriptions/actions";
import type { SubscriptionStatus } from "@/types/subscription";

type Props = {
  id: string;
  name: string;
  status: SubscriptionStatus;
};

export function StatusToggleButton({ id, name, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const isActive = status === "active";

  function handleClick() {
    if (isActive) {
      const ok = window.confirm(
        `「${name}」を解約済みにしますか？\n（支出の合計から外れます。あとで契約中に戻すこともできます）`,
      );
      if (!ok) return;
    }

    startTransition(async () => {
      try {
        await changeSubscriptionStatus(id, isActive ? "cancelled" : "active");
      } catch {
        window.alert("更新に失敗しました。時間をおいてもう一度お試しください。");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
    >
      {isPending ? "更新中…" : isActive ? "解約済みにする" : "契約中に戻す"}
    </button>
  );
}
