import { FormSelect } from "@/components/ui/form-select";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="surface-strong rounded-[24px]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.08em] text-[#6b5f53]">
            {label}
          </span>
          <div className="text-[#6b5f53]">{icon}</div>
        </div>
        <div className="mt-3 font-display text-4xl text-[#1f1a17]">{value}</div>
      </CardContent>
    </Card>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.12em] text-[#6b5f53] uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-[1.8rem] font-semibold text-[#1f1a17]">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f5347]">{description}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  label,
  name,
  defaultValue,
  placeholder,
  help,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  help?: string;
  type?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {help ? <span className="text-xs text-[#74685b]">{help}</span> : null}
    </div>
  );
}

export function NumberInput({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type="number" min={1} name={name} defaultValue={defaultValue} />
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  rows,
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
        rows={rows ?? 6}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
}

export function SelectInput({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <FormSelect
        name={name}
        defaultValue={defaultValue ?? options[0]?.value}
        placeholder={`请选择${label}`}
        options={options}
      />
    </div>
  );
}

export function HiddenInput({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return <Input type="hidden" name={name} value={value} readOnly className="hidden" />;
}

export function CheckboxInput({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-[#65594d]">
      <Checkbox id={name} name={name} defaultChecked={defaultChecked} />
      <span>{label}</span>
    </div>
  );
}

export function PrimaryButton({ children }: { children: React.ReactNode }) {
  return <Button type="submit">{children}</Button>;
}

export function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <Button type="submit" variant="ghost" size="sm">
      {children}
    </Button>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return <UiBadge variant={tone === "default" ? "default" : "secondary"}>{children}</UiBadge>;
}

export function InfoCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="panel">
      <CardHeader className="p-0">
        <p className="text-[11px] tracking-[0.12em] text-[#6b5f53] uppercase">{eyebrow}</p>
        <CardTitle className="mt-2.5 text-xl">{title}</CardTitle>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[#5f5347]">{description}</p>
        ) : null}
      </CardHeader>
      {children ? <CardContent className="mt-4 p-0">{children}</CardContent> : null}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#d8ccbd] bg-[#f6efe6] px-5 py-6">
      <div className="text-sm font-medium text-[#241d18]">{title}</div>
      {description ? <div className="mt-1.5 text-sm leading-6 text-[#5f5347]">{description}</div> : null}
    </div>
  );
}

export function ProgressBar({
  label,
  value,
  max,
  tone = "default",
}: {
  label: string;
  value: number;
  max: number;
  tone?: "default" | "muted";
}) {
  const ratio = max <= 0 ? 0 : Math.min(value / max, 1);
  const colorClass = tone === "muted" ? "bg-[#9aa59d]" : "bg-[#61564a]";

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[#61564a]">{label}</span>
        <span className="text-[#6b5f53]">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e7ddd0]">
        <div
          className={`h-full rounded-full ${colorClass} transition-all`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
