# Device measurements (graphics plan 0.1)

> **Status: not yet measured on hardware.** Every cell below is empty until someone runs the game on the
> device. Headless `npm run shots` numbers (software or CI GPU) do not count; they only show relative cost.

## How to measure

1. Open the deployed build (or `npm run dev` reached over the LAN) with `?debug` on the device.
2. Press `F` to freeze the camera, fly to the view (I/K/J/L, U/O) or use `window.__aquobble.setCamera` from a
   desktop browser with remote debugging. Use `\` to stop the clock and `[` / `]` to step the time of day.
3. Wait about 5 seconds, then copy the overlay: FPS, worst frame (ms), draws, triangles (k).
4. For the same views on desktop, `npm run shots -- <label> --set village` (or `water`, `night`, `scale`)
   prints FPS, draws and triangles per shot.

Views are the names in `scripts/shots/views.ts` and `scripts/shots/shotSets.ts`.

## Devices

| Device | Browser | Screen / DPR | GPU | Build (commit) | Date | Measured by |
| ------ | ------- | ------------ | --- | -------------- | ---- | ----------- |
|        |         |              |     |                |      |             |

## Results

One row per device, view and time. Worst frame is the overlay's "worst" value.

| Device | View     | Time  | FPS | Worst frame (ms) | Draws | Triangles (k) | Notes |
| ------ | -------- | ----- | --- | ---------------- | ----- | ------------- | ----- |
|        | plaza    | noon  |     |                  |       |               |       |
|        | street   | noon  |     |                  |       |               |       |
|        | lane     | noon  |     |                  |       |               |       |
|        | gate     | noon  |     |                  |       |               |       |
|        | forest   | noon  |     |                  |       |               |       |
|        | meadow   | noon  |     |                  |       |               |       |
|        | coast    | noon  |     |                  |       |               |       |
|        | overview | noon  |     |                  |       |               |       |
|        | plaza    | night |     |                  |       |               |       |
|        | street   | night |     |                  |       |               |       |

## Conclusions

Not yet measured on hardware. Record here what the numbers decide, e.g. whether cloud shadows stay on for
phones (plan item 0.4).
