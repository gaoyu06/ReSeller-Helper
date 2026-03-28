"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PermissionCard = {
  id: string;
  codeTypeId: string;
  name: string;
  description: string | null;
  dailyLimit: number;
  monthlyLimit: number;
  totalLimit: number;
  todayIssued: number;
  monthIssued: number;
  totalIssued: number;
  remainingToday: number | null;
  remainingMonth: number | null;
  remainingTotal: number | null;
  availableStock: number;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  codeTypeName: string;
  codeValue: string;
  renderedContent: string;
};

type Props = {
  permissions: PermissionCard[];
  history: HistoryItem[];
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

type ModalState =
  | {
      type: "issue";
      codeTypeId: string;
      title: string;
      description: string;
      content?: string;
      codeValue?: string;
      error?: string;
    }
  | {
      type: "history";
      title: string;
      description: string;
      content: string;
      codeValue: string;
    };

export function AgentHomeConsole({ permissions, history }: Props) {
  const [cards, setCards] = useState(permissions);
  const [historyItems, setHistoryItems] = useState(history);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const orderedHistory = useMemo(() => historyItems, [historyItems]);

  async function issueFromCard(card: PermissionCard) {
    setCopied(false);
    setModal({
      type: "issue",
      codeTypeId: card.codeTypeId,
      title: card.name,
      description: "正在发码，请稍候。",
    });

    startTransition(async () => {
      try {
        const response = await fetch("/api/issue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codeTypeId: card.codeTypeId,
          }),
        });

        const payload = (await response.json()) as IssueResponse;

        if (!payload.ok) {
          setModal({
            type: "issue",
            codeTypeId: card.codeTypeId,
            title: card.name,
            description: "发码失败",
            error: payload.error,
          });
          return;
        }

        const nextContent = payload.data.renderedContent;
        setCards((current) =>
          current.map((item) =>
            item.codeTypeId === card.codeTypeId
              ? {
                  ...item,
                  todayIssued: item.todayIssued + 1,
                  monthIssued: item.monthIssued + 1,
                  totalIssued: item.totalIssued + 1,
                  remainingToday: decrementRemaining(item.remainingToday),
                  remainingMonth: decrementRemaining(item.remainingMonth),
                  remainingTotal: decrementRemaining(item.remainingTotal),
                  availableStock: Math.max(item.availableStock - 1, 0),
                }
              : item,
          ),
        );

        setModal({
          type: "issue",
          codeTypeId: card.codeTypeId,
          title: payload.data.codeTypeName,
          description: "点击下面内容可直接复制。",
          content: nextContent,
          codeValue: payload.data.codeValue,
        });
        setHistoryItems((current) => [
          {
            id: `${card.codeTypeId}-${Date.now()}`,
            createdAt: formatDateTime(new Date()),
            codeTypeName: payload.data.codeTypeName,
            codeValue: payload.data.codeValue,
            renderedContent: nextContent,
          },
          ...current,
        ].slice(0, 20));
      } catch (error) {
        setModal({
          type: "issue",
          codeTypeId: card.codeTypeId,
          title: card.name,
          description: "发码失败",
          error: error instanceof Error ? error.message : "请求失败。",
        });
      }
    });
  }

  async function copyContent(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="grid gap-4 py-1">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const disabled =
            card.availableStock <= 0 ||
            isLimitExhausted(card.remainingToday) ||
            isLimitExhausted(card.remainingMonth) ||
            isLimitExhausted(card.remainingTotal);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => issueFromCard(card)}
              disabled={disabled || isPending}
              className="grid gap-3 rounded-[22px] border border-[#d9cebf] bg-[rgba(248,244,237,0.96)] p-3.5 text-left transition hover:border-[#cabba9] hover:bg-[#fcf8f2] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-semibold text-[#1f1a17]">{card.name}</div>
                  {card.description ? (
                    <div className="mt-1 text-xs text-[#74685b]">{card.description}</div>
                  ) : null}
                </div>
                <div className="rounded-full border border-[#dfd3c5] bg-[#f8f1e8] px-2 py-0.75 text-[11px] text-[#5f5347]">
                  库存 {card.availableStock}
                </div>
              </div>

              <div className="grid gap-1.5">
                <MetricStrip label="今日" remaining={card.remainingToday} limit={card.dailyLimit} />
                <MetricStrip label="本月" remaining={card.remainingMonth} limit={card.monthlyLimit} />
                <MetricStrip label="累计" remaining={card.remainingTotal} limit={card.totalLimit} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#74685b]">{disabled ? getDisabledReason(card) : "点击即发码"}</span>
                <span className="font-medium text-[#1f1a17]">{isPending ? "处理中" : "发码"}</span>
              </div>
            </button>
          );
        })}
      </section>

      <section className="rounded-[24px] border border-[#ddd2c4] bg-[rgba(249,245,238,0.94)] p-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="section-label">最近发码</div>
          <div className="text-[11px] text-[#8f8172]">{orderedHistory.length} 条</div>
        </div>

        {orderedHistory.length ? (
          <div className="grid gap-2">
            {orderedHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCopied(false);
                  setModal({
                    type: "history",
                    title: item.codeTypeName,
                    description: item.createdAt,
                    content: item.renderedContent,
                    codeValue: item.codeValue,
                  });
                }}
                className="grid gap-1 rounded-[16px] border border-[#e1d6c8] bg-[#fbf7f1] px-3 py-2.5 text-left transition hover:bg-[#f7f1e8]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-medium text-[#1f1a17]">{item.codeTypeName}</div>
                  <div className="text-xs text-[#8f8172]">{item.createdAt}</div>
                </div>
                <div className="font-mono text-xs text-[#5f5347]">{item.codeValue}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[#ddd1c3] bg-[#f8f3eb] px-4 py-6 text-sm text-[#74685b]">
            暂无记录
          </div>
        )}
      </section>

      <Dialog open={modal !== null} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{modal?.title}</DialogTitle>
            <DialogDescription>{modal?.description}</DialogDescription>
          </DialogHeader>

          {modal && "error" in modal && modal.error ? (
            <div className="rounded-[18px] border border-[#ddc0be] bg-[#f8eceb] px-4 py-3 text-sm text-[#7f4d49]">
              {modal.error}
            </div>
          ) : null}

          {modal && modal.content
            ? (() => {
                const content = modal.content;
                const codeValue = modal.codeValue;

                return (
                  <button
                    type="button"
                    onClick={() => copyContent(content)}
                    className="grid w-full gap-2 rounded-[20px] border border-[#dcd1c4] bg-[#f8f3eb] p-4 text-left transition hover:bg-[#f4ede3]"
                  >
                    {codeValue ? (
                      <div className="font-mono text-xs text-[#5f5347]">{codeValue}</div>
                    ) : null}
                    <pre className="whitespace-pre-wrap text-sm leading-6 text-[#1f1a17]">
                      {content}
                    </pre>
                    {copied ? <div className="text-xs text-[#74685b]">已复制到剪贴板</div> : null}
                  </button>
                );
              })()
            : null}

          {modal && modal.type === "issue" && !modal.content && !modal.error ? (
            <div className="rounded-[18px] border border-[#ddd1c3] bg-[#f8f3eb] px-4 py-6 text-sm text-[#74685b]">
              正在发码，请稍候。
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function MetricStrip({
  label,
  remaining,
  limit,
}: {
  label: string;
  remaining: number | null;
  limit: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#e3d7c9] bg-[#f8f3eb] px-3 py-1.75 text-sm">
      <span className="text-[#5f5347]">{label}</span>
      <span className="font-medium text-[#1f1a17]">
        {formatLimitPair(remaining, limit)}
      </span>
    </div>
  );
}

function isLimitExhausted(remaining: number | null) {
  return remaining !== null && remaining <= 0;
}

function decrementRemaining(remaining: number | null) {
  if (remaining === null) {
    return null;
  }

  return Math.max(remaining - 1, 0);
}

function formatLimitPair(remaining: number | null, limit: number) {
  if (limit <= 0 || remaining === null) {
    return "不限";
  }

  return `${remaining} / ${limit}`;
}

function getDisabledReason(card: PermissionCard) {
  if (card.availableStock <= 0) {
    return "库存不足";
  }

  if (isLimitExhausted(card.remainingToday)) {
    return "今日额度已满";
  }

  if (isLimitExhausted(card.remainingMonth)) {
    return "本月额度已满";
  }

  if (isLimitExhausted(card.remainingTotal)) {
    return "总额度已满";
  }

  return "暂不可用";
}

function formatDateTime(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  const hours = `${value.getHours()}`.padStart(2, "0");
  const minutes = `${value.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
