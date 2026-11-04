// =====================================================================
// 利用状況の値のチェック（usage-status.ts）の自動テスト
// =====================================================================
import { describe, expect, it } from "vitest";
import { isUsageStatus, parseUsageFilter } from "@/lib/usage-status";

describe("isUsageStatus", () => {
  it("決められた値なら true", () => {
    expect(isUsageStatus("often")).toBe(true);
    expect(isUsageStatus("sometimes")).toBe(true);
    expect(isUsageStatus("unused")).toBe(true);
  });

  it("それ以外は false", () => {
    expect(isUsageStatus("")).toBe(false);
    expect(isUsageStatus("constructor")).toBe(false);
    expect(isUsageStatus(null)).toBe(false);
    expect(isUsageStatus(undefined)).toBe(false);
  });
});

describe("parseUsageFilter", () => {
  it("正しい値はそのまま返す", () => {
    expect(parseUsageFilter("unused")).toBe("unused");
  });

  it("指定なし・正しくない値は null（絞り込まない）", () => {
    expect(parseUsageFilter(undefined)).toBeNull();
    expect(parseUsageFilter("abc")).toBeNull();
    // ?usage=often&usage=unused のように複数指定されると配列になる
    expect(parseUsageFilter(["often", "unused"])).toBeNull();
  });
});
