// =====================================================================
// 日付の計算
//
// 日付は "2026-12-01" の形の文字列で扱う（データベースと同じ形）。
// ※ サーバー（Vercel）は世界標準時で動いているため、
//   「今日」は必ず日本時間で求める。
// =====================================================================

// 日本時間の「今日」を "YYYY-MM-DD" の形で返す
export function getTodayInTokyo(now: Date = new Date()): string {
  // en-CA（カナダ英語）の日付表記は "2026-12-01" の形になるので、それを利用する
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// from から to まで何日あるか（to が過去ならマイナス）
// 例：daysBetween("2026-11-03", "2026-11-10") → 7
export function daysBetween(from: string, to: string): number {
  const ONE_DAY = 24 * 60 * 60 * 1000; // 1日をミリ秒で表したもの
  return Math.round((toUtcTime(to) - toUtcTime(from)) / ONE_DAY);
}

function toUtcTime(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

// 請求日の状態
//   none     … 請求日が未設定
//   overdue  … 請求日が過ぎている（日付の更新が必要）
//   today    … 今日が請求日
//   soon     … 7日以内に請求
//   later    … 8日以上先
export type BillingDateStatus =
  | { type: "none" }
  | { type: "overdue"; days: number } // days：何日過ぎているか
  | { type: "today" }
  | { type: "soon"; days: number } // days：あと何日か
  | { type: "later"; days: number };

export const SOON_DAYS = 7; // 「もうすぐ」とみなす日数

export function getBillingDateStatus(
  nextBillingDate: string | null,
  today: string,
): BillingDateStatus {
  if (!nextBillingDate) return { type: "none" };

  const days = daysBetween(today, nextBillingDate);
  if (days < 0) return { type: "overdue", days: -days };
  if (days === 0) return { type: "today" };
  if (days <= SOON_DAYS) return { type: "soon", days };
  return { type: "later", days };
}
