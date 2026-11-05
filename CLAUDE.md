# Aquobble: conventions

Low-poly Three.js web game, static build on GitHub Pages. TypeScript, Vite, ECS (miniplex), Rapier physics.

## Commands

- `npm run dev`: dev server on http://localhost:5173
- `npm run check`: lint + format check + tests + build (CI runs the same steps; deploy fails if any fail)
- `npm test` / `npm run lint` / `npm run format`

## Architecture

**Entity-Component-System.** Entities are plain objects in a miniplex `World` (`GameWorld`).

- **Component** = data only, no methods (`Transform`, `PhysicsBody`, `RenderObject`, `Rock`).
- **System** = a class implementing `System { update(dt) }` with one job, querying `world.with(...)`.
- **Fixed systems** run at 60 Hz (simulation: physics, game rules). **Frame systems** run once per frame
  (presentation: transform sync, camera, render). Order matters; see `src/app/bootstrap.ts`.

**Simulation vs presentation.** Simulation code never touches three.js objects; it writes `Transform`.
`TransformSyncSystem` copies transforms onto three.js objects. Core math types (`Vec3`, `Quat`) are plain
interfaces, structurally compatible with three.js and Rapier.

**Vertical slices** under `src/`, one folder per feature, each with an `index.ts` as its public API:

| Slice                          | Owns                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `core`                         | ECS world, `System`, `GameLoop`, math types, `Random`. Depends on nothing.                                           |
| `physics`                      | `PhysicsEngine` port + `RapierPhysicsEngine`, `PhysicsBody` component, step/pose systems                             |
| `rendering`                    | three.js renderer/scene/camera, post-processing, `RenderObject` component, sync systems                              |
| `environment`                  | sky, sun, fog, image-based lighting                                                                                  |
| `terrain`                      | noise, `HeightField`, generator, mesh + collider spawner                                                             |
| `water`, `vegetation`, `rocks` | feature slices                                                                                                       |
| `app`                          | composition root (`bootstrap.ts`) and `GameConfig`. The only place that `new`s concrete classes from several slices. |

**Rules (enforced by ESLint where possible):**

- Import other slices only through their alias index: `import { X } from '@physics'`, never `@physics/Foo`
  and never `../../`. Inside a slice use relative imports.
- A slice that adds a component declares it with module augmentation in the component's own file:
  `declare module '@core/ecs/Entity' { interface Entity { foo?: Foo } }`. Files that use another slice's
  component add `import type {} from '@thatSlice';`.
- Dependency injection via constructor; depend on interfaces (`PhysicsEngine`, `Random`, `Noise2D`,
  `HeightSampler`), wire concrete classes in `app/`.
- Many small files: one exported type/class per file, file named after it. Max 150 lines per file (lint).
- New physics work goes through `PhysicsEngine`; extend the interface rather than importing Rapier elsewhere.
- Randomness is always an injected `Random` (seeded), never `Math.random()`, so worlds are reproducible.

## Adding a slice

1. Create `src/<name>/` with an `index.ts` exporting its public API.
2. Add `'<name>'` to `SLICES` in `slices.config.ts`. That single list drives the Vite/Vitest aliases and the
   ESLint boundary rule; TypeScript resolves `@<name>` through the `@*` wildcard in `tsconfig.json`.

`slices.config.test.ts` fails if a folder under `src/` is missing from the list (or the other way round), or a
slice has no `index.ts`.

## Naming

- PascalCase file = exported class/interface name (`WeatherSystem.ts`); camelCase for function modules
  (`populateWorld.ts`).
- Interfaces have plain names (`PhysicsEngine`); implementations name their technology or strategy
  (`RapierPhysicsEngine`, `ValueNoise`, `SeededRandom`).
- Systems end in `System`, factories in `Factory` (build three.js objects), spawners in `Spawner` (add entities).
- Tests sit next to the code as `*.test.ts` (Vitest, Node environment, no browser).

## Assets

See README: `npm run assets:search|fetch|use`. Raw downloads in `assets/library/` are gitignored; only
optimised, used assets go to `public/assets/` with a line in `public/assets/CREDITS.md`. Asset binaries are
committed only from `public/assets/`; `.gitignore` blocks them (and all archives) everywhere else.
