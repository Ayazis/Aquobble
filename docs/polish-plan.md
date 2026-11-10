# Polish plan

Goal: make Aquobble feel finished. It should load gracefully, feel good to move in, look and sound alive at
every hour, run smoothly on a phone and a desktop, and give the player something to do.

## How this plan was made

From reading the code and from running the build at `fe5c61a` in headless Chromium: the town at start, the
gate, the coast, noon, sunset and night, on a desktop and a phone viewport.

That run used software rendering at about 1 FPS. So everything said here about **looks** was seen on screen.
Everything about **performance** and **feel** comes from the code and still needs a real device. The world-edge
problem in 2.5 was also read from the code, not walked.

## Where the game stands

Already good, and worth protecting: the cel-shaded town, the sunset light (the best-looking moment in the game),
grass and wind, the night sky, villagers routing around buildings, the phone profile, and a clean codebase
(17 slices, 145 passing tests).

What a new player runs into, most noticeable first:

1. **No shell around the game.** The page is black until everything has loaded (8.5 s to the first canvas
   in the test run; the JS bundle is 5.2 MB). Then the player is dropped into the world with a debug FPS counter, no
   title, no controls hint, no pause and no settings. Mouse look needs a click that nothing asks for.
2. **Nothing to do.** No goal, nothing to interact with, nothing saved.
3. **Movement is correct but raw.** Speed snaps between 0, 4 and 8 m/s, jumping has no animation, the camera is
   rigidly attached and snaps when something blocks it.
4. **The world has no edges.** Nothing handles water or the end of the map (see 2.5).
5. **The town is dead at night.** Lantern posts and windows give no light. The hand lantern is so strong that
   the character's head burns out to white.
6. **Every villager is a copy of the player**, same hair and clothes with a faint tint.
7. **Sound is one unchanging ambience**: wind, surf and bird calls, identical in the plaza, on the beach and at
   midnight.
8. **A few rough visuals.** Looking towards the sun at midday washes out the middle of the frame; water foam
   reads as noise; roads stop dead at the gates.
9. **Quality has two settings, chosen by pointer type**, so a weak laptop gets the full desktop load.

## Phases

Order is by what a player notices per unit of work. Sizes: **S** a small change, **M** one focused pull
request, **L** several.

Every phase is done when `npm run check` passes, the screenshot set from 0.2 has been re-shot and compared, and
the pull request preview has been tried on a real phone.

### Phase 0: Tools to see and measure

Small, and everything after it goes faster. Taking the screenshots for this plan meant reaching into private
fields; that should be a supported feature.

| #   | Change                                                                                                                                                                                     | Where                                             | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ---- |
| 0.1 | Debug mode behind `?debug`: the FPS counter moves here (off for players), plus draw calls and triangles from `renderer.info`, a time-of-day control and a free camera.                     | `diagnostics`, `Game`, `DayNightSystem`           | M    |
| 0.2 | `npm run shots`: boots the build in Playwright and saves fixed views (plaza, gate, coast, forest, pond) at noon, sunset and night, desktop and phone. The before/after for visual changes. | `scripts/shots/` (PNG output is gitignored)       | M    |
| 0.3 | CI smoke test: boot the built game headless, fail on a page error or a missing canvas. Catches a black-screen deploy.                                                                      | `.github/workflows/pages.yml`                     | S    |
| 0.4 | Clear the console. three r187 removed `PCFSoftShadowMap`, so shadows silently fall back to a harder filter; there is also a `toNonIndexed` warning.                                        | `rendering/RenderContext.ts:21`, geometry helpers | S    |

### Phase 1: Shell and first impression

The biggest gap. None of it touches the simulation.

