"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface Phase {
  label: string;
  caption: ReactNode;
  panel: ReactNode;
  /** The panel plays itself (a terminal): when it ends the next phase follows, even after a chosen tab. */
  plays?: boolean;
}

interface PhaseState {
  /** Whether this phase is the one on screen: only that one plays. */
  active: boolean;
  /** Counts the times a tab was chosen, so choosing the one on screen again plays it again. */
  run: number;
  /** Called by a panel that plays itself when it starts, with how long it will take. */
  start: (ms: number) => void;
  /** Called by a panel that plays itself when it ends. */
  done: () => void;
}

const PhaseContext = createContext<PhaseState>({ active: true, run: 0, start: () => {}, done: () => {} });

/** The phase a panel is in. Outside `Phases`, always on screen. */
export const usePhase = () => useContext(PhaseContext);

/** How long a phase that doesn't play stays on screen while the phases go by themselves. */
const HOLD_MS = 5000;
/** How long a terminal stays finished before the next phase. */
const AFTER_MS = 4500;

/**
 * Steps of one story as tabs over a single panel. Once in view the phases go by
 * themselves, up to the last; choosing a tab stops that and plays its phase,
 * though a terminal still hands over to the next phase when it ends. The tab's
 * underline fills up until the phase moves on. Every panel is laid in the same
 * cell, so the tallest sets the height and changing phase doesn't move the page.
 */
export function Phases({ phases, label }: { phases: Phase[]; label: string }) {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(false);
  const [finished, setFinished] = useState(-1);
  const [run, setRun] = useState(0);
  /** The active tab's underline filling up over `ms`; `id` restarts it. Null: no next phase coming, a full line. */
  const [progress, setProgress] = useState<{ ms: number; id: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setAuto(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  const last = current === phases.length - 1;
  const { plays } = phases[current];

  useEffect(() => {
    if (last || (plays ? finished !== current : !auto)) return;
    const timer = setTimeout(() => setCurrent(current + 1), plays ? AFTER_MS : HOLD_MS);
    return () => clearTimeout(timer);
  }, [auto, current, finished, last, plays]);

  // A terminal's underline starts with the terminal, from `start`; a still phase's with the phase.
  useEffect(() => {
    setProgress((p) => (!plays && auto && !last ? { ms: HOLD_MS, id: (p?.id ?? 0) + 1 } : null));
  }, [auto, current, run, last, plays]);

  // On a narrow screen the tabs scroll sideways: keep the chosen one in the middle, without moving the page.
  useEffect(() => {
    const tab = tabs.current[current];
    const list = tab?.parentElement;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const offset = tab.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollTo({ left: list.scrollLeft + offset - (list.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [current]);

  const states = useMemo(
    () =>
      phases.map(
        (_, i): PhaseState => ({
          active: i === current,
          run,
          start: (ms) => {
            if (i < phases.length - 1) setProgress((p) => ({ ms: ms + AFTER_MS, id: (p?.id ?? 0) + 1 }));
          },
          done: () => setFinished(i),
        }),
      ),
    [phases, current, run],
  );

  const choose = (i: number) => {
    setAuto(false);
    setFinished(-1);
    setCurrent(i);
    setRun((n) => n + 1);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const by = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!by) return;
    event.preventDefault();
    const next = (current + by + phases.length) % phases.length;
    choose(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="phases" ref={ref}>
      <div className="phases-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {phases.map((phase, i) => (
          <button
            key={phase.label}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`phase-tab-${i}`}
            aria-controls={`phase-panel-${i}`}
            aria-selected={i === current}
            data-progress={i === current && progress ? "" : undefined}
            tabIndex={i === current ? 0 : -1}
            onClick={() => choose(i)}
          >
            <span className="phases-number">{i + 1}/</span>
            {phase.label}
            {i === current && progress && (
              <span key={progress.id} className="phases-progress" style={{ animationDuration: `${progress.ms}ms` }} />
            )}
          </button>
        ))}
      </div>
      <div className="phases-panels">
        {phases.map((phase, i) => (
          <div
            key={phase.label}
            role="tabpanel"
            id={`phase-panel-${i}`}
            aria-labelledby={`phase-tab-${i}`}
            className="phases-panel"
            data-active={i === current || undefined}
            inert={i !== current}
          >
            <p className="phases-caption">{phase.caption}</p>
            <PhaseContext.Provider value={states[i]}>{phase.panel}</PhaseContext.Provider>
          </div>
        ))}
      </div>
    </div>
  );
}
