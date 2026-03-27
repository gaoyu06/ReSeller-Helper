"use client";

import { useActionState } from "react";
import type { LoginFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  hints?: string[];
  action: (
    state: LoginFormState,
    formData: FormData,
  ) => Promise<LoginFormState>;
};

const initialState: LoginFormState = {};

export function LoginForm({
  title,
  description,
  submitLabel,
  hints,
  action,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card className="w-full max-w-[420px] rounded-[28px]">
      <CardHeader className="p-6 pb-0">
        <p className="text-[11px] tracking-[0.12em] text-amber-300/70">账号登录</p>
        <CardTitle className="mt-3 font-display text-[2rem]">{title}</CardTitle>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </CardHeader>

      <CardContent className="p-6">
        <form action={formAction} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="login-username">用户名</Label>
            <Input
              id="login-username"
              name="username"
              autoComplete="username"
              placeholder="请输入用户名"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="login-password">密码</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
            />
          </div>

          {state.error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {state.error}
            </div>
          ) : null}

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "登录中..." : submitLabel}
          </Button>
        </form>

        {hints?.length ? (
          <div className="mt-5 rounded-[20px] border border-white/8 bg-white/5 p-4">
            <div className="text-[11px] tracking-[0.08em] text-zinc-500">演示账号</div>
            <ul className="mt-2.5 grid gap-1.5 text-sm text-zinc-300">
              {hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
