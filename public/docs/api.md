# API reference

```ts
import { test, expect } from "zerospikes";
```

`test` is Playwright's, with the `zs` fixture. The types (`MeasureOptions`,
`ScenarioResult`, `ZeroSpikesOptions`…) are exported too.

## `zs.measure(name, act, options?)`

Runs `act` `warmup + runs` times and checks the median of each [metric](metrics.md)
against its [limits](limits.md). A scenario over them fails the test when it ends, like
`expect.soft`, after one more CPU-profiled run. Returns the `ScenarioResult`.

| Option | Default | |
|---|---|---|
| `runs` | `5` | Measured runs |
| `warmup` | `1` | Unmeasured runs first, for JIT and caches |
| `before` | | Before every run, unmeasured: the starting state |
| `after` | | After every run, unmeasured: undo what `act` did |
| `settleMs` | `300` | Keep recording after `act`, so debounced work counts |
| `limits` | | [Fixed limits](limits.md), such as `{ "frame.max": 50 }` |
| `profileOnFail` | `true` | CPU-profile a run when a limit is missed. Chromium only |

`name` must be unique within the test.

## `zs.cycles(name, cycle, options?)`

Runs `warmup` cycles, then `cycles` more, and checks what stayed behind in memory.
Chromium only: elsewhere it returns `null`.

| Option | Default | |
|---|---|---|
| `cycles` | `5` | Measured cycles |
| `warmup` | `1` | Cycles before the baseline |
| `limits` | | Fixed limits, such as `{ "memory.nodes": 0 }` |

## `zs.drag(from, to, { steps? })`

Presses at `from`, moves to `to` in `steps` (default 20), one `pointermove` per frame,
and releases.

## `zs.frame()`

Resolves on the page's next animation frame.

## Config options

| Option | |
|---|---|
| `zsIgnoreErrors` | Errors the page may log without failing the scenario. See [Limits](limits.md) |
| `ZS_ALLOW_WORSE=1` | Environment variable: with `-u`, save the limits even when slower |

## Desktop apps (experimental)

To measure a running Tauri (Windows) or Electron app, import `test` from `zerospikes/app`
and point the project at the app's DevTools port. `page` is then the app's window, the
same one in every test: put it back in its starting state in `beforeEach`.

```ts title="playwright.config.ts"
import { defineConfig } from "@playwright/test";
import type { ZeroSpikesAppOptions } from "zerospikes/app";

export default defineConfig<ZeroSpikesAppOptions>({
  workers: 1, // the app has one window
  projects: [{ name: "tauri", use: { zsConnect: "http://127.0.0.1:9222" } }],
  webServer: {
    command: "npx tauri dev",
    env: { WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: "--remote-debugging-port=9222" },
    url: "http://127.0.0.1:9222/json/version",
    reuseExistingServer: true,
  },
});
```

Start Electron with `--remote-debugging-port=9222`. macOS and Linux webviews have no
DevTools port: measure the frontend in a browser there. `zerospikes compare` doesn't work
with apps.
