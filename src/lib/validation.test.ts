// =====================================================================
// 入力チェック（validation.ts）の自動テスト
// ここではカテゴリーの項目を確かめる。
// =====================================================================
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/constants";
import { validateSubscription } from "@/lib/validation";

// 正しい入力の見本。テストごとに、確かめたい項目だけを変えて使う
const validValues = {
  name: "Netflix",
  category: "",
  price: "1490",
  billing_cycle: "monthly",
  next_billing_date: "",
  usage_status: "often",
  memo: "",
};

describe("validateSubscription：カテゴリー", () => {
  it("すべての選択肢をそのまま保存できる", () => {
    for (const category of CATEGORIES) {
      const result = validateSubscription({ ...validValues, category });
      expect(result).toMatchObject({ success: true, data: { category } });
    }
  });

  it("空のときは null（未分類）として保存する", () => {
    const result = validateSubscription({ ...validValues, category: "" });
    expect(result).toMatchObject({ success: true, data: { category: null } });
  });

  it("選択肢にない値はエラーになる", () => {
    const result = validateSubscription({ ...validValues, category: "映画" });
    expect(result).toEqual({
      success: false,
      errors: { category: "カテゴリーを選び直してください。" },
    });
  });
});
