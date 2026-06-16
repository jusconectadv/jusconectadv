"use client";

import { useState } from "react";

type CopyGeneratedTemplateButtonProps = {
  text: string;
};

export function CopyGeneratedTemplateButton({
  text,
}: CopyGeneratedTemplateButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
    >
      {copied ? "Texto copiado" : "Copiar texto gerado"}
    </button>
  );
}