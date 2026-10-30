import { CodeBlock } from "@/components/CodeBlock";
import { FEATURE_ART } from "@/components/FeatureArt";
import { HeadlineIcon } from "@/components/HeadlineIcon";
import { CopyPromptButton } from "@/components/CopyPromptButton";
import { Page, Section } from "@/components/Page";
import { Phases } from "@/components/Phases";
import { Terminal } from "@/components/Terminal";
import { TerminalScreen } from "@/components/TerminalScreen";

const EXAMPLE = `import { test } from "zerospikes";

test("filter as you type", async ({ page, zs }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox");

  await zs.measure(
    "type 'mar'",
    () => search.pressSequentially("mar"),
    { before: () => search.fill("") },
  );
});`;

/** For a coding agent: the docs it should read, then the steps, in this project. */
const SETUP_PROMPT = `Set up zerospikes in this project: Playwright tests that fail when an interaction gets slower.

Read https://zerospikes.eliath.dev/llms.txt first, then https://zerospikes.eliath.dev/docs/index.md and https://zerospikes.eliath.dev/docs/scenarios.md. They are plain Markdown.

1. Install: npm install -D zerospikes @playwright/test, then npx playwright install chromium. The project needs to be ESM ("type": "module") and @playwright/test 1.49 or later.
2. Add a Playwright config for perf tests as in the docs: testDir "perf", testMatch "**/*.perf.ts", workers 1, retries 0, reporter "zerospikes/reporter", and a webServer that serves a production build, not the dev server. If a playwright.config already exists, keep it and add a separate config or project for perf tests.
3. Find the 2 or 3 interactions in this app most likely to get slow (typing into a filter or search, sorting or opening a large list, dragging, scrolling a long page) and write one scenario for each in perf/, importing test from "zerospikes" and wrapping the interaction in zs.measure with a before() that resets the state.
4. Add a "perf" script to package.json and run it once so the first run records the limits in perf/__limits__/.
5. Tell me which interactions you chose and why, and show me the output of the run.`;

/** The example's first run records its limits. */
const FIRST_RUN = `$ npx playwright test
  PASS    filter as you type (4.1s)

  zerospikes  1 scenario · all within limits · 1 new`;

/** After a change that slows the filter down, the same test fails and names the functions at fault. */
const SLOWER_RUN = `$ npx playwright test
  FAIL    filter as you type (4.6s)

  zerospikes  1 scenario · 1 over limits
  FAIL   filter as you type › type 'mar'   input key 212 ms > 64, frame.max 205 ms > 58
       188 ms  filterRows  src/search.js:42
        14 ms  renderList  src/list.js:17`;

/** Columns of the view's metrics pane: name, last value, limit. */
const metric = (name: string, last: string, limit: string) => `    ${name.padEnd(16)}  {r:${last.padStart(9)}}  ${limit.padStart(9)}`;

/** The failed scenario opened in `npx zerospikes`, cut to what the story needs. */
const SCENARIO_VIEW = `  {b:filter as you type › type 'mar'}  {r:FAIL}

    {d:${"Metric".padEnd(16)}  ${"Last".padStart(9)}  ${"Limit".padStart(9)}}
${metric("frame.max", "205 ms", "58 ms")}
${metric("input.key", "212 ms", "64 ms")}

  {b:Where the time went}
       188 ms  filterRows  {d:src/search.js:42}
        14 ms  renderList  {d:src/list.js:17}

  {r:Slower than its limits.} {d:On purpose?} {b:w} {d:save the last run as its limits}`;

const PHASES = [
  {
    label: "Write",
    caption: (
      <>
        A Playwright test, with <code>test</code> imported from zerospikes. Here <code>zs.measure</code> types
        "mar" into the search box several times, clearing it before each, and keeps the median.{" "}
        <a href="/docs">Setup</a>
      </>
    ),
    panel: <CodeBlock lang="ts" code={EXAMPLE} title="perf/search.perf.ts" className="example-code" />,
  },
  {
    label: "First run",
    caption: "The first run passes and records a limit for each metric: its slowest time plus room for noise.",
    panel: <Terminal session={FIRST_RUN} title="Terminal" />,
    plays: true,
  },
  {
    label: "A slower change",
    caption:
      "Later, a change to the search makes every key press scan all the rows. Each key now takes 212 ms against a limit of 64, and the test fails.",
    panel: <Terminal session={SLOWER_RUN} title="Terminal" />,
    plays: true,
  },
  {
    label: "Find the cause",
    caption: (
      <>
        In <code>npx zerospikes</code>, the failed scenario lists its numbers, limits and the
        functions that took the time. If the slowdown is on purpose,{" "}
        Press <code>w</code> to save it as the new limits.
      </>
    ),
    panel: <TerminalScreen screen={SCENARIO_VIEW} title="npx zerospikes" />,
  },
];

