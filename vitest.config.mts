// =====================================================================
// Vitest（自動テストの道具）の設定
//
// `npm test` を実行すると、src の中の「〇〇.test.ts」というファイルを探して
// テストを実行する。
// =====================================================================
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // アプリ本体と同じく「@/lib/...」の書き方で src のファイルを読み込めるようにする
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
