// =====================================================================
// 画面に表示するときの「見た目の形」を整える関数
// =====================================================================

// 金額を「¥1,234」の形にする
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

// 日付（"2026-12-01"）を「2026年12月1日」の形にする
export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}
