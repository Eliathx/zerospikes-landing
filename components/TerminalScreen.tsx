import { Fragment } from "react";
import { COLORS } from "@/lib/highlight";
import { TerminalIcon } from "./TerminalIcon";

/** `{r:…}` red, `{g:…}` green, `{d:…}` dim, `{b:…}` bold: the few styles the zerospikes view prints. */
const MARKUP = /\{([rgdb]):([^}]*)\}/g;

const STYLE = {
  r: { color: COLORS.error },
  g: { color: COLORS.string },
  d: { color: COLORS.comment },
  b: { fontWeight: 600 },
} as const;

function line(text: string) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(MARKUP)) {
    parts.push(text.slice(last, match.index));
    parts.push(
      <span key={match.index} style={STYLE[match[1] as keyof typeof STYLE]}>
        {match[2]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

/** A still screen of a full-screen terminal app, like `npx zerospikes`, written in `MARKUP`. */
export function TerminalScreen({ screen, title }: { screen: string; title: string }) {
  const lines = screen.split("\n");
  return (
    <figure className="code-block terminal">
      <figcaption>
        <TerminalIcon />
        {title}
      </figcaption>
      <pre>
        <code>
          {lines.map((text, i) => (
            <Fragment key={i}>
              {line(text)}
              {i < lines.length - 1 && "\n"}
            </Fragment>
          ))}
        </code>
      </pre>
    </figure>
  );
}
