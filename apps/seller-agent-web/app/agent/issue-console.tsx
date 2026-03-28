"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";

type CodeTypeOption = {
  id: string;
  name: string;
  description: string | null;
  dailyLimit: number;
  monthlyLimit: number;
  totalLimit: number;
  todayIssued: number;
  monthIssued: number;
  totalIssued: number;
  remainingToday: number;
  remainingMonth: number;
  remainingTotal: number;
  availableStock: number;
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
  const [localCodeTypes, setLocalCodeTypes] = useState(codeTypes);
  const [codeTypeId, setCodeTypeId] = useState(codeTypes[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IssueResponse | null>(null);
  const hasCodeTypes = localCodeTypes.length > 0;

  const selectedType = useMemo(
    () => localCodeTypes.find((codeType) => codeType.id === codeTypeId) ?? localCodeTypes[0],
    [codeTypeId, localCodeTypes],
  );

  const options = localCodeTypes.map((codeType) => ({
    value: codeType.id,
    label: codeType.name,
  }));

  const exhausted =
    !selectedType ||
    selectedType.availableStock <= 0 ||
    selectedType.remainingToday <= 0 ||
    selectedType.remainingMonth <= 0 ||
    selectedType.remainingTotal <= 0;

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
      if (payload.ok) {
        setLocalCodeTypes((current) =>
          current.map((item) =>
            item.id === codeTypeId
              ? {
                  ...item,
                  todayIssued: item.todayIssued + 1,
                  monthIssued: item.monthIssued + 1,
                  totalIssued: item.totalIssued + 1,
                  remainingToday: Math.max(item.remainingToday - 1, 0),
                  remainingMonth: Math.max(item.remainingMonth - 1, 0),
                  remainingTotal: Math.max(item.remainingTotal - 1, 0),
                  availableStock: Math.max(item.availableStock - 1, 0),
                }
              : item,
          ),
        );
      }
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
    <section className="grid gap-4">
      <div>
        <div className="section-label">发码台</div>
        <h1 className="mt-2 text-[1.8rem] font-semibold text-[#1f1a17]">发码</h1>
        <p className="mt-1 text-sm text-[#5f5347]">当前登录：{agentName}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="rounded-[24px] border border-[#d9cebf] bg-[rgba(248,244,237,0.95)] p-4">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-[#4f443a]">卡密类型</div>
              {hasCodeTypes ? (
                <FormSelect
                  name="codeTypeId"
                  value={codeTypeId}
                  onValueChange={setCodeTypeId}
                  placeholder="请选择卡密类型"
                  options={options}
                />
              ) : (
                <div className="rounded-[16px] border border-dashed border-[#d9cdbc] bg-[#f7f1e8] px-3 py-2.5 text-sm text-[#5f5347]">
                  暂无可发类型，请联系管理员授权。
                </div>
              )}
            </div>

            {selectedType ? (
              <div className="grid gap-2">
                <StatLine label="库存" value={String(selectedType.availableStock)} />
                <StatLine
                  label="今日"
                  value={`${selectedType.remainingToday} / ${selectedType.dailyLimit}`}
                />
                <StatLine
                  label="本月"
                  value={`${selectedType.remainingMonth} / ${selectedType.monthlyLimit}`}
                />
                <StatLine
                  label="累计"
                  value={`${selectedType.remainingTotal} / ${selectedType.totalLimit}`}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={submitting || !hasCodeTypes || exhausted}>
                {submitting ? "发码中..." : hasCodeTypes ? "立即发码" : "等待授权"}
              </Button>
              {selectedType?.description ? (
                <div className="text-xs text-[#74685b]">{selectedType.description}</div>
              ) : null}
            </div>
          </form>
        </div>

        <div className="grid gap-4">
          {selectedType ? (
            <div className="rounded-[24px] border border-[#ddd2c4] bg-[#fbf7f1] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#1f1a17]">{selectedType.name}</div>
                  <div className="mt-1 text-xs text-[#74685b]">
                    已发 {selectedType.totalIssued}，当前按该类型单独计算额度。
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <QuotaCard
                  label="今日"
                  used={selectedType.todayIssued}
                  remaining={selectedType.remainingToday}
                  limit={selectedType.dailyLimit}
                />
                <QuotaCard
                  label="本月"
                  used={selectedType.monthIssued}
                  remaining={selectedType.remainingMonth}
                  limit={selectedType.monthlyLimit}
                />
                <QuotaCard
                  label="累计"
                  used={selectedType.totalIssued}
                  remaining={selectedType.remainingTotal}
                  limit={selectedType.totalLimit}
                />
              </div>
            </div>
          ) : null}

          {result ? (
            result.ok ? (
              <div className="rounded-[24px] border border-[#c8d5c8] bg-[#eef4ee] p-4">
                <div className="text-sm font-medium text-[#36533f]">发码成功</div>
                <div className="mt-2 text-sm text-[#36533f]">
                  {result.data.codeTypeName} / {result.data.codeValue}
                </div>
                <pre className="mt-3 overflow-auto rounded-[16px] border border-[#d1ddd1] bg-[#f8fbf8] p-3 text-sm whitespace-pre-wrap text-[#36533f]">
                  {result.data.renderedContent}
                </pre>
              </div>
            ) : (
              <div className="rounded-[24px] border border-[#ddc0be] bg-[#f8eceb] px-4 py-3 text-sm text-[#7f4d49]">
                {result.error}
              </div>
            )
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#ddd1c3] bg-[#f8f3eb] px-4 py-6 text-sm text-[#74685b]">
              发码结果会显示在这里。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-[#e3d7c9] bg-[#f8f3eb] px-3 py-2 text-sm">
      <span className="text-[#5f5347]">{label}</span>
      <span className="font-medium text-[#1f1a17]">{value}</span>
    </div>
  );
}

function QuotaCard({
  label,
  used,
  remaining,
  limit,
}: {
  label: string;
  used: number;
  remaining: number;
  limit: number;
}) {
  const ratio = limit <= 0 ? 0 : Math.min(used / limit, 1);

  return (
    <div className="rounded-[18px] border border-[#e3d7c9] bg-[#f8f3eb] px-3 py-3">
      <div className="text-[11px] tracking-[0.08em] text-[#74685b] uppercase">{label}</div>
      <div className="mt-2 text-sm text-[#1f1a17]">剩余 {remaining}</div>
      <div className="mt-1 text-xs text-[#74685b]">
        已发 {used} / 总额度 {limit}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6dbce]">
        <div
          className="h-full rounded-full bg-[#5f5447]"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