| #   | Change                                                                                                                                                                                                                                                        | Where                                              | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---- |
| 1.1 | Loading screen written in plain HTML and CSS in `index.html`, so it paints before the bundle arrives. Progress from the bootstrap stages, then a fade into the first frame. Compile shaders behind it (`renderer.compileAsync`) to avoid first-second stalls. | `index.html`, `app/bootstrap.ts`, new `ui` slice   | M    |
| 1.2 | Faster load. 4.1 MB of the 5.2 MB bundle is Rapier's WASM inlined as base64: serve it as a separate `.wasm` so it streams and compiles in parallel. Start model downloads before physics is ready; today they wait in sequence.                               | `physics/rapier/`, `app/bootstrap.ts`, Vite config | M    |
| 1.3 | Title overlay: name, "Click to play" (or "Tap to play"), and the controls. That one click also starts audio and takes the mouse, which fixes both discoverability problems.                                                                                   | `ui`                                               | M    |
| 1.4 | Pause on Esc, lost pointer lock or hidden tab: stop the loop, suspend audio, show Resume, Settings and Controls. Clamp the frame time on return; today day/night jumps ahead by however long the tab was hidden.                                              | `ui`, `core/loop/GameLoop.ts`, `audio`             | M    |
| 1.5 | Settings saved in `localStorage`: music and effects volume, mouse sensitivity, invert Y, quality (auto, low, medium, high), FPS counter.                                                                                                                      | `ui`, `app`                                        | M    |
| 1.6 | One HUD style. SVG icons instead of emoji (the speaker and lantern emoji look different on every OS), one stylesheet instead of inline styles per button, safe-area insets for notched phones, no text selection or long-press menus.                         | `ui`; moves `MuteButton`, `LanternButton`          | M    |
| 1.7 | Page metadata: favicon, description, theme colour, a share image (use a sunset shot), web app manifest for a full-screen home-screen launch.                                                                                                                  | `index.html`, `public/`                            | S    |
| 1.8 | Failure screens instead of a black page: no WebGL2, bootstrap throws, WebGL context lost.                                                                                                                                                                     | `main.ts`, `ui`                                    | S    |

### Phase 2: Game feel

What the player touches every second. Keep the pure functions (`movementVelocity`, `followCamera`) pure and
tested as they grow.

| #   | Change                                                                                                                                                                                                                                                             | Where                                                         | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ---- |
| 2.1 | Interpolate rendering between simulation steps. The simulation runs at 60 Hz and its transforms are copied straight to the screen, so on a 120 or 144 Hz display the character and camera move only on some frames. Draw a blend of the previous and current step. | `core/loop/GameLoop.ts`, `rendering/TransformSyncSystem.ts`   | M    |
| 2.2 | Movement: acceleration and braking, a short grace period for jumping just after leaving a ledge, remembering a jump pressed just before landing, lower jump on early release, less steering in the air.                                                            | `player/movementVelocity.ts`, `CharacterMovementSystem.ts`    | M    |
| 2.3 | Airborne animation. `character.glb` has no jump clip (it has Idle, Walk, Run, Roll, PickUp, Punch, Death and combat clips). Source a CC0 jump and fall for the same rig, or pose it in code. Match walk and run playback to ground speed so feet do not slide.     | `player/PlayerAnimationSystem.ts`, `locomotionClip.ts`        | M    |
| 2.4 | Camera: spring follow (mostly vertical, so steps do not jolt), eased pull-in with a sphere cast instead of an instant snap on a ray, fade the character when the camera is very close, field of view that widens in portrait and slightly when running.            | `rendering/camera/`                                           | M    |
| 2.5 | Water and world edge. Nothing stops the player walking under the sea along the seabed, and the terrain collider ends 100 m out with nothing below and no respawn. Add wading and swimming at the surface, and a safety net that fades back to the last safe spot.  | `player`, `physics/PhysicsEngine.ts` (teleport), `app` config | M    |
| 2.6 | Small effects: dust at the feet when running, a puff on landing, rings and a splash in water. One pooled, instanced particle system.                                                                                                                               | new `effects` slice                                           | M    |
| 2.7 | Input: gamepad; a joystick that appears where the thumb lands, with a run toggle; keyboard camera keys as a fallback where pointer lock is refused.                                                                                                                | `player`                                                      | M    |

### Phase 3: A world that feels alive

