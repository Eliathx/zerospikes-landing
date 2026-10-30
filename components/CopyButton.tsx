"use client";

import { useState } from "react";

/** Two overlapping sheets, drawn on the pixel grid so the 1px strokes stay sharp. */
export function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M5.5 5.5h10v10h-10z" />
      <path d="M10.5 5.5v-5h-10v10h5" />
    </svg>
  );
}

/** Floating copy icon, two overlapping sheets: copies the text of the code block it sits in. */
export function CopyButton() {
  const [copied, setCopied] = useState(false);

  async function copy(event: React.MouseEvent<HTMLButtonElement>) {
    const text = event.currentTarget.closest(".code-block")?.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // Clipboard API unavailable on some origins: nothing to confirm.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" className="copy-button" onClick={copy} aria-label={copied ? "Copied" : "Copy code"} data-copied={copied || undefined}>
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      ) : (
        <CopyIcon />
      )}
    </button>
  );
}
