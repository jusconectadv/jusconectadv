"use client";

import { useState } from "react";

type CopyClientLinkButtonProps = {
  url: string;
};

export function CopyClientLinkButton({ url }: CopyClientLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
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
      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      {copied ? "Link copiado" : "Copiar link do cliente"}
    </button>
  );
}