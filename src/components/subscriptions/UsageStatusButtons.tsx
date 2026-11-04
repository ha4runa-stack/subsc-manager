// =====================================================================
// 利用状況の切り替えボタン（よく使う / たまに使う / 使っていない）
// 一覧のカードから、編集画面を開かずに1回押すだけで変更できる。
//
// useOptimistic：保存が終わる前に、先に画面だけ新しい状態にする仕組み。
// 押してすぐ反応するので使いやすい。保存に失敗したら自動で元に戻る。
// =====================================================================
"use client";

import { useOptimistic, useTransition } from "react";
import { changeUsageStatus } from "@/app/(main)/subscriptions/actions";
import { USAGE_STATUS_LABELS, USAGE_STATUS_STYLES } from "@/lib/constants";
import { USAGE_STATUSES } from "@/lib/usage-status";
import type { UsageStatus } from "@/types/subscription";

type Props = {
  id: string;
  name: string;
  usageStatus: UsageStatus;
};

export function UsageStatusButtons({ id, name, usageStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(usageStatus);

  function handleClick(next: UsageStatus) {
    startTransition(async () => {
      setOptimisticStatus(next);
      try {
        await changeUsageStatus(id, next);
      } catch {
        window.alert("更新に失敗しました。時間をおいてもう一度お試しください。");
      }
    });
  }

  return (
    <div role="group" aria-label={`${name}の利用状況`} className="flex flex-wrap gap-1">
      {USAGE_STATUSES.map((status) => {
        const isSelected = status === optimisticStatus;
        return (
          <button
            key={status}
            type="button"
            onClick={() => handleClick(status)}
            // 選択中のボタンは押しても変わらないので無効にする。保存中は全部無効にする
            disabled={isSelected || isPending}
            // aria-pressed：画面読み上げソフトに「選択中かどうか」を伝える
            aria-pressed={isSelected}
            className={`rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
              isSelected
                ? USAGE_STATUS_STYLES[status]
                : "bg-white text-gray-500 ring-1 ring-gray-200 ring-inset hover:bg-gray-100 disabled:hover:bg-white"
            }`}
          >
            {USAGE_STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}
