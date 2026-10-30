import { COLORS, type Token } from "./highlight";

const STATUS: Record<string, string> = {
  PASS: COLORS.string,
  SAME: COLORS.string,
  FAIL: COLORS.error,
  ERROR: COLORS.error,
  SLOWER: COLORS.error,
  NEW: COLORS.comment,
  UPDATED: COLORS.comment,
  SKIP: COLORS.comment,
  MEASURED: COLORS.comment,
  UNSURE: COLORS.warn,
};

// The colors zerospikes prints: a value over its limit is red; limits, times and hints are dim.
const CELLS = /(?<over>\d[\d.]*(?: ms| MB)? +> +\d[\d.]*)|(?<dim>\(\d[\d.]*s\)|\(\d+ vs \d+ sessions\)|p \d\.\d+)/g;

const SUMMARY =
  /(?<bad>\d+ over limits|\d+ with errors)|(?<good>all within limits)|(?<faint>\d+ limits (?:recorded|updated)|\d+ not checked \([^)]*\))|(?<dot>·)/g;

/** Colors the output of the reporter and the CLI like the terminal does. */
export function highlightOutput(code: string): Token[][] {
  return code.split("\n").map((line) => {
    const tokens: Token[] = [];
    const push = (content: string, color?: string) => {
      if (content) tokens.push({ content, color });
    };
    const dim = (content: string) => push(content, COLORS.comment);

    if (/^\s*(self time|main-thread CPU|per cycle:|CPU profile:|limits:|slower on purpose|Details, trends)/.test(line)) {
      dim(line);
      return tokens;
    }

    if (/^\s*zerospikes {2}/.test(line)) {
      let last = 0;
      for (const match of line.matchAll(SUMMARY)) {
        const { bad, good } = match.groups!;
        push(line.slice(last, match.index));
        if (bad) push(match[0], COLORS.error);
        else if (good) push(match[0], COLORS.string);
        else dim(match[0]);
        last = match.index + match[0].length;
      }
      push(line.slice(last));
      return tokens;
    }

    let rest = line;
    const status = /^(\s*)(PASS|FAIL|ERROR|NEW|UPDATED|SKIP|MEASURED|SAME|SLOWER|UNSURE)(?=\s)/.exec(line);
    if (status) {
      push(status[1]);
      push(status[2], STATUS[status[2]]);
      rest = line.slice(status[0].length);
    }
    let last = 0;
    for (const match of rest.matchAll(CELLS)) {
      const { over } = match.groups!;
      push(rest.slice(last, match.index));
      if (over) push(match[0], COLORS.error);
      else dim(match[0]);
      last = match.index + match[0].length;
    }
    push(rest.slice(last));
    return tokens.length ? tokens : [{ content: "" }];
  });
}
