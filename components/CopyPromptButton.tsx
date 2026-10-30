"use client";

import { useState } from "react";

/** Copies a prompt that hands the setup to a coding agent. */
export function CopyPromptButton({ prompt, label }: { prompt: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      return; // Clipboard API unavailable on some origins: nothing to confirm.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" className="text-link" onClick={copy} data-copied={copied || undefined}>
      {copied ? "Copied" : label}
    </button>
  );
}
