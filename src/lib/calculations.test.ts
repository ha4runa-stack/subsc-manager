// =====================================================================
// calculations.ts のテスト
// =====================================================================
import { describe, expect, it } from "vitest";
import {
  calcSpendingByCategory,
  calcSpendingByUsage,
  calcTotals,
  getUnusedSubscriptions,
  toMonthlyAmount,
  toYearlyAmount,
} from "@/lib/calculations";
import type { Subscription } from "@/types/subscription";

// テストで使う項目だけを持ったサブスクの型
type TestSubscription = Pick<
  Subscription,
  "name" | "price" | "billing_cycle" | "usage_status" | "status"
>;

// 6-3：支出の内訳（グラフ用）
describe("calcSpendingByCategory / calcSpendingByUsage", () => {
  const active = { status: "active", billing_cycle: "monthly" } as const;
  const list = [
    { ...active, price: 1000, category: "動画", usage_status: "often" },
    { ...active, price: 500, category: "動画", usage_status: "unused" },
    { ...active, price: 2000, category: "音楽", usage_status: "often" },
    { ...active, price: 300, category: null, usage_status: "sometimes" },
    // 年額 5,900 円 → 月額換算 492 円
    {
      status: "active",
      billing_cycle: "yearly",
      price: 5900,
      category: "仕事",
      usage_status: "often",
    },
    // 解約済みは含めない
    {
      status: "cancelled",
      billing_cycle: "monthly",
      price: 9999,
      category: "ゲーム",
      usage_status: "unused",
    },
  ] satisfies Parameters<typeof calcSpendingByCategory>[0] &
    Parameters<typeof calcSpendingByUsage>[0];

  it("カテゴリー別：金額の大きい順に並び、空のカテゴリーは未分類にまとめる", () => {
    expect(calcSpendingByCategory(list)).toEqual([
      { label: "音楽", monthly: 2000 },
      { label: "動画", monthly: 1500 },
      { label: "仕事", monthly: 492 },
      { label: "未分類", monthly: 300 },
    ]);
  });

  it("利用状況別：決まった順に並ぶ", () => {
    expect(calcSpendingByUsage(list)).toEqual([
      { label: "よく使う", monthly: 3492 },
      { label: "たまに使う", monthly: 300 },
      { label: "使っていない", monthly: 500 },
    ]);
  });

  it("どちらの内訳を足しても、合計（calcTotals）と一致する", () => {
    const sum = (rows: { monthly: number }[]) =>
      rows.reduce((total, row) => total + row.monthly, 0);
    const { monthly } = calcTotals(list);
    expect(sum(calcSpendingByCategory(list))).toBe(monthly);
    expect(sum(calcSpendingByUsage(list))).toBe(monthly);
  });

  it("利用状況別は、該当がなくても0円の行を残す", () => {
    expect(calcSpendingByUsage([])).toEqual([
      { label: "よく使う", monthly: 0 },
      { label: "たまに使う", monthly: 0 },
      { label: "使っていない", monthly: 0 },
    ]);
  });

  it("カテゴリー別は、0件なら行がない", () => {
    expect(calcSpendingByCategory([])).toEqual([]);
  });
});

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

// 3-4：未使用サブスクの抽出
describe("getUnusedSubscriptions", () => {
  // テスト用データ（name はどれが残ったか確かめるための目印）
  const subscriptions: TestSubscription[] = [
    { name: "A", price: 980, billing_cycle: "monthly", usage_status: "often", status: "active" },
    { name: "B", price: 500, billing_cycle: "monthly", usage_status: "sometimes", status: "active" },
    { name: "C", price: 1200, billing_cycle: "monthly", usage_status: "unused", status: "active" },
    { name: "D", price: 6000, billing_cycle: "yearly", usage_status: "unused", status: "active" },
    { name: "E", price: 300, billing_cycle: "monthly", usage_status: "unused", status: "cancelled" },
  ];

  it("「よく使う」「たまに使う」「解約済み」は含まれない", () => {
    const names = getUnusedSubscriptions(subscriptions).map((s) => s.name);
    expect(names).toEqual(["C", "D"]);
  });

  it("未使用サブスクの金額も同じルールで計算できる", () => {
    const totals = calcTotals(getUnusedSubscriptions(subscriptions));
    // C：月額 1,200（年間 14,400）＋ D：年額 6,000（月額換算 500）
    expect(totals).toEqual({ monthly: 1700, yearly: 20400, count: 2 });
  });

  it("未使用がなければ空の配列", () => {
    expect(getUnusedSubscriptions([subscriptions[0]])).toEqual([]);
  });
});
