"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
};

type Props = {
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
};

export function FormSelect({
  name,
  defaultValue,
  value,
  onValueChange,
  placeholder,
  options,
  disabled,
}: Props) {
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? value ?? "");
  const currentValue = value ?? innerValue;

  return (
    <Select
      name={name}
      value={currentValue}
      onValueChange={(nextValue) => {
        if (value === undefined) {
          setInnerValue(nextValue);
        }
        onValueChange?.(nextValue);
      }}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
