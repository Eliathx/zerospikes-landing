# Metrics

Each metric is the median of the measured runs. Times are in ms.

## `zs.measure`

| Metric | What it is |
|---|---|
| `frame.max` | Longest gap between two frames |
| `frame.slow` | Frames longer than two display frames (> 33.4 ms) |
| `frame.long` | Long animation frames (> 50 ms). Chromium only |
| `input.down` / `input.move` / `input.up` | Worst time from a pointer event to the next frame, per phase of a gesture |
| `input.key` / `input.wheel` | Same for key presses and wheel steps |
| `input.click` | Same for a click with no pointerup before it, such as Enter on a button. After a pointerup, its time is in `input.up` |
| `cpu.main` | Time the main thread spent running. It leaves out other programs, so it holds still on a busy machine. Chromium only |

A metric only shows when its event happened: a click has `input.down` and `input.up`,
typing has `input.key`.

`frame.max` and `input.*` over 50 ms, the point where a delay is visible, show a warning.
Only the limits decide pass or fail.

## `zs.cycles`

What stays behind after the cycles, with garbage collected before every sample. Chromium
only.

| Metric | What it is |
|---|---|
| `memory.heapMB` | JS heap growth, in MB. Memory held by `ArrayBuffer`s, canvases and the GPU isn't in it |
| `memory.nodes` | DOM node growth, detached nodes included |
| `memory.listeners` | Event listener growth |
