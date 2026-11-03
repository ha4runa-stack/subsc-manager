// =====================================================================
// format.ts / dates.ts のテスト（Vitest 導入の動作確認を兼ねる）
//
// テストの書き方：
//   describe("まとまりの名前", () => { ... })  … テストをグループにまとめる
//   it("確かめたいこと", () => { ... })         … テスト1つ分
//   expect(実際の値).toBe(期待する値)           … 2つが同じならテスト成功
// =====================================================================
import { describe, expect, it } from "vitest";
import { daysBetween } from "@/lib/dates";
import { formatDate, formatYen } from "@/lib/format";

describe("formatYen", () => {
  it("3桁ごとにカンマを付け、先頭に¥を付ける", () => {
    expect(formatYen(11760)).toBe("¥11,760");
  });

  it("0円も表示できる", () => {
    expect(formatYen(0)).toBe("¥0");
  });
});

describe("formatDate", () => {
  it("「2026年12月1日」の形にする", () => {
    expect(formatDate("2026-12-01")).toBe("2026年12月1日");
  });
});

describe("daysBetween", () => {
  it("未来の日付ならプラスの日数", () => {
    expect(daysBetween("2026-11-03", "2026-11-10")).toBe(7);
  });

  it("過去の日付ならマイナスの日数", () => {
    expect(daysBetween("2026-11-03", "2026-11-01")).toBe(-2);
  });

  it("月をまたいでも正しく数える", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1);
  });
});
