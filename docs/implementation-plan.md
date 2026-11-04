# サブスクマネージャー 実装計画

要件は `CLAUDE.md`、リリース区分はユーザーストーリーマップに基づく。
各ステップは「実装 → 動作確認 → コミット」の順で進める。終わったら `[x]` にする。

---

## 1. ストーリーマップとステップの対応

| 活動 | ストーリー | リリース | ステップ |
|---|---|---|---|
| ①アプリを利用 | ダッシュボード表示 | MVP | 4-1, 4-2 |
| ②契約情報を登録 | サブスク登録・料金登録 | MVP | 2-3, 2-4 |
| | 請求日管理 | MVP | 2-7 |
| | カテゴリー選択 | V1.0 | 6-1 |
| ③契約状況を確認 | サブスク一覧表示 | MVP | 2-2 |
| | サブスク編集 | MVP | 2-5 |
| | 利用状況管理 | V1.0（入力欄はMVP） | 2-3, 6-2 |
| ④支出を把握 | 月間・年間支出計算 | MVP | 3-2, 3-3 |
| | グラフ表示 | V1.0 | 6-3 |
| ⑤無駄な支出を見つける | 未使用サービス表示・支出計算 | MVP | 3-4, 4-2 |
| | 見直し候補表示 | V2.0 | 7-1 |
| ⑥契約を見直す | 解約済み管理 | MVP | 2-8 |

※ 削除はストーリーマップにないが、CLAUDE.md のMVPに含まれるため実装する（2-6）。

---

## 2. 実装ステップ

### MVP

#### フェーズ0: 準備
- [x] **0-1 開発環境** — Node.js、Git、VS Code、GitHubアカウント
  - テスト: `node -v` と `git --version` でバージョンが表示される
- [x] **0-2 Next.jsプロジェクト作成** — TypeScript、Tailwind CSS、App Router、`src/` ディレクトリ
  - テスト: `npm run dev` → http://localhost:3000 で画面が表示される
- [x] **0-3 GitHubへのpushとVercelでの公開**
  - テスト: VercelのURLで画面が表示される

#### フェーズ1: 基盤（Supabase・ログイン）
- [x] **1-1 Supabaseプロジェクトと環境変数** — URLとキーを `.env.local` に書く
  - テスト: `git status` に `.env.local` が出てこない
- [x] **1-2 subscriptionsテーブルとRLS** — 「3. データベース構成」のSQLを実行する
  - テスト: Table Editorでテーブルが見え、RLSが Enabled になっている
- [x] **1-3 Supabaseへの接続ファイル** — `@supabase/ssr` でブラウザ用とサーバー用を作る
  - テスト: 仮のページでテーブルを読み込んでもエラーが出ない
- [x] **1-4 新規登録・ログイン・ログアウト**
  - テスト: 一連の操作が通る。間違ったパスワードでエラーが表示される
- [x] **1-5 未ログインのアクセス制限**（`proxy.ts`）
  - テスト: ログアウト中に `/dashboard` を開くと `/login` に移動する
- [x] **1-6 共通レイアウト（ヘッダー）**
  - テスト: リンクで画面が切り替わる。スマホ幅でも崩れない

#### フェーズ2: サブスク管理
- [x] **2-1 型定義と定数** — Subscription型、ラベル、カテゴリー定数（選択欄はV1.0で作る）
  - テスト: `npm run build` で型エラーが出ない
- [x] **2-2 一覧表示** — 0件のときは案内文を出す
  - テスト: Supabaseで手入力した1件が表示される
- [x] **2-3 登録フォームの見た目** — サービス名・料金・契約周期・次回請求日・利用状況・メモ
  - テスト: すべての項目に入力できる
- [x] **2-4 登録処理と入力チェック**（Server Action）
  - テスト: 正しく入力すると一覧に追加される。空欄や0以下の金額で日本語のエラーが出る
- [x] **2-5 編集** — フォームの部品を使い回す
  - テスト: 変更が反映される。存在しないIDで「見つかりません」と表示される
- [x] **2-6 削除** — 確認ダイアログを出す
  - テスト: キャンセルでは消えず、削除で消える
- [x] **2-7 請求日管理** — 請求日が近い順に並べる。日付が過ぎていたら注意表示を出す
  - テスト: 並び順が正しい。過去の日付で注意が出る。請求日が空でもエラーにならない
- [x] **2-8 解約済み管理** — 契約状況の切り替えと解約日の記録、一覧の分割、契約中への戻し
  - テスト: 解約済み側に移り、元に戻せる。`cancelled_at` に日付が入る

#### フェーズ3: 計算ロジック（`src/lib/calculations.ts`）
- [x] **3-1 Vitestの導入**
  - テスト: `npm test` でサンプルテストが通る
- [x] **3-2 1件ごとの計算** — `toMonthlyAmount` / `toYearlyAmount`
  - テスト（自動）:

    | 契約周期 | 料金 | 月額換算 | 年間支出 |
    |---|---|---|---|
    | 月額 | 980 | 980 | 11,760 |
    | 年額 | 5,900 | 492 | 5,900 |
    | 年額 | 1,000 | 83 | 1,000 |
    | 年額 | 6,000 | 500 | 6,000 |
- [x] **3-3 合計** — `calcTotals`。契約中だけを対象に、1件ずつ四捨五入してから合計する
  - テスト（自動）: 解約済みを混ぜても合計が変わらない。0件なら0円になる
- [x] **3-4 未使用サブスクの抽出** — `getUnusedSubscriptions`
  - テスト（自動）: 「よく使う」「たまに使う」「解約済み」が含まれない
