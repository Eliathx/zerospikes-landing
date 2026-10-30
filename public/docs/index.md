# Getting started

zerospikes measures every frame, the input latency and the main thread's CPU time while a
Playwright scenario runs. The first run records its limits, like a snapshot; later runs
fail when a change makes the interaction slower.

## Install

```bash
npm install -D zerospikes @playwright/test
npx playwright install chromium
```

`@playwright/test` 1.49 or later, in an ESM project (`"type": "module"`).

## Configure Playwright

```ts title="playwright.config.ts"
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "perf",
  testMatch: "**/*.perf.ts",
  workers: 1, // one scenario at a time, so they don't compete for the CPU
  retries: 0,
  reporter: [["zerospikes/reporter"]],
  use: { baseURL: "http://localhost:4173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chromium" } }],
  webServer: {
    command: "npm run preview", // a production build, not a dev server
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
```

## Write a scenario

Import `test` from `zerospikes` instead of `@playwright/test`. It adds the `zs` fixture.

```ts title="perf/search.perf.ts"
import { test } from "zerospikes";

test("filter as you type", async ({ page, zs }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox");
  await zs.measure("type 'mar'", () => search.pressSequentially("mar"), {
    before: () => search.fill(""), // not measured: reset before every run
  });
});
```

## Run it

```bash
npx playwright test
```

The first run saves each scenario's limits to `perf/__limits__/search.perf.ts.json` and
passes. From then on, a scenario that gets slower fails, and points at the code that
took the time:

```output
zerospikes: "click the header" is over its limits
  frame.max             346 ms  > 146
  input.up              351 ms  > 157
  cpu.main              252 ms  > 126

  self time in one profiled run:
       319 ms  (anonymous in sortRows) @ index.js:11740
      28.5 ms  sortRows @ index.js:11738

  CPU profile: test-results/…/click-the-header.cpuprofile  (DevTools › Performance › Load profile)
```

## Next

- [Writing scenarios](scenarios.md): clicks, drags, scrolling, memory leaks
- [Limits](limits.md): lowering them, accepting a slower scenario, other machines
- [CLI and CI](cli.md): the history in the terminal, and comparing builds in CI
