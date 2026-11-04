// =====================================================================
// サブスクの登録・編集フォーム
//
// 登録画面と編集画面の両方で使えるように、
//   action        … 送信したときに呼ぶ処理（登録 or 更新）
//   initialValues … 最初に入っている値（登録なら空、編集なら今の値）
//   submitLabel   … ボタンの文字
// を外から受け取る。
// =====================================================================
"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { SubscriptionFormState } from "@/app/(main)/subscriptions/actions";
import type { SubscriptionFormValues } from "@/lib/validation";
import {
  BILLING_CYCLE_LABELS,
  CATEGORIES,
  UNCATEGORIZED_LABEL,
  USAGE_STATUS_LABELS,
} from "@/lib/constants";
import type { BillingCycle, UsageStatus } from "@/types/subscription";

type Props = {
  action: (
    prevState: SubscriptionFormState,
    formData: FormData,
  ) => Promise<SubscriptionFormState>;
  initialValues: SubscriptionFormValues;
  submitLabel: string;
};

// 選択肢（定数ファイルのラベルから作る）
const billingCycles = Object.entries(BILLING_CYCLE_LABELS) as [
  BillingCycle,
  string,
][];
const usageStatuses = Object.entries(USAGE_STATUS_LABELS) as [
  UsageStatus,
  string,
][];

export function SubscriptionForm({ action, initialValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues,
    errors: {},
    message: null,
  });

  // エラーで戻ってきたときも、入力した値が消えないように state.values を使う
  const values = state.values;
  const errors = state.errors;

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5 rounded-xl bg-white p-6 shadow-sm"
    >
      {/* サービス名 */}
      <Field label="サービス名" htmlFor="name" required error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={values.name}
          placeholder="例：Netflix"
          maxLength={100}
          className={inputClass(errors.name)}
        />
      </Field>

      {/* カテゴリー（選ばなければ「未分類」） */}
      <Field label="カテゴリー" htmlFor="category" error={errors.category}>
        <select
          // key：値が変わったら選択欄を作り直す。
          // 入力エラーで戻ってきたときも、選んだカテゴリーを残すため
          key={values.category}
          id="category"
          name="category"
          defaultValue={values.category}
          className={`${inputClass(errors.category)} bg-white`}
        >
          <option value="">{UNCATEGORIZED_LABEL}</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      {/* 料金 */}
      <Field label="料金（円）" htmlFor="price" required error={errors.price}>
        <input
          id="price"
          name="price"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          defaultValue={values.price}
          placeholder="例：1490"
          className={inputClass(errors.price)}
        />
      </Field>

      {/* 契約周期 */}
      <RadioGroup
        legend="契約周期"
        name="billing_cycle"
        options={billingCycles}
        defaultValue={values.billing_cycle}
        error={errors.billing_cycle}
      />

      {/* 次回請求日 */}
      <Field
        label="次回請求日"
        htmlFor="next_billing_date"
        error={errors.next_billing_date}
      >
        <input
          id="next_billing_date"
          name="next_billing_date"
          type="date"
          defaultValue={values.next_billing_date}
          className={inputClass(errors.next_billing_date)}
        />
      </Field>

      {/* 利用状況 */}
      <RadioGroup
        legend="利用状況"
        name="usage_status"
        options={usageStatuses}
        defaultValue={values.usage_status}
        error={errors.usage_status}
      />

      {/* メモ */}
      <Field label="メモ" htmlFor="memo" error={errors.memo}>
        <textarea
          id="memo"
          name="memo"
          rows={3}
          maxLength={1000}
          defaultValue={values.memo}
          placeholder="例：家族で共有している"
          className={inputClass(errors.memo)}
        />
      </Field>

      {/* 保存失敗などのエラー */}
      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {/* ボタン */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/subscriptions"
          className="rounded-lg border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "保存中…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------
// 以下はフォームの中で使う小さな部品
// ---------------------------------------------------------------------

// 入力欄の見た目（エラーがあれば赤い枠）
function inputClass(error?: string) {
  return `w-full rounded-lg border px-3 py-2 ${
    error ? "border-red-500" : "border-gray-300"
  }`;
}

// ラベル＋入力欄＋エラーメッセージのセット
function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// ラジオボタンのグループ（どれか1つを選ぶ）
function RadioGroup({
  legend,
  name,
  options,
  defaultValue,
  error,
}: {
  legend: string;
  name: string;
  options: [string, string][];
  defaultValue: string;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium">
        {legend}
        <span className="ml-1 text-red-600">*</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, label]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
          >
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
            />
            {label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}
