# Rally the Troops module template

A runnable starting point for a [Rally the Troops](https://rally-the-troops.com) module in TypeScript, built with Vite
and tested with Vitest, on [`@rzymek/rally-the-troops-module`](https://github.com/rzymek/rally-the-troops-module). It holds a tiny
placeholder game, "Module Template": two sides, three pieces each; move one space or attack an enemy next to it; a die
roll per attack. The game is there to show the module's patterns once, in working code that the checks cover.

To start a new module, create a repository from this one (or copy it without `.git` and `node_modules`), then:

```sh
pnpm install
pnpm rename my-game "My Game" 12345          # id (the server's title_id), title, BGG id
```

`pnpm rename` also writes `spec.md`, the instructions for Claude, from one of two templates (and deletes both):

- `spec-template.md` (`pnpm rename`): for any machine, e.g. a claude.ai cloud environment: it clones the RTT server
  from GitHub and refers only to public repositories;
- `spec-template.local.md` (`pnpm rename:local`): for the template author's machine, with its local checkouts.

Fill in the `<…>` left in `spec.md`. The GitHub workflow does nothing in the template (its job is `if: false`);
`pnpm rename` turns it on: it then builds and checks every push, and deploys where the repository has the
`DEPLOY_HOST` variable and the deploy secrets. Then, in the first commit, delete the placeholder game and the map
pipeline you don't need (see below).

## Commands

Node 24 or later, pnpm (`corepack enable`). `RTT_DIR` is a checkout of the RTT server
(`git clone https://github.com/rzymek/rally-the-troops`, then `npm install` in it): the build goes into its
`public/<id>`.

| Command | |
|---|---|
| `pnpm run build` | bundle into `$RTT_DIR/public/<id>`, then tsc, lint and tests (with the random playouts against the build) |
| `pnpm build:tsc`, `pnpm build:lint`, `CI=1 pnpm vitest run` | the checks one by one |
| `timeout 180 env MAX_TIMEOUT=20000 pnpm fuzz` | the server's fuzzer; then look for errors in `$RTT_DIR/fuzzer/log-<id>.txt` |
| `pnpm gen:map` / `pnpm gen:map:area` | regenerate the map data and map.svg from the hex grid / the hand-drawn areas |
| `pnpm edit:terrain` | the terrain editor, at http://localhost:8765 |
| `pnpm exec rtt-rulebook resources/rules.pdf --title "My Game - Rules"` | the rules as an HTML page, in `public/info/` |

To play it on a local server: `cd $RTT_DIR && sqlite3 db < schema.sql` (once), `sqlite3 db < public/<id>/title.sql`
(once per module), `node server.js`, then http://localhost:8080/.

## Where things are

```
src/rules/                     the rules bundle (rules.js): no DOM, nothing shared at runtime with the client
  globals.ts                   G, L, R, V, P, ROLES: the names framework.js links to
  index.ts                     every state registered in P; on_setup and on_view exported
  types.ts                     GameState and its parts
  lifecycle/                   on_setup (scenarios, options), on_view (what each role may see)
  procedures/                  the states: prompts and actions (turn.ts), sub-procedures (attack.ts)
  game/                        rules logic and data used by the states; map-data.ts is generated
src/shared/                    types for both bundles (View, ViewActions), constants for the rules
src/play/                      the client (play.js): on_init, on_update, on_log; map.svg is generated
src/about.html, create.html    the game's pages on the server; create.html holds the options
public/                        copied into the build: title.sql, info/rules.html, images/
tools/map/                     map pipelines: hex/ (grid.ts, terrain.json) and area/ (terrain.json),
                               layers.ts (the terrain layers), write-map.ts (what both write)
tools/terrain-editor.ts        the terrain editor's set-up
resources/                     sources that aren't served: rules PDF, map-areas.svg, ...
```

## The map

Both pipelines write the same files: `src/rules/game/map-data.ts` (spaces, names, adjacency, terrain) and
`src/play/map.svg` (one clickable element per space, with its id and `data-anchor`; a hidden terrain overlay; the pieces
layer). So the rules and the client work with either kind of map.

- Hex map: measure the printed grid into `tools/map/hex/grid.ts` and set the map image there.
- Area map: draw `resources/map-areas.svg` over the map image (see `tools/map/area/gen-map.ts`) and set the image there.

Mark the terrain with `pnpm edit:terrain`: it edits `tools/map/<kind>/terrain.json` for the map last generated.
Add layers in `tools/map/layers.ts`. Delete the other pipeline's directory, its `gen:map` script and
`tools/map/area/gen-map.spec.ts` or the `areaMap` import in `src/play/map.spec.ts`. The placeholder game's specs use
the hex map's spaces: they go with the placeholder game.
