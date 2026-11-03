// =====================================================================
// calculations.ts のテスト
// =====================================================================
import { describe, expect, it } from "vitest";
import { toMonthlyAmount, toYearlyAmount } from "@/lib/calculations";

// 3-2：1件ごとの計算
// 実装計画の表と同じ値を確かめる。
// it.each を使うと、表の1行ごとに同じテストを繰り返せる。
describe("toMonthlyAmount / toYearlyAmount", () => {
  it.each([
    { cycle: "monthly", price: 980, monthly: 980, yearly: 11760 },
    { cycle: "yearly", price: 5900, monthly: 492, yearly: 5900 }, // 491.66… → 四捨五入で 492
    { cycle: "yearly", price: 1000, monthly: 83, yearly: 1000 }, //   83.33… → 四捨五入で 83
    { cycle: "yearly", price: 6000, monthly: 500, yearly: 6000 }, //  割り切れる
  ] as const)(
    "$cycle $price円 → 月額換算 $monthly円・年間 $yearly円",
    ({ cycle, price, monthly, yearly }) => {
      const subscription = { price, billing_cycle: cycle };
      expect(toMonthlyAmount(subscription)).toBe(monthly);
      expect(toYearlyAmount(subscription)).toBe(yearly);
    },
  );
});
