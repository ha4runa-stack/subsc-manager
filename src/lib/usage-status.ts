// =====================================================================
// 利用状況の値を確かめる関数
//
// URL やブラウザから届く値は、何が入っているか分からない。
// 決められた値かどうかを確かめてから使う。
// =====================================================================
import type { UsageStatus } from "@/types/subscription";

// 選べる利用状況（画面に並べる順番）
export const USAGE_STATUSES: UsageStatus[] = ["often", "sometimes", "unused"];

// 決められた利用状況の値かどうか
// （value is UsageStatus：true のとき、この値は UsageStatus だと TypeScript に伝える書き方）
export function isUsageStatus(value: unknown): value is UsageStatus {
  return USAGE_STATUSES.includes(value as UsageStatus);
}

// URL の ?usage=◯◯ を、絞り込みの条件に変換する
// 指定なし・正しくない値のときは null（絞り込まない）
export function parseUsageFilter(
  value: string | string[] | undefined,
): UsageStatus | null {
  return isUsageStatus(value) ? value : null;
}