| #   | Change                                                                                                                                                                                                                                                  | Where                                              | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---- |
| 3.1 | Light the town at night: glowing lamp glass and windows driven by the day/night darkness value, with warm light pools under the posts. Use a few real lights on desktop and painted pools on phones, since each extra light costs every lit pixel.      | `town`, `environment` (expose darkness)            | M    |
| 3.2 | Tame the hand lantern (intensity 14, hung right beside the body): it should light the ground around the player, not bleach the player.                                                                                                                  | `player/LanternFactory.ts`                         | S    |
| 3.3 | Midday grade. Retune exposure, bloom and fog at the noon keyframes so views towards the sun and the pale town wall keep their colour. Use the sunset look as the reference.                                                                             | `environment/dayKeyframes.ts`, `PostProcessing.ts` | S    |
| 3.4 | Water: a foam line and colour fade at the shore, calmer flecks that fade with distance, a gentle swell. Bake distance-to-shore from the `HeightField` into a texture, which keeps the "no extra scene pass" budget and works on phones.                 | `water`, `terrain`                                 | M    |
| 3.5 | Villagers who are not the player. The model has one palette material, so a tint cannot change hair or clothes: remap palette swatches per villager, add two or three more CC0 characters from the same set, and give the player a look nobody else has. | `townsfolk`, asset-sourcing skill                  | M    |
| 3.6 | Villager behaviour: sit on benches, stand at stalls, stop to face each other, glance at the player, thin out at night as windows light up.                                                                                                              | `townsfolk`, `navigation`                          | L    |
| 3.7 | Ambient motion: chimney smoke, fireflies at dusk near ponds, butterflies over flowers, turning windmill sails if the model allows.                                                                                                                      | `effects`, `town`                                  | M    |
| 3.8 | Somewhere to go: continue the four roads past the gates as dirt paths to a few landmarks (a pier, a hilltop view, a pond, a clearing), and give the gates arches.                                                                                       | `town`, `terrain`                                  | L    |
| 3.9 | The horizon: the sea plane ends 500 m out and, from high ground, the square edge of the terrain shows through shallow water. Fade both into haze and add a few distant rock silhouettes.                                                                | `water`, `terrain`, `environment`                  | S    |

### Phase 4: Sound

Today everything is synthesised and nothing reacts to the player.

| #   | Change                                                                                                                            | Where                           | Size |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---- |
| 4.1 | Footsteps by surface (grass, dirt, cobble, sand, wood), timed to the foot plants. Jump, landing, splash, lantern and menu sounds. | `audio`, `player`               | M    |
| 4.2 | Mix by place: surf by distance to the coast, wind by height, a murmur near the plaza, the smithy, water at ponds.                 | `audio`                         | M    |
| 4.3 | Mix by hour: birds by day, crickets and an owl at night (bird calls currently play at midnight), a chapel bell on the hour.       | `audio`, `environment`          | S    |
| 4.4 | A quiet looping theme, with its own volume slider.                                                                                | `audio`, `public/assets/audio/` | M    |
| 4.5 | Hygiene: a limiter on the master output, separate music and effects buses, audio suspended while the tab is hidden (part of 1.4). | `audio`                         | S    |

### Phase 5: Something to do

The one phase that is a product decision rather than polish (see Decisions). Without it the result is a very
polished walk. The recommendation is the lightest loop that fits the tone and reuses what exists.

| #   | Change                                                                                                                                                                                                                                  | Where                    | Size |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---- |
| 5.1 | Interaction: a prompt near anything usable, E or a tap to use it.                                                                                                                                                                       | new `interaction` slice  | M    |
| 5.2 | A collectible hunt: a seeded set of items hidden across the island (the unused `cookie.glb` is a ready candidate), the existing PickUp clip, a sparkle and a chime, a counter, progress saved, and a payoff when the last one is found. | new `collectibles` slice | L    |
| 5.3 | Villagers say a line when spoken to; signposts name where the paths lead; benches can be sat on; the bell can be rung.                                                                                                                  | `townsfolk`, `town`      | M    |
| 5.4 | A short toast the first time each landmark is reached.                                                                                                                                                                                  | `ui`                     | S    |
| 5.5 | Photo mode: hide the HUD, free the camera, scrub the time of day. Nearly free once 0.1 exists.                                                                                                                                          | `ui`, `diagnostics`      | S    |

### Phase 6: Performance and device fit

To be measured on real hardware first; the numbers below are from the code.

| #   | Change                                                                                                                                                                                                                                              | Where                                            | Size |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---- |
| 6.1 | Quality tiers that adapt. Add a medium tier, measure frame time, and step resolution and effects down or up with some hysteresis. Today a strong tablet gets the phone profile and a weak laptop gets 4096 px shadows, ambient occlusion and bloom. | `app/forDevice.ts`, `rendering/RenderQuality.ts` | M    |
| 6.2 | Shadows that follow the player. One fixed map covers 140 m of island (about 14 cm per texel on phones) and the outer coast gets none. A 40 m box around the player, snapped to texels, is sharper and draws fewer casters.                          | `environment/SunLight.ts`                        | M    |
| 6.3 | Edge smoothing on phones. With resolution capped at 1.25x and no antialiasing, edges are visibly stepped; add a cheap post-process pass.                                                                                                            | `rendering/PostProcessing.ts`                    | S    |
| 6.4 | Cheaper crowds: fewer skinned draws per villager, blob shadows and slower animation updates for distant or off-screen ones.                                                                                                                         | `townsfolk`, `player/PlayerModelFactory.ts`      | M    |
| 6.5 | Hunt stalls: the sky re-bake every 4 s is about 40 passes in one frame; spread it out or trigger it by sun movement.                                                                                                                                | `environment/DayNightSystem.ts`                  | S    |
| 6.6 | Resize properly: react to pixel-ratio changes, orientation and the mobile address bar, not only window size.                                                                                                                                        | `rendering/ViewportResizer.ts`                   | S    |
| 6.7 | Test matrix, repeated per phase: Chrome, Firefox and Safari on desktop, Safari on an iPhone, Chrome on a mid-range Android.                                                                                                                         | pull request previews                            | S    |

### Phase 7: Release hygiene

| #   | Change                                                                                                                    | Where                             | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---- |
| 7.1 | README with a screenshot and the controls. Bring the slice table in `CLAUDE.md` up to date (it lists 9 of the 17 slices). | `README.md`, `CLAUDE.md`          | S    |
| 7.2 | Clear the three lint warnings: `bootstrap` is 68 lines, and two navigation functions are over the complexity limit.       | `app/bootstrap.ts`, `navigation/` | S    |
| 7.3 | Credits screen built from `public/assets/CREDITS.md`, and a build stamp in the pause menu.                                | `ui`                              | S    |

## Order

1. Phases 0 and 1 together, as the first pull request or two. They change the first minute for every player
   and make the rest measurable.
2. Phase 2, starting with 2.1 and 2.5.
3. Phase 3, starting with 3.1 to 3.3 (small, and they fix the worst-looking moments), then 3.5.
4. Phase 4.
5. Phase 5, once decided.
6. Phase 6 items as measurements call for them; pull 6.1 to 6.3 forward if the phone preview is rough.
7. Phase 7 last.

New slices (`ui`, `effects`, `interaction`, `collectibles`) follow the usual steps: a folder with an
`index.ts`, an entry in `slices.config.ts`. New assets go through the asset-sourcing skill and
`public/assets/CREDITS.md`.

## Decisions

1. **Phase 5: add a goal, or stay a walk?** Recommended: the collectible hunt (5.1, 5.2, 5.4), with photo mode
   either way. It decides what the HUD needs, so it is worth settling before 1.6.
2. **Sound: synthesised only, or recorded?** Recommended: CC0 recordings for footsteps and music, keeping the
   synthesised wind and surf. Synthesised footsteps rarely sound right.
3. **Real devices.** Performance could not be measured while making this plan. Someone needs to open each
   pull request preview on a phone and a desktop.
