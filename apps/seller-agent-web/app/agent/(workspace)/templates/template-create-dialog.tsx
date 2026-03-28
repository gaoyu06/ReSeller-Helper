"use client";

import { useMemo, useState } from "react";
import { upsertAgentTemplate } from "@/app/agent/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TemplateOption = {
  id: string;
  name: string;
};

export function TemplateCreateDialog({
  options,
}: {
  options: TemplateOption[];
}) {
  const selectOptions = useMemo(
    () => options.map((item) => ({ value: item.id, label: item.name })),
    [options],
  );
  const [codeTypeId, setCodeTypeId] = useState(selectOptions[0]?.value ?? "");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>添加模板</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[760px]">
        <DialogHeader>
          <DialogTitle>添加模板</DialogTitle>
        </DialogHeader>
        <form action={upsertAgentTemplate} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="agent-template-code-type">卡密类型</Label>
            <FormSelect
              name="codeTypeId"
              value={codeTypeId}
              onValueChange={setCodeTypeId}
              placeholder="请选择卡密类型"
              options={selectOptions}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="agent-template-content">模板内容</Label>
            <Textarea
              id="agent-template-content"
              name="content"
              rows={8}
              placeholder={"您的兑换码如下：\n{code}"}
            />
          </div>

          <div className="flex items-center gap-3 text-sm text-[#65594d]">
            <Checkbox id="agent-template-enabled" name="enabled" defaultChecked />
            <Label htmlFor="agent-template-enabled">保存后立即启用</Label>
          </div>

          <div className="flex justify-end">
            <Button type="submit">保存模板</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
