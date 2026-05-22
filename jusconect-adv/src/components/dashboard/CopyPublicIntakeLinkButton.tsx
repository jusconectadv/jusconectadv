"use client";

import { useMemo, useState } from "react";

type CopyPublicIntakeLinkButtonProps = {
  path: string;
};

export function CopyPublicIntakeLinkButton({
  path,
}: CopyPublicIntakeLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return path;
    }

    return `${window.location.origin}${path}`;
  }, [path]);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(fullUrl);
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
      className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
    >
      {copied ? "Link copiado" : "Copiar link público"}
    </button>
  );
}