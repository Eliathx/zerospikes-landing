# CLI and CI

## The reporter

```ts title="playwright.config.ts"
reporter: [["zerospikes/reporter"]],
```

It prints a line per test, so it replaces `list` rather than going next to it. Each run
is saved to `zerospikes-results/` (`outputDir` to change it) with its git commit: add the
folder to `.gitignore`.

```output
  PASS    filter as you type (4.1s)
  FAIL    sort by client (3.8s)

  zerospikes  6 scenarios · 1 over limits · 1 new
  FAIL   sort by client › click the header   input down/up 246 ms > 157, frame.max 243 ms > 146
       319 ms  (anonymous in sortRows)  index.js:11740
      28.5 ms  sortRows                 index.js:11738

  Details, trends and limits: npx zerospikes
```

## `npx zerospikes`

Every scenario across past runs, in the terminal: each metric against its limit, its
trend across runs and branches, and, for a failure, the functions that took the time.

| Key | What it does |
|---|---|
| `enter` / `esc` | Open a scenario / back to the list |
| `r` | Run the suite; the view updates when it ends |
| `t` | Lower the limits the latest run beat |
| `w` | Accept a failed scenario's numbers as its limits |
| `b` | Show one branch's runs, or all |

`r` runs `npx playwright test`, or `"zerospikes": { "run": "…" }` from package.json.
`--print` prints the list once, as it does without a terminal.

## CI: `npx zerospikes compare`

Hosted runners change hardware from run to run, so recorded limits don't hold there.
Compare the pull request with main on the same runner instead:

```bash
npx zerospikes compare --baseline http://localhost:4173 --candidate http://localhost:4174
```

Both builds must already be served. It runs the suite against each in alternating
sessions, and fails (exit code 1) when a scenario is slower by at least 10% and the
difference isn't noise. Scenarios must open pages with relative URLs, since compare sets
the `baseURL`.

```output
  SAME    filter as you type › type 'mar'  (5 vs 5 sessions)
  SLOWER  sort by client › click the header  (5 vs 5 sessions)
      input.up       38.2 ms → 246 ms  +544%  p 0.004
```

`--sessions`, `--min-change`, `--fail-on-inconclusive` and `--json` tune it:
`npx zerospikes --help` lists them all.

```yaml title=".github/workflows/perf.yml"
name: perf
on: [pull_request]
jobs:
  perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/checkout@v4
        with: { ref: "${{ github.base_ref }}", path: base }
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - run: npm ci && npm run build
        working-directory: base
      - run: npx playwright install --with-deps chromium
      - run: npx vite preview --port 4174 --strictPort &
      - run: npx vite preview --port 4173 --strictPort &
        working-directory: base
      - run: npx zerospikes compare --baseline http://localhost:4173 --candidate http://localhost:4174
```

Swap the build and serve commands for your project's.
