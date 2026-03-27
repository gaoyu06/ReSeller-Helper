"use client";

import { useActionState } from "react";
import type { PasswordActionState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  action: (
    state: PasswordActionState,
    formData: FormData,
  ) => Promise<PasswordActionState>;
};

const initialState: PasswordActionState = {};

export function PasswordChangeForm({
  title,
  description,
  submitLabel,
  action,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="panel grid gap-3">
      <div>
        <div className="section-label">密码修改</div>
        <h2 className="mt-2.5 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          {description}
        </p>
      </div>

      <div className="grid gap-1.5 text-sm text-zinc-300">
        <Label htmlFor="current-password">当前密码</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="请输入当前密码"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5 text-sm text-zinc-300">
          <Label htmlFor="new-password">新密码</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="至少 6 位字符"
          />
        </div>

        <div className="grid gap-1.5 text-sm text-zinc-300">
          <Label htmlFor="confirm-password">确认新密码</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="再次输入新密码"
          />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {state.success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs tracking-[0.08em] text-zinc-500">
          密码长度至少 6 位
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
