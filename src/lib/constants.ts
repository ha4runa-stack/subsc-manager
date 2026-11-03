// =====================================================================
// アプリ全体で使う決まった値（定数）
//
// 画面に出す日本語のラベルなどを、ここ1か所にまとめておく。
// 表記を変えたいときや、選択肢を増やしたいときは、このファイルだけ直せばよい。
// =====================================================================
import type {
  BillingCycle,
  SubscriptionStatus,
  UsageStatus,
} from "@/types/subscription";

// 契約周期の表示名
export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "月額",
  yearly: "年額",
};

// 料金の後ろに付ける単位（例：¥980 / 月）
export const BILLING_CYCLE_UNITS: Record<BillingCycle, string> = {
  monthly: "月",
  yearly: "年",
};

// 利用状況の表示名
export const USAGE_STATUS_LABELS: Record<UsageStatus, string> = {
  often: "よく使う",
  sometimes: "たまに使う",
  unused: "使っていない",
};

// 利用状況ごとのバッジの色（Tailwind のクラス）
export const USAGE_STATUS_STYLES: Record<UsageStatus, string> = {
  often: "bg-green-100 text-green-800",
  sometimes: "bg-yellow-100 text-yellow-800",
  unused: "bg-red-100 text-red-800",
};

// 契約状況の表示名
export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "契約中",
  cancelled: "解約済み",
};

// カテゴリーの選択肢（選択欄は V1.0 で作る）
export const CATEGORIES = [
  "動画",
  "音楽",
  "ゲーム",
  "学習",
  "仕事",
  "ニュース",
  "クラウド",
  "その他",
] as const;
