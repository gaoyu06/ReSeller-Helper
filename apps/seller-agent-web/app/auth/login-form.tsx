"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { LoginFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TabItem = {
  href: string;
  label: string;
  active?: boolean;
};

type Props = {
  title: string;
  submitLabel: string;
  action: (
    state: LoginFormState,
    formData: FormData,
  ) => Promise<LoginFormState>;
  tabs?: TabItem[];
};

const initialState: LoginFormState = {};

export function LoginForm({
  title,
  submitLabel,
  action,
  tabs,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card className="surface-strong w-full max-w-[440px] rounded-[28px]">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="mt-3 font-display text-[2rem]">{title}</CardTitle>
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

          <div className="flex items-center gap-3 text-sm text-[#5f5347]">
            <Checkbox id="login-remember-me" name="rememberMe" />
            <Label htmlFor="login-remember-me">保持登录 30 天</Label>
          </div>

          {state.error ? (
            <div className="rounded-2xl border border-[#dec2c2] bg-[#f8eceb] px-4 py-3 text-sm text-[#7f4d49]">
              {state.error}
            </div>
          ) : null}

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "登录中..." : submitLabel}
          </Button>
        </form>

        {tabs?.length ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e2d7ca] pt-4">
            {tabs.map((tab) =>
              tab.active ? (
                <span
                  key={tab.href}
                  className="inline-flex items-center rounded-full border border-[#d8ccbe] bg-[#f4ede3] px-3 py-1.5 text-xs text-[#4f453a]"
                >
                  {tab.label}
                </span>
              ) : (
                <Button key={tab.href} asChild variant="link" size="sm" className="h-auto px-0 py-0">
                  <Link href={tab.href}>{tab.label}</Link>
                </Button>
              ),
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
