"use client";

import { useActionState } from "react";
import type { PasswordActionState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  title: string;
  description?: string;
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
        <h2 className="mt-2 text-xl font-semibold text-[#1f1a17]">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#5f5347]">
            {description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5 text-sm text-[#5f5347]">
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
        <div className="grid gap-1.5 text-sm text-[#5f5347]">
          <Label htmlFor="new-password">新密码</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="至少 6 位字符"
          />
        </div>

        <div className="grid gap-1.5 text-sm text-[#5f5347]">
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
        <div className="rounded-2xl border border-[#ddc0be] bg-[#f8eceb] px-4 py-3 text-sm text-[#7f4d49]">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl border border-[#c8d5c8] bg-[#eef4ee] px-4 py-3 text-sm text-[#4b6750]">
          {state.success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
