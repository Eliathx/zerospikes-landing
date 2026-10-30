# Limits

Each scenario gets a limit per metric the first time it runs, from its slowest run plus
room for noise. They're saved in `__limits__/<spec>.json`, next to the spec.

## Lowering and accepting

Limits only go down on their own terms:

| You made it… | Run | Or in `npx zerospikes` |
|---|---|---|
| Faster | `npx playwright test -u` | `t` |
| Slower, on purpose | `ZS_ALLOW_WORSE=1 npx playwright test -u` | `w` |

`-u` alone never raises a limit, so it can't hide a slowdown by accident.

## Other machines

Limits record the machine they were measured on: CPU, cores, platform, browser version,
headless or not. On another machine they aren't checked: the scenario shows `SKIP` and
passes, and `-u` records that machine's own.

So commit `__limits__` when one machine records them for everyone. On hosted CI runners,
whose hardware changes, use [`zerospikes compare`](cli.md) instead.

## Fixed limits

A limit of your own, checked on every machine on top of the recorded ones:

```ts
await zs.measure("open menu", open, { limits: { "frame.max": 50 } });
await zs.cycles("open and close", cycle, { limits: { "memory.nodes": 0 } });
```

## Errors in the page

A scenario that throws halfway can look faster than one that works. If the page logs a
`console.error` or an uncaught exception while it runs, the scenario shows as `ERROR`:
the test fails with the errors, and its numbers neither pass nor set limits.

Leave out the errors you expect, by message or file:

```ts title="playwright.config.ts"
import { defineConfig } from "@playwright/test";
import type { ZeroSpikesOptions } from "zerospikes";

export default defineConfig<ZeroSpikesOptions>({
  use: { zsIgnoreErrors: ["ResizeObserver loop", /^Warning: Each child in a list/] },
});
```
