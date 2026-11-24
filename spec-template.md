# <GAME NAME> — Rally the Troops module

<!--
How to use this template: `pnpm rename <id> "<GAME NAME>" <bgg id>` copies it to spec.md; fill in every <…> left
there and delete what doesn't apply (e.g. the area map notes for a hex game). Lines starting with "> " are optional
notes to keep or drop.

This spec assumes nothing about the machine it runs on (e.g. a claude.ai cloud environment): only this repository
and public repositories.
-->

## Game

- Name: <GAME NAME> (bgg: <id>), module id: <id> (the server's title_id)
- Type: <block game | hex & counter | area movement | point-to-point>
- Resources in @resources/: rules PDF, map image, counter images, etc.
- Learning from other modules (all public, read-only for you):
  - this repository's own placeholder game, deleted in the first commit but kept in git history (the template's
    commits): the reference for structure and conventions. Read it before deleting it.
  - TypeScript modules on the same library: https://github.com/rzymek/rtt-lew-morski and
    https://github.com/rzymek/rtt-pieklo-na-pacyfiku (hex & counter air games, written in Polish). They predate the
    template: where they differ from it, follow the template.
  - official modules, plain JavaScript with a different structure, for rules ideas only:
    `https://git.rally-the-troops.com/modules/<name>`, e.g. <verdun (areas + blocks), rommel-in-the-desert,
    hammer-of-the-scots (Columbia blocks)>.

## Starting point

This repository was created from the module template (see README.md) and renamed with `pnpm rename`. In the first
commit:

- delete the placeholder game: `src/rules/game/*` (but keep `map.ts` and `map-data.ts` as the pattern), the
  placeholder states and their specs, the placeholder parts of `src/play/*`, `cover.png` (put the game's cover in
  its place: `cover.jpg` or `cover.png`);
- delete the map pipeline this game doesn't use (`tools/map/hex` or `tools/map/area`, and its spec), and make
  `pnpm gen:map` run the one kept (the template has `gen:map` for hexes and `gen:map:area` for areas);
- keep the generic scaffolding: configs, globals, lifecycle, the specs for names/playouts/map, the tools.

## Environment

Set it up at the start of every session (nothing is kept between sessions but the repository):

```sh
# Node 24 or later, pnpm through corepack
corepack enable
pnpm install
# The RTT server: the build goes into its public/ directory, the fuzzer and random playouts run from there.
git clone --depth 1 https://github.com/rzymek/rally-the-troops ../rally-the-troops
(cd ../rally-the-troops && npm install)
export RTT_DIR="$(cd ../rally-the-troops && pwd)"
```

- Build: `pnpm run build` (needs `RTT_DIR`) — bundles into `$RTT_DIR/public/<id>`, then runs tsc, lint and the
  tests, including the random playouts against the new build.
- Checks one by one: `pnpm build:tsc`, `pnpm build:lint`, `CI=1 pnpm vitest run`.
- Fuzz: `timeout 180 env MAX_TIMEOUT=20000 pnpm fuzz`, then grep `$RTT_DIR/fuzzer/log-<id>.txt` for errors; the
  failing games are saved as `$RTT_DIR/fuzzer/<id>-*.json`. It runs until `timeout` stops it, so its exit status is
  an error; the default 250 ms MAX_TIMEOUT gives false failures.
