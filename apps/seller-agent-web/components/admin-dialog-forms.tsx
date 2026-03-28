"use client";

import { useMemo, useState } from "react";
import type { AgentReviewStatus } from "@prisma/client";
import {
  approveAgentApplication,
  grantPermission,
  importCodes,
  rejectAgentApplication,
  upsertAgent,
  upsertCodeType,
} from "@/app/admin/actions";
import { changeAdminPasswordAction, changeAgentPasswordAction } from "@/app/auth/actions";
import { PasswordChangeForm } from "@/components/password-change-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AgentOption = {
  id: string;
  name: string;
  username: string;
};

type PermissionOption = {
  agentId: string;
  codeTypeId: string;
  dailyLimit: number;
  monthlyLimit: number;
  totalLimit: number;
};

type ReviewAgent = {
  id: string;
  name: string;
  username: string;
  reviewNote: string | null;
  applicationNote: string | null;
  reviewStatus: AgentReviewStatus;
};

type CodeTypeOption = {
  id: string;
  name: string;
};

type EditableCodeType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  defaultTemplate: string;
  isActive: boolean;
};

export function AgentCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>创建代理</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建代理</DialogTitle>
          <DialogDescription>新建代理账号，额度在下方按类型配置。</DialogDescription>
        </DialogHeader>
        <form action={upsertAgent} className="grid gap-3">
          <FormField label="显示名称" name="name" placeholder="输入代理名称" />
          <FormField label="用户名" name="username" placeholder="输入登录用户名" />
          <FormField
            label="登录密码"
            name="password"
            type="password"
            placeholder="至少 6 位字符"
          />
          <CheckboxField name="isActive" label="创建后立即启用" defaultChecked />
          <div className="flex justify-end">
            <Button type="submit">创建代理</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AgentEditDialog({
  agent,
}: {
  agent: AgentOption & { isActive: boolean };
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">编辑</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑代理</DialogTitle>
          <DialogDescription>修改账号信息，不在这里设置类型额度。</DialogDescription>
        </DialogHeader>
        <form action={upsertAgent} className="grid gap-3">
          <input type="hidden" name="id" value={agent.id} />
          <FormField label="显示名称" name="name" defaultValue={agent.name} />
          <FormField label="用户名" name="username" defaultValue={agent.username} />
          <FormField
            label="重置密码"
            name="password"
            type="password"
            placeholder="留空表示不修改"
          />
          <CheckboxField name="isActive" label="账号启用" defaultChecked={agent.isActive} />
          <div className="flex justify-end">
            <Button type="submit">保存修改</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AgentReviewDialog({
  agent,
}: {
  agent: ReviewAgent;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">审核</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>审核代理申请</DialogTitle>
          <DialogDescription>
            @{agent.username}
            {agent.applicationNote ? ` · ${agent.applicationNote}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <form action={approveAgentApplication} className="grid gap-3 rounded-[20px] border border-[#dcd1c4] bg-[#f8f3eb] p-4">
            <input type="hidden" name="id" value={agent.id} />
            <FormField label="显示名称" name="name" defaultValue={agent.name} />
            <FormField label="审核备注" name="reviewNote" defaultValue={agent.reviewNote ?? ""} />
            <CheckboxField name="isActive" label="通过后立即启用" defaultChecked />
            <div className="flex justify-end">
              <Button type="submit">通过申请</Button>
            </div>
          </form>
          <form action={rejectAgentApplication} className="grid gap-3 rounded-[20px] border border-[#e0c6c4] bg-[#f8eceb] p-4">
            <input type="hidden" name="id" value={agent.id} />
            <FormField label="驳回原因" name="reviewNote" defaultValue={agent.reviewNote ?? ""} />
            <div className="flex justify-end">
              <Button type="submit" variant="danger">
                驳回申请
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PermissionDialog({
  agents,
  codeTypes,
  initialValue,
  triggerLabel,
  triggerVariant = "default",
}: {
  agents: AgentOption[];
  codeTypes: CodeTypeOption[];
  initialValue?: PermissionOption;
  triggerLabel: string;
  triggerVariant?: "default" | "outline";
}) {
  const agentOptions = useMemo(
    () => agents.map((agent) => ({ value: agent.id, label: `${agent.name} (@${agent.username})` })),
    [agents],
  );
  const codeTypeOptions = useMemo(
    () => codeTypes.map((codeType) => ({ value: codeType.id, label: codeType.name })),
    [codeTypes],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{triggerLabel}</DialogTitle>
          <DialogDescription>按卡密类型单独设置代理额度。</DialogDescription>
        </DialogHeader>
        <form action={grantPermission} className="grid gap-3">
          <SelectField
            label="代理账号"
            name="agentId"
            options={agentOptions}
            defaultValue={initialValue?.agentId ?? agentOptions[0]?.value}
          />
          <SelectField
            label="卡密类型"
            name="codeTypeId"
            options={codeTypeOptions}
            defaultValue={initialValue?.codeTypeId ?? codeTypeOptions[0]?.value}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="日额度" name="dailyLimit" type="number" defaultValue={String(initialValue?.dailyLimit ?? 5)} />
            <FormField label="月额度" name="monthlyLimit" type="number" defaultValue={String(initialValue?.monthlyLimit ?? 60)} />
            <FormField label="总额度" name="totalLimit" type="number" defaultValue={String(initialValue?.totalLimit ?? 500)} />
          </div>
          <div className="flex justify-end">
            <Button type="submit">保存额度</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CodeTypeDialog({
  triggerLabel,
  triggerVariant = "default",
  initialValue,
}: {
  triggerLabel: string;
  triggerVariant?: "default" | "outline";
  initialValue?: EditableCodeType;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerVariant === "default" ? "default" : "sm"}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{triggerLabel}</DialogTitle>
          <DialogDescription>配置卡密类型与默认模板。</DialogDescription>
        </DialogHeader>
        <form action={upsertCodeType} className="grid gap-3">
          {initialValue ? <input type="hidden" name="id" value={initialValue.id} /> : null}
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="名称" name="name" defaultValue={initialValue?.name} placeholder="月卡" />
            <FormField
              label="标识"
              name="slug"
              defaultValue={initialValue?.slug}
              placeholder="monthly-card"
            />
          </div>
          <FormField
            label="说明"
            name="description"
            defaultValue={initialValue?.description ?? ""}
            placeholder="标准月卡兑换码"
          />
          <TextAreaField
            label="默认模板"
            name="defaultTemplate"
            defaultValue={initialValue?.defaultTemplate}
            placeholder="兑换码：{code}"
          />
          <CheckboxField
            name="isActive"
            label="启用状态"
            defaultChecked={initialValue ? initialValue.isActive : true}
          />
          <div className="flex justify-end">
            <Button type="submit">保存类型</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryImportDialog({
  codeTypes,
}: {
  codeTypes: CodeTypeOption[];
}) {
  const options = codeTypes.map((codeType) => ({
    value: codeType.id,
    label: codeType.name,
  }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>导入库存</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[760px]">
        <DialogHeader>
          <DialogTitle>导入库存</DialogTitle>
          <DialogDescription>按行粘贴卡密内容并指定所属类型。</DialogDescription>
        </DialogHeader>
        <form action={importCodes} className="grid gap-3">
          <SelectField
            label="卡密类型"
            name="codeTypeId"
            options={options}
            defaultValue={options[0]?.value}
          />
          <FormField
            label="批次标签"
            name="importBatch"
            placeholder="batch-2026-03-27"
          />
          <TextAreaField
            label="卡密内容（每行一个）"
            name="codes"
            placeholder={"MONTH-4001\nMONTH-4002\nMONTH-4003"}
            rows={10}
          />
          <div className="flex justify-end">
            <Button type="submit">导入卡密</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPasswordDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>修改密码</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>修改管理员密码</DialogTitle>
          <DialogDescription>保存后旧管理员会话会失效。</DialogDescription>
        </DialogHeader>
        <PasswordChangeForm
          title="修改管理员密码"
          description="先输入当前密码确认身份。系统会替换旧管理员会话，避免旧凭证继续可用。"
          submitLabel="保存新密码"
          action={changeAdminPasswordAction}
        />
      </DialogContent>
    </Dialog>
  );
}

export function AgentPasswordDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>修改密码</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>修改代理密码</DialogTitle>
          <DialogDescription>保存后旧代理会话会失效。</DialogDescription>
        </DialogHeader>
        <PasswordChangeForm
          title="修改代理密码"
          description="建议为代理账号设置强密码。新密码保存后，系统会撤销旧代理会话。"
          submitLabel="保存新密码"
          action={changeAgentPasswordAction}
        />
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 6,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-[#65594d]">
      <Checkbox id={name} name={name} defaultChecked={defaultChecked} />
      <Label htmlFor={name}>{label}</Label>
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? "");

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <FormSelect
        name={name}
        value={value}
        onValueChange={setValue}
        placeholder={`请选择${label}`}
        options={options}
      />
    </div>
  );
}
