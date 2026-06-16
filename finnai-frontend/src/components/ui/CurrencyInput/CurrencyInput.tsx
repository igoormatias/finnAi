"use client";

import * as React from "react";

import { maskCurrencyBRL } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";

import { Input } from "../Input";

type CurrencyInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export const CurrencyInput = ({
  value,
  onChange,
  className,
  placeholder = "R$ 0,00",
  inputMode = "decimal",
  autoComplete = "off",
  ...props
}: CurrencyInputProps) => {
  return (
    <Input
      type="text"
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(maskCurrencyBRL(e.target.value))}
      className={cn(className)}
      {...props}
    />
  );
};
