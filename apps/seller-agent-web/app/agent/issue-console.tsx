"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelect } from "@/components/ui/form-select";

type CodeTypeOption = {
  id: string;
  name: string;
  description: string | null;
};

type Props = {
  agentName: string;
  codeTypes: CodeTypeOption[];
};

type IssueResponse =
  | {
      ok: true;
      data: {
        renderedContent: string;
        codeValue: string;
        agentName: string;
        codeTypeName: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

export function IssueConsole({ agentName, codeTypes }: Props) {
  const [codeTypeId, setCodeTypeId] = useState(codeTypes[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IssueResponse | null>(null);
  const hasCodeTypes = codeTypes.length > 0;
  const options = codeTypes.map((codeType) => ({
    value: codeType.id,
    label: codeType.name,
  }));

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codeTypeId,
        }),
      });

      const payload = (await response.json()) as IssueResponse;
      setResult(payload);
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "请求失败。",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="rounded-[24px] border-white/10 bg-[#101117]/80">
        <CardHeader className="p-5 pb-0">
          <p className="text-[11px] tracking-[0.16em] text-amber-300/70">发码台</p>
          <CardTitle className="mt-2.5 text-[1.7rem]">一步完成发码</CardTitle>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            选择你已获授权的卡密类型。系统会根据当前代理会话自动校验权限、额度、库存与模板渲染。
          </p>
        </CardHeader>

        <CardContent className="p-5">
          <form className="grid gap-3" onSubmit={onSubmit}>
            <Card className="rounded-xl border-white/8 bg-black/20 shadow-none">
              <CardContent className="px-3.5 py-3 text-sm text-zinc-300">
                当前登录：<span className="font-semibold text-white">{agentName}</span>
              </CardContent>
            </Card>

            <div className="grid gap-1.5 text-sm text-zinc-300">
              <span>卡密类型</span>
              {hasCodeTypes ? (
                <FormSelect
                  name="codeTypeId"
                  value={codeTypeId}
                  onValueChange={setCodeTypeId}
                  placeholder="请选择卡密类型"
                  options={options}
                />
              ) : (
                <Card className="rounded-xl border-white/10 bg-black/20 shadow-none">
                  <CardContent className="px-3.5 py-2.5 text-zinc-500">
                    暂无可发类型
                  </CardContent>
                </Card>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting || !hasCodeTypes}
              className="mt-1"
            >
              {submitting ? "发码中..." : hasCodeTypes ? "立即发码" : "等待授权"}
            </Button>
          </form>

          {!hasCodeTypes ? (
            <Card className="mt-5 rounded-[20px] border-dashed border-white/10 bg-black/10 shadow-none">
              <CardContent className="p-4 text-sm text-zinc-400">
                当前账号还没有任何可用类型，请先联系管理员授予发码权限。
              </CardContent>
            </Card>
          ) : null}

          {result ? (
            result.ok ? (
              <Card className="mt-5 rounded-[20px] border-emerald-400/20 bg-emerald-500/10 shadow-none">
                <CardContent className="p-4">
                <p className="text-[11px] tracking-[0.08em] text-emerald-300">发码成功</p>
                <div className="mt-2.5 text-sm text-emerald-50">
                  <p><span className="text-emerald-200/80">代理：</span>{result.data.agentName}</p>
                  <p><span className="text-emerald-200/80">类型：</span>{result.data.codeTypeName}</p>
                  <p><span className="text-emerald-200/80">卡密：</span>{result.data.codeValue}</p>
                </div>
                <pre className="mt-3 overflow-auto rounded-xl bg-black/30 p-3 text-sm text-emerald-50 whitespace-pre-wrap">
                  {result.data.renderedContent}
                </pre>
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-5 rounded-[20px] border-rose-400/20 bg-rose-500/10 shadow-none">
                <CardContent className="p-4 text-sm text-rose-100">
                  {result.error}
                </CardContent>
              </Card>
            )
          ) : null}
        </CardContent>
      </Card>

      <aside className="space-y-3">
        <Card className="rounded-[24px] border-white/10 bg-[#14161d]/80">
          <CardContent className="p-5">
            <p className="text-[11px] tracking-[0.08em] text-zinc-500">操作提示</p>
            <CardTitle className="mt-2 text-lg">会话制发码</CardTitle>
            <p className="mt-1.5 text-sm leading-6 text-zinc-400">
              这里不再随请求提交用户名和密码，接口会直接读取当前代理登录会话。
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-white/10 bg-[#14161d]/80">
          <CardContent className="p-5">
            <p className="text-[11px] tracking-[0.08em] text-zinc-500">当前选择</p>
            <div className="mt-3 grid gap-3 text-sm text-zinc-300">
              <div>
                <div className="text-zinc-500">代理账号</div>
                <div className="mt-1 font-medium text-white">{agentName}</div>
                <div className="text-zinc-400">当前已登录会话</div>
              </div>
              <div>
                <div className="text-zinc-500">可用类型</div>
                <ul className="mt-2 grid gap-2">
                  {codeTypes.map((codeType) => (
                    <Card
                      key={codeType.id}
                      className="rounded-xl border-white/6 bg-black/20 shadow-none"
                    >
                      <CardContent className="px-3.5 py-3">
                        <div className="font-medium text-white">{codeType.name}</div>
                        <div className="text-xs text-zinc-500">{codeType.description || "暂无说明"}</div>
                      </CardContent>
                    </Card>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
