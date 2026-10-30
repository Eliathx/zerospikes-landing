import { Fragment } from "react";
import { CopyButton } from "./CopyButton";
import { highlight, isLanguage, type Token } from "@/lib/highlight";
import { highlightOutput } from "@/lib/output";

interface Props {
  code: string;
  /** Without a known language the code is shown as plain text. `output` colors reporter output. */
  lang?: string;
  /** Shown in a header above the code, usually the file name. */
  title?: string;
  /** Adds a floating copy icon in the top right corner. */
  copy?: boolean;
  className?: string;
}

/** Highlighted at build time: ships no JavaScript. */
export async function CodeBlock({ code, lang, title, copy, className }: Props) {
  const lines: Token[][] =
    lang === "output"
      ? highlightOutput(code)
      : isLanguage(lang)
        ? await highlight(code, lang)
        : code.split("\n").map((content) => [{ content }]);
  const block = (
    <pre className={className}>
      <code>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {line.map((token, j) => (
              <span key={j} style={token.color ? { color: token.color } : undefined}>
                {token.content}
              </span>
            ))}
            {i < lines.length - 1 && "\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  );
  if (!title && !copy) return block;
  return (
    <figure className="code-block">
      {title && (
        <figcaption>{title}</figcaption>
      )}
      {copy && <CopyButton />}
      {block}
    </figure>
  );
}
