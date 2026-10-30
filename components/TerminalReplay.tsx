"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { Token } from "@/lib/highlight";
import { TerminalIcon } from "./TerminalIcon";
import { usePhase } from "./Phases";

export type Step =
  | { kind: "command"; text: string }
  /** A test the reporter shows as RUNNING, with a spinner, before its final line. */
  | { kind: "test"; title: string; secs: number; line: Token[] }
  | { kind: "output"; line: Token[] };

/** Where the replay is: the steps before `step` are done, `step` is under way. */
interface Frame {
  step: number;
  typed: number;
  tick: number;
}

const TYPE_MS = 35;
const TICK_MS = 80;
/** How long a test runs on screen, whatever its real duration: the counter speeds up to match. */
const RUN_MS = 1700;
/** Before a command is typed: shorter for the first. */
const FIRST_PROMPT_MS = 400;
const PROMPT_MS = 900;
/** Between a typed command and its output. */
const ENTER_MS = 350;
const LINE_MS = 70;
const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const DIM = "#777a73";
const YELLOW = "#f0bd72";

const tokens = (line: Token[]) =>
  line.map((token, i) => (
    <span key={i} style={token.color ? { color: token.color } : undefined}>
      {token.content}
    </span>
  ));

function prompt(text: string, cursor: boolean) {
  return (
    <>
      <span style={{ color: DIM }}>$ </span>
      {text}
      {cursor && <span className="terminal-cursor" />}
    </>
  );
}

/** How long playing `steps` takes, waits included, as the replay plays them. */
function playMs(steps: Step[]) {
  return steps.reduce((ms, step, i) => {
    if (step.kind === "command") return ms + (i ? PROMPT_MS : FIRST_PROMPT_MS) + step.text.length * TYPE_MS + ENTER_MS;
    if (step.kind === "test") return ms + Math.ceil(RUN_MS / TICK_MS) * TICK_MS;
    return ms + LINE_MS;
  }, 0);
}

function doneLine(step: Step) {
  return step.kind === "command" ? prompt(step.text, false) : tokens(step.line);
}

/**
 * A terminal that types the commands and prints the output of `steps` once it
 * scrolls into view, then waits at a new prompt. In `Phases`, it plays each time
 * its phase comes on screen. Rendered finished on the server and with reduced
 * motion. A hidden copy of the finished screen keeps the height from changing
 * while it plays.
 */
export function TerminalReplay({ steps, title }: { steps: Step[]; title: string }) {
  const done: Frame = { step: steps.length, typed: 0, tick: 0 };
  const [frame, setFrame] = useState<Frame>(done);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const phase = usePhase();
  const { active, run } = phase;
  // The phase's callbacks as of the latest render, for the replay that outlives it.
  const report = useRef(phase);
  useEffect(() => {
    report.current = phase;
  });

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPlaying(false);
    if (!active) return;
    setFrame({ step: 0, typed: 0, tick: 0 });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setPlaying(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, [active, run]);

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    (async () => {
      report.current.start(playMs(steps));
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.kind === "command") {
          await wait(i ? PROMPT_MS : FIRST_PROMPT_MS);
          for (let typed = 1; typed <= step.text.length; typed++) {
            if (cancelled) return;
            setFrame({ step: i, typed, tick: 0 });
            await wait(TYPE_MS);
          }
          await wait(ENTER_MS);
        } else if (step.kind === "test") {
          for (let tick = 0; tick * TICK_MS < RUN_MS; tick++) {
            if (cancelled) return;
            setFrame({ step: i, typed: 0, tick });
            await wait(TICK_MS);
          }
        } else {
          await wait(LINE_MS);
        }
        if (cancelled) return;
        setFrame({ step: i + 1, typed: 0, tick: 0 });
      }
      setPlaying(false);
      report.current.done();
    })();
    return () => {
      cancelled = true;
    };
  }, [playing, steps]);

  const lines: ReactNode[] = steps.slice(0, frame.step).map(doneLine);
  const current = steps[frame.step];
  if (!current) lines.push(prompt("", true));
  else if (current.kind === "command") lines.push(prompt(current.text.slice(0, frame.typed), true));
  else if (current.kind === "test") {
    const secs = ((frame.tick * TICK_MS) / RUN_MS) * current.secs;
    lines.push(
      <>
        {"  "}
        <span style={{ color: DIM }}>RUNNING</span> {current.title} <span style={{ color: DIM }}>({secs.toFixed(1)}s)</span>
      </>,
      "",
      <>
        {"  "}
        <span style={{ color: YELLOW }}>{SPINNER[frame.tick % SPINNER.length]}</span> Running tests <span style={{ color: DIM }}>(1/1)</span>
      </>,
    );
  }

  const screen = (content: ReactNode[]) => (
    <code>
      {content.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < content.length - 1 && "\n"}
        </Fragment>
      ))}
    </code>
  );

  return (
    <figure className="code-block terminal" ref={ref}>
      <figcaption>
        <TerminalIcon />
        {title}
      </figcaption>
      <div className="terminal-screen">
        <pre aria-hidden="true" className="terminal-ghost">
          {screen([...steps.map(doneLine), prompt("", true)])}
        </pre>
        <pre>{screen(lines)}</pre>
      </div>
    </figure>
  );
}