- [x] **3-5 一覧に金額を表示** — 表示は `formatYen` で統一する
  - テスト: 3-2の表と同じ値が画面に表示される

#### フェーズ4: ダッシュボード
- [x] **4-1 サマリーカード** — 月額合計・年間合計・契約数
  - テスト: 3-3の計算結果と一致する。0件のときに案内が出る
- [x] **4-2 未使用サブスクのセクション** — 「年間◯円の節約」を表示する
  - テスト: 利用状況を「使っていない」に変えるとここに表示される

#### フェーズ5: 仕上げ・公開
- [x] **5-1 レスポンシブ確認**（375pxとPC幅）
- [ ] **5-2 ローディング・エラー表示**（`loading.tsx` / `error.tsx`）
- [ ] **5-3 本番公開** — Vercelの環境変数とSupabaseのリダイレクトURLを設定する
- [ ] **5-4 RLSの確認** — 2つのアカウントで互いのデータが見えないことを確認する

### V1.0
- [ ] **6-1 カテゴリー選択** — フォームと一覧にカテゴリーを追加し、空のものは「未分類」と表示する
- [ ] **6-2 利用状況管理の強化** — 一覧から切り替え、利用状況で絞り込み
- [ ] **6-3 グラフ表示** — カテゴリー別・利用状況別。ライブラリ（例: Recharts）はこの時点で検討する

### V2.0
- [ ] **7-1 見直し候補表示** — 判定条件は V1.0 を使ってから決める。判定関数は自動テストする

---

## 3. データベース構成

### subscriptions テーブル

| 列名 | 型 | 説明 |
|---|---|---|
| id | uuid（主キー） | 自動で作られるID |
| user_id | uuid（必須） | 持ち主（`auth.users` を参照） |
| name | text（必須） | サービス名 |
| category | text（NULL可） | カテゴリー。選択欄はV1.0で作る |
| price | integer（必須、0より大きい） | 料金（円、整数） |
| billing_cycle | text（必須） | `monthly`（月額） / `yearly`（年額） |
| next_billing_date | date（NULL可） | 次回請求日 |
| usage_status | text（必須） | `often`（よく使う） / `sometimes`（たまに使う） / `unused`（使っていない） |
| status | text（必須、初期値 `active`） | `active`（契約中） / `cancelled`（解約済み） |
| cancelled_at | date（NULL可） | 解約日 |
| memo | text（NULL可） | メモ |
| created_at / updated_at | timestamptz | 作成日時・更新日時 |

- RLS: SELECT・INSERT・UPDATE・DELETE をすべて `auth.uid() = user_id` の行に限定する
- 決まった値しか入らない列は CHECK制約で制限する
- SQLは `supabase/migrations/` に保存しておく

### カテゴリーの固定リスト（V1.0）
動画 / 音楽 / ゲーム / 学習 / 仕事 / ニュース / クラウド / その他

### 将来追加するテーブル
- `spending_snapshots` — 支出の履歴・推移を記録する

---

## 4. ファイル構成

```
sabusuku/
├─ src/
│  ├─ app/                          画面（URLと対応）
│  │  ├─ layout.tsx                 アプリ全体のレイアウト
│  │  ├─ page.tsx                   /dashboard へ移動
│  │  ├─ login/page.tsx             （ヘッダーなし）
│  │  ├─ signup/page.tsx            （ヘッダーなし）
│  │  ├─ auth/                      ログイン処理・確認メールの戻り先
│  │  └─ (main)/                    ログイン後の画面（URLには含まれない）
│  │     ├─ layout.tsx              ヘッダー付きレイアウト
│  │     ├─ dashboard/page.tsx
│  │     └─ subscriptions/
│  │        ├─ page.tsx             一覧
│  │        ├─ new/page.tsx         新規登録
│  │        ├─ [id]/edit/page.tsx   編集
│  │        └─ actions.ts           登録・更新・削除の処理
│  ├─ components/                   画面の部品
│  │  ├─ auth/                      LoginForm, SignupForm
│  │  ├─ layout/                    Header, NavLinks
│  │  ├─ ui/                        Button, Input, Card など
│  │  ├─ subscriptions/             SubscriptionForm, SubscriptionList, DeleteButton
│  │  └─ dashboard/                 SummaryCards, UnusedSection
│  ├─ lib/                          画面以外のロジック
│  │  ├─ supabase/client.ts, server.ts
│  │  ├─ calculations.ts
│  │  ├─ calculations.test.ts
│  │  ├─ constants.ts
│  │  ├─ format.ts
│  │  └─ validation.ts
│  ├─ types/subscription.ts
│  └─ proxy.ts                      ログインチェック
├─ supabase/migrations/
├─ docs/implementation-plan.md      この計画
├─ .env.local                       秘密情報（Gitに入れない）
└─ CLAUDE.md
```

---

## 5. テストの方針

| 種類 | 対象 | 方法 |
|---|---|---|
| 自動テスト | 計算・入力チェック | Vitest（`npm test`） |
| 手動テスト | 画面の操作 | 各ステップのテスト項目を確認する |
| データの確認 | 保存内容 | SupabaseのTable Editor |
| セキュリティ | RLS | 2つのアカウントで確認する |
| 毎回 | 全体 | `npm run build` と `npm run lint` |

---

## 6. Gitの運用

- ステップごとにブランチを作る（例: `feature/2-3-add-form`）
- 動作確認ができたらコミットし、`main` にマージする
- `.env.local` は絶対にコミットしない
