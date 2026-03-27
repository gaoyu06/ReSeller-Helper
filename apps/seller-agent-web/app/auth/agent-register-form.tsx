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
    <Card className="w-full rounded-[28px]">
      <CardHeader className="p-6 pb-0">
        <p className="text-[11px] tracking-[0.12em] text-sky-300/70">代理注册</p>
        <CardTitle className="mt-3 font-display text-[2rem]">提交代理申请</CardTitle>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          提交后将进入管理员审核。审核通过后，管理员会为你配置额度、启用状态与发码权限。
        </p>
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
              placeholder="可填写渠道说明、业务方向或备注信息。"
            />
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

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "提交中..." : "提交注册申请"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