/**
 * What it does that a plain Playwright test doesn't, as a bento grid: in each row a wide
 * card and a narrow one, alternating sides. An isometric drawing, a title and a short text each.
 */
const FEATURES = [
  {
    title: "Works on hosted CI runners",
    Art: FEATURE_ART.Runner,
    text: "zerospikes compare measures main and the pull request on the same runner, in alternating sessions, and fails only on a real slowdown.",
    wide: true,
  },
  {
    title: "Drag and scroll latency",
    Art: FEATURE_ART.Pointer,
    text: "Latency for every pointermove and wheel step, where the Event Timing API stops.",
  },
  {
    title: "Leak checks",
    Art: FEATURE_ART.Leak,
    text: "zs.cycles fails on the heap, DOM nodes or listeners an open-and-close leaves behind.",
  },
  {
    title: "Run history by branch",
    Art: FEATURE_ART.History,
    text: "Each run takes ~1KB and carries its commit and branch. npx zerospikes shows each scenario's trend across runs and branches.",
    wide: true,
  },
];

/** The questions someone has before installing it, answered from the docs. */
const FAQ = [
  {
    question: "Why zerospikes?",
    answer: (
      <>
        Measuring an interaction in DevTools means recording a trace, reading it and remembering the number for
        next time. As a test, the measurement runs on every
        change, and CI fails on the pull request that makes the interaction slower.
      </>
    ),
  },
  {
    question: "Won't noise make tests fail for no reason?",
    answer: (
      <>
        Each scenario runs once to warm up and five more times, and the median is what gets checked. A recorded
        limit leaves room above the slowest run. A local machine busy with something heavy, can still go over.
        On hosted
        CI, zerospikes measures both builds in alternating sessions and fails only on a
        slowdown of 10% or more that isn't noise. Read more at <a href="/docs/limits">Limits.</a>
      </>
    ),
  },
  {
    question: "Which browsers and apps does it work with?",
    answer: (
      <>
        Frame and input times work in any Playwright browser. CPU time, long frames, memory checks and the
        profile of a failure need Chromium. It also measures Electron apps, and Tauri apps on Windows, through
        their DevTools port (experimental).
      </>
    ),
  },
  {
    question: "How is it different from a regular Playwright test?",
    answer: (
      <>
        A Playwright test checks that the interaction works, and passes whether it takes 20 ms or 500 ms.
        A zerospikes scenario is still a Playwright test, but it also fails when the interaction takes longer
        than its limits.
      </>
    ),
  },
];

export default function Home() {
  return (
    <Page glow footer={<span>Latency and memory tests for Playwright.</span>}>
      <section className="hero" aria-labelledby="headline">
        <h1 id="headline">
          Tests that catch
          <HeadlineIcon />
          <span className="headline-accent">slow interactions.</span>
          <br />
          The first run sets the limits. Later runs fail when a change goes over them.
        </h1>
        <div className="actions">
          <a className="button" href="/docs">
            Get started
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" fill="currentColor" opacity="0.35" />
              <path
                d="M8 12h8M13 9l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <CopyPromptButton prompt={SETUP_PROMPT} label="Copy setup prompt" />
        </div>
        <div className="install">
          <CodeBlock lang="bash" code="npm install -D zerospikes" copy />
        </div>
      </section>

      <Section id="features" className="features" title="What it adds to Playwright">
        <ul className="features-grid">
          {FEATURES.map(({ title, text, wide, Art }) => (
            <li key={title} className={wide ? "wide" : undefined}>
              <Art />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="example" className="example" title="How it works">
        <Phases phases={PHASES} label="How zerospikes works" />
      </Section>

      <Section id="faq" className="faq" title="Questions">
        {FAQ.map(({ question, answer }) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </Section>
    </Page>
  );
}
