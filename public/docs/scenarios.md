# Writing scenarios

A scenario is one `zs.measure` call: the interaction in `act`, run several times. Every
run must start from the same state, so put the page back with `before` or `after`, which
aren't measured.

## Typing

```ts
const search = page.getByRole("searchbox");
await zs.measure("type 'mar'", () => search.pressSequentially("mar"), {
  before: () => search.fill(""),
});
```

Use `pressSequentially`: `fill` sets the value in one step and produces no key events.

## Clicking

```ts
await zs.measure("click the header", () => page.getByRole("button", { name: /^Client/ }).click());
```

## Dragging

```ts
await zs.measure("drag the border", () => zs.drag([x, y], [x + 160, y]), {
  after: () => zs.drag([x + 160, y], [x, y], { steps: 2 }), // put it back
});
```

`zs.drag` sends one `pointermove` per frame, so slow frames slow the gesture down like
they would for a person.

## Scrolling

```ts
await zs.measure(
  "15 wheel steps",
  async () => {
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 400);
      await zs.frame(); // a frame between events
    }
  },
  { before: () => body.evaluate((el) => void (el.scrollTop = 0)) },
);
```

## Memory leaks

```ts
await zs.cycles("open and close 10 invoices", async () => {
  for (let i = 0; i < 10; i++) {
    await page.locator(".grid-row").nth(i).click();
    await page.getByRole("button", { name: "Close detail" }).click();
  }
});
```

The cycle must leave the page as it found it. A leak shows as growth in `memory.nodes`
and `memory.listeners`. Chromium only.

## Guidelines

- One interaction per scenario: one that does five things hides which one regressed.
- Measure a production build, with `workers: 1`.
- Turn off overlays that animate on their own, such as live performance meters.
- Keep names stable: they identify the scenario's limits.