- To see the game, run the server (`cd $RTT_DIR && sqlite3 db < schema.sql && sqlite3 db < public/<id>/title.sql &&
  node server.js`, http://localhost:8080/) — only if the environment can show it; I verify on my own machine.
- Shared code: `@rzymek/rally-the-troops-module` from npm. Read its README
  (`node_modules/@rzymek/rally-the-troops-module/README.md`) and use what it has instead of writing your own. Its
  source is https://github.com/rzymek/rally-the-troops-module, read-only for you: put generic code in this module,
  and list it in NOTES.md under "Library candidates" (what, where, why it is generic).
- The server's docs: `$RTT_DIR/docs` (e.g. `docs/overview/module.md`).
- Docs (spec, PLAN.md, NOTES.md) are Markdown files in this repository.
- Work on the branch you are given; commit and push it after each step.

## Step 0 — read and plan (no game code yet)

1. Extract the rules to `resources/rules.txt` (`pdftotext -layout`, from poppler-utils) and commit it, so later
   sessions can grep it. Generate the rules page: `pnpm exec rtt-rulebook resources/rules.pdf --title "<GAME NAME> -
   Rules"` (needs poppler-utils and Ghostscript; if they can't be installed, tell me and I'll generate it).
2. Write `PLAN.md` (format below): the rule sections grouped into small implementation steps, in order (set-up +
   basic movement first, victory and scenarios last), each with a one-line "how to verify in the UI".
3. List the rules questions you already see (ambiguities, component counts that don't match, missing data) as
   multiple-choice questions, each with your recommendation.
4. Map data — decide how to get it and tell me:
   - Area / point-to-point map: **don't extract areas from the image.** Ask me for `resources/map-areas.svg`
     (one closed straight-line path per area, shared borders snapped; ids matching the printed names, labels as
     the names to show). `pnpm gen:map` generates the map data from it.
   - Hex map: measure the grid into `tools/map/hex/grid.ts`; ask me about borderline partial hexes at the map's
     edges (they are usually playable). Detect what terrain you can from the image, then I correct it in the
     editor (below).
5. Stop and wait for my answers.

## Implementation loop

For each step in PLAN.md:

1. Implement the rules of that step only. Prefer data (tables in `src/rules/game/*-data.ts`, terrain layers) over
   code branches.
2. Add vitest specs for the rule logic (legal moves, edge cases, the questions I answered).
3. Run the checks and the fuzzer; fix everything they find.
4. Commit (one commit per step, message names the rule numbers) and push.
5. Update `PLAN.md` (status) and `NOTES.md` (see below).
6. **Stop** after steps that change how the game plays (marked STOP in PLAN.md); batch the rest (data fixes, UI
   polish, refactors) and carry on. At each stop, ask me to verify with a short checklist covering everything since
   the last stop: what to click, what should happen, which questions are still open. Don't continue until I reply.

Repeat until all rules, scenarios and variants are done, then propose a polish pass.

When the rules are unclear mid-step: ask (with options and your recommendation) instead of guessing silently.
If it's minor, pick the most literal reading, mark it `ASSUMED` in NOTES.md, and list it at the stop.

## PLAN.md (in the repo, committed)

A status legend (`[ ]` todo, `[~]` in progress, `[x]` done), the scope (what is left out and why), then one table:

| # | Step | Rules | How to verify in the UI |
|---|------|-------|-------------------------|
| 1 | [x] **Scrub the template** — … | — | Create a game: an empty map, no errors in the console. |
| 2 | [ ] **Map** — … | 2.0 | Terrain overlay matches the printed map. |
| 3 | [ ] … | … | **STOP** — … |

End it with a "Resume" section: the current step and what to do next, kept up to date. A new session has nothing
else to go on: "continue" means read spec.md, PLAN.md and NOTES.md, set up the environment, and carry on from there.

## NOTES.md (in the repo, committed)

- Decisions: what I confirmed, with the date.
- Readings of the rules: every interpretation I confirmed or you assumed (`ASSUMED`), with the rule number.
- RTT deltas from the printed rules: where the module has to differ (e.g. soft-locks, simultaneous play turned into
  turns), and why.
- Map/component data: where it comes from, how to regenerate or correct it.
- Undo: when undo is cleared (dice, hidden information revealed, hand-off to the other player).
- Library candidates: generic code that could move to `@rzymek/rally-the-troops-module`.
- Not implemented: and why.

## Conventions (as in the template)

- States: `StateDefinition` objects in `src/rules/procedures/`, all registered in `src/rules/index.ts`.
  Sub-procedures with `call(name, env)` / `end(result)`, the caller's `_resume` reading `L.$`. What a state needs
  only while it runs lives in its `L` (typed with a `scope()` helper), not in `G`. The first state is entered with
  `call` (in on_setup), then `goto`.
- Top-level names must not clash with the framework's (`log`, `action`, `finish`, `resume`, …): `names.spec.ts`
  checks.
- The rules and the client share types only. Constants or code both bundles import at runtime break rules.js:
  give the client its own copy (or generate it).
- Options: checkboxes in `create.html`, read with `normalizeOptions()` in on_setup.
- Hidden information: `on_view` sends each role only what it may see (with an `on_view.spec.ts`); reveal things only
  after the undo stack is cleared.
- Dice: only `rollDie()` from the library (it clears undo first), and only in a Roll state whose button names what
  it is for (`rollButton(label)`), after a log line giving the context (what for, modifiers, what is needed).
- Log: `.h1` / `.h2` headings; pieces and places written with `ref(kind, id, name)` from the library, rendered by
  `createLogRenderer` on the client; extra classes (`.hit`, `.loss`, …) for colour.
- Clicks: verb lists in `src/play/actions.ts`, resolved with `actionFor()`; legal targets get `legal-<verb>` classes.
- Tests: `stubFramework()`, the `vi.mock("../globals", …)` pattern, `offered()`, `gotoRecorder()`, dice as a queue
  (see the template's specs); `playout.spec.ts` plays random games against the build.
- Lint: no warnings left (`pnpm build:lint`).

## UI requirements (from the first step, not as a late polish)

- Undo: every action undoable until randomness or hidden information is revealed.
- Dice: never roll in the background (see Conventions). No roll comes as a surprise, and the player can still undo
  before it, as the roll itself can't be undone.
- Selection: clicking a piece highlights its legal destinations/targets; clicking a highlighted space or piece acts.
  Other actions as buttons with the rule's name.
- Prompts explain *why* an expected option is unavailable (e.g. "cannot advance: …").
- Log: entries separated and color-coded by action type; piece and place names highlight on hover and pan to on
  click (including pieces revealed later, but never giving away hidden ones).
- Menu: "Rules" (the rulebook page, new tab; also linked from about.html), "Terrain overlay" showing what the rules
  know about the map (spaces, adjacency, roads, terrain, objectives) to check against the printed map; a toolbar
  button to hide the pieces.
- `#turn_info` (in the aside): turn, phase, and what else the players need at a glance.
- Pieces: drawn to match <the look of the game image / counter sheets>; stacks and crowded areas stay readable.

## Tools

- TypeScript only (no Python) for tools: map import, data generation, editors.
- `pnpm gen:map` — regenerate the map data and map.svg from the sources; `map.spec.ts` fails when they are stale.
- `pnpm edit:terrain` — the terrain editor (http://localhost:8765) over the map: every terrain layer of
  `tools/map/layers.ts` (spaces, borders/hexsides, named places, set-up and entry areas, …) can be marked there.
  I run it on my machine. What can be detected from the image is detected by a tool, but every kind of feature must
  be reviewable and correctable in the editor; never type terrain into the game's code by hand. Tell me when
  there's something for me to mark, and pull `tools/map/*/terrain.json` (and the regenerated files) when I've
  pushed it.

## Ask me for

- The areas SVG (area maps), or corrections to it.
- Terrain marking with the editor.
- The rulebook page, if the PDF tools can't be installed.
- Any rule reading that changes how the game plays.
