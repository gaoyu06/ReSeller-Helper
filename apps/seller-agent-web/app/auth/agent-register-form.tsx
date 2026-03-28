"use client";

import { useActionState } from "react";
import type { RegisterFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (
    state: RegisterFormState,
    formData: FormData,
  ) => Promise<RegisterFormState>;
};

const initialState: RegisterFormState = {};

export function AgentRegisterForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card className="surface-muted w-full rounded-[28px]">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="mt-3 font-display text-[2rem]">代理注册</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form action={formAction} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="register-name">显示名称</Label>
            <Input id="register-name" name="name" placeholder="请输入显示名称" />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="register-username">用户名</Label>
            <Input
              id="register-username"
              name="username"
              autoComplete="username"
              placeholder="仅支持字母、数字、下划线和中划线"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="register-password">登录密码</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="至少 6 位字符"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="register-confirm-password">确认密码</Label>
              <Input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="再次输入密码"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="register-note">申请说明</Label>
            <Textarea
              id="register-note"
              name="applicationNote"
              rows={4}
              placeholder="选填"
            />
          </div>

          {state.error ? (
            <div className="rounded-2xl border border-[#dec2c2] bg-[#f8eceb] px-4 py-3 text-sm text-[#7f4d49]">
              {state.error}
            </div>
          ) : null}

          {state.success ? (
            <div className="rounded-2xl border border-[#c8d5c8] bg-[#eef4ee] px-4 py-3 text-sm text-[#4b6750]">
              {state.success}
            </div>
          ) : null}

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "提交中..." : "提交"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
