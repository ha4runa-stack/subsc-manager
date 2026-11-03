-- =====================================================================
-- 001: subscriptions テーブルの作成
--
-- このファイルは Supabase の「SQL Editor」に貼り付けて実行します。
-- 一度実行したら、このファイルは書き換えずに残しておきます。
-- （テーブルを変更したいときは 002_xxx.sql のように新しいファイルを作ります）
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. テーブル本体
-- ---------------------------------------------------------------------
create table public.subscriptions (
  -- ID：自動で作られる、他と重ならない番号
  id uuid primary key default gen_random_uuid(),

  -- 持ち主：ログイン中のユーザーのIDが自動で入る
  -- （ユーザーが削除されたら、その人のサブスクも一緒に削除される）
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,

  -- サービス名：必須、1〜100文字
  name text not null check (char_length(name) between 1 and 100),

  -- カテゴリー：空でもOK（選択欄は V1.0 で作る）
  -- 選べる値はアプリ側（constants.ts）で管理する
  category text,

  -- 料金（円）：必須、1円以上の整数
  price integer not null check (price > 0),

  -- 契約周期：monthly（月額）か yearly（年額）のどちらか
  billing_cycle text not null
    check (billing_cycle in ('monthly', 'yearly')),

  -- 次回請求日：空でもOK
  next_billing_date date,

  -- 利用状況：often（よく使う）/ sometimes（たまに使う）/ unused（使っていない）
  usage_status text not null
    check (usage_status in ('often', 'sometimes', 'unused')),

  -- 契約状況：active（契約中）/ cancelled（解約済み）。最初は契約中
  status text not null default 'active'
    check (status in ('active', 'cancelled')),

  -- 解約日：解約済みにしたときに入れる
  cancelled_at date,

  -- メモ：空でもOK、1000文字まで
  memo text check (memo is null or char_length(memo) <= 1000),

  -- 作成日時・更新日時：自動で入る
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 「自分のサブスクを探す」処理を速くするための索引（本の索引と同じ役割）
create index subscriptions_user_id_idx on public.subscriptions (user_id);


-- ---------------------------------------------------------------------
-- 2. 更新日時（updated_at）を自動で書き換える仕組み
--    データが更新されるたびに、updated_at を現在時刻にする
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 3. RLS（Row Level Security：行ごとのアクセス制御）
--    「自分のデータだけ」読み書きできるようにする
-- ---------------------------------------------------------------------
alter table public.subscriptions enable row level security;

-- 見る（SELECT）：自分のデータだけ
create policy "自分のサブスクを見られる"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 追加（INSERT）：自分のデータとしてだけ追加できる
create policy "自分のサブスクを追加できる"
  on public.subscriptions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 更新（UPDATE）：自分のデータだけ、自分のデータのまま更新できる
create policy "自分のサブスクを更新できる"
  on public.subscriptions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 削除（DELETE）：自分のデータだけ
create policy "自分のサブスクを削除できる"
  on public.subscriptions for delete
  to authenticated
  using ((select auth.uid()) = user_id);


-- ---------------------------------------------------------------------
-- 4. ログイン済みユーザーがアプリからこのテーブルを使えるようにする
--    （実際にどの行を触れるかは、上の RLS で制限される）
-- ---------------------------------------------------------------------
grant select, insert, update, delete on public.subscriptions to authenticated;
