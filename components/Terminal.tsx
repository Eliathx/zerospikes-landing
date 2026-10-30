import { highlightOutput } from "@/lib/output";
import { TerminalReplay, type Step } from "./TerminalReplay";

/** The line the reporter prints when a test ends: `  PASS    filter as you type (4.1s)`. */
const TEST_LINE = /^\s+(?:PASS|FAIL|ERROR)\s{2,}(.+) \((\d+(?:\.\d+)?)s\)$/;

/**
 * A terminal session that plays itself: `$ ` starts a command, a reporter test
 * line runs with a spinner first, anything else is printed, colored like the
 * reporter's output.
 */
export function Terminal({ session, title }: { session: string; title: string }) {
  const steps: Step[] = session.split("\n").map((text) => {
    if (text.startsWith("$ ")) return { kind: "command", text: text.slice(2) };
    const [line] = highlightOutput(text);
    const test = TEST_LINE.exec(text);
    if (test) return { kind: "test", title: test[1], secs: Number(test[2]), line };
    return { kind: "output", line };
  });
  return <TerminalReplay steps={steps} title={title} />;
}
