"use client";

import { useState } from "react";

type MaskType = "cpfCnpj" | "phone" | "whatsapp";

type MaskedInputProps = {
  id?: string;
  name: string;
  mask: MaskType;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatCpfCnpj(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length > 11) {
    return formatCnpj(digits);
  }

  return formatCpf(digits);
}

function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatWhatsapp(value: string): string {
  const digits = onlyDigits(value).slice(0, 13);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.startsWith("55")) {
    const withoutCountryCode = digits.slice(2);

    if (withoutCountryCode.length <= 10) {
      return `55 ${withoutCountryCode
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")}`;
    }

    return `55 ${withoutCountryCode
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")}`;
  }

  return formatPhone(digits);
}

function applyMask(value: string, mask: MaskType): string {
  if (mask === "cpfCnpj") {
    return formatCpfCnpj(value);
  }

  if (mask === "whatsapp") {
    return formatWhatsapp(value);
  }

  return formatPhone(value);
}

export function MaskedInput({
  id,
  name,
  mask,
  defaultValue,
  placeholder,
  required,
  className,
}: MaskedInputProps) {
  const [value, setValue] = useState(() => applyMask(defaultValue ?? "", mask));

  return (
    <input
      id={id}
      name={name}
      value={value}
      required={required}
      placeholder={placeholder}
      inputMode="numeric"
      autoComplete="off"
      onChange={(event) => {
        setValue(applyMask(event.target.value, mask));
      }}
      className={className}
    />
  );
}