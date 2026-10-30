"use client";

import { useState } from "react";
import { CopyIcon } from "./CopyButton";

/** Copies a page's Markdown source, the same text agents read. */
export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      return; // Clipboard API unavailable on some origins: nothing to confirm.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" className="copy-markdown" onClick={copy} data-copied={copied || undefined}>
      <CopyIcon />
      {copied ? "Copied" : "Copy markdown"}
    </button>
  );
}
