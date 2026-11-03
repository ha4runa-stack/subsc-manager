// =====================================================================
// calculations.ts のテスト
// =====================================================================
import { describe, expect, it } from "vitest";
import {
  calcTotals,
  toMonthlyAmount,
  toYearlyAmount,
} from "@/lib/calculations";

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

// 3-3：合計
describe("calcTotals", () => {
  it("契約中のサブスクを合計する", () => {
    const totals = calcTotals([
      { price: 980, billing_cycle: "monthly", status: "active" },
      { price: 5900, billing_cycle: "yearly", status: "active" },
    ]);
    expect(totals).toEqual({ monthly: 980 + 492, yearly: 11760 + 5900, count: 2 });
  });

  it("解約済みを混ぜても合計は変わらない", () => {
    const totals = calcTotals([
      { price: 980, billing_cycle: "monthly", status: "active" },
      { price: 5900, billing_cycle: "yearly", status: "cancelled" }, // 解約済み
    ]);
    // 契約中の 980 円の分だけになる
    expect(totals).toEqual({ monthly: 980, yearly: 11760, count: 1 });
  });

  it("1件ずつ四捨五入してから足す", () => {
    // 年額1,000円が3件：1件ごとだと 83 × 3 = 249 円
    // （先に足してから割ると 3000 ÷ 12 = 250 円になってしまう）
    const item = { price: 1000, billing_cycle: "yearly", status: "active" } as const;
    expect(calcTotals([item, item, item]).monthly).toBe(249);
  });

  it("0件なら0円", () => {
    expect(calcTotals([])).toEqual({ monthly: 0, yearly: 0, count: 0 });
  });
});
