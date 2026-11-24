# <GAME NAME> — Rally the Troops module

<!--
How to use this template: copy it to <new-module>/spec.md, fill in every <…>, delete what doesn't apply (e.g. the
area map notes for a hex game). Lines starting with "> " are optional notes to keep or drop.
-->

## Game

- Name: <GAME NAME> (bgg: <id>), module id: <id> (lowercase, dashes: the server's title_id)
- Type: <block game | hex & counter | area movement | point-to-point>
- Resources in @resources/: rules PDF, map image, counter images, etc.
- Closest existing modules to learn from:
  - ours (TypeScript, same structure): @../bobby-lee (blocks, hex; the most polished), @../marengo (areas drawn as
    SVG), @../band-of-brothers (hex & counter, scenarios, LOS), @../googe-green (series rules + game data)
  - official (@../../official-modules/, plain JS, different structure: for rules ideas only): <e.g. verdun (areas +
    blocks), rommel-in-the-desert, hammer-of-the-scots (Columbia blocks)>

## Starting point

This project is a copy of @../module-template (a runnable placeholder game; see its README.md), renamed with
`pnpm rename <id> "<GAME NAME>" <bgg id>`. In the first commit:

- delete the placeholder game: `src/rules/game/*` (but keep `map.ts` and `map-data.ts` as the pattern), the
  placeholder states and their specs, the placeholder parts of `src/play/*`, `cover.png`;
- delete the map pipeline this game doesn't use (`tools/map/hex` or `tools/map/area`, and its spec), and make
  `pnpm gen:map` run the one kept (the template has `gen:map` for hexes and `gen:map:area` for areas);
- keep the generic scaffolding: configs, globals, lifecycle, the specs for names/playouts/map, the tools.

## Environment

- RTT server sources: /home/rzymek/devel/rtt/server, running at http://localhost:8080/.
- Node (bash): `PATH=/home/rzymek/.local/share/nvm/v24.15.0/bin:$PATH`.
- Deploy: `RTT_DIR=/home/rzymek/devel/rtt/server pnpm run build` — bundles, then runs tsc, lint and the tests,
  including the random playouts against the new build. The server picks it up at once.
- Checks one by one: `pnpm build:tsc`, `pnpm build:lint`, `CI=1 pnpm vitest run`.
- Fuzz: from the server dir, `timeout 180 env MAX_TIMEOUT=20000 bin/rtt-fuzz <id>`, then grep
  `fuzzer/log-<id>.txt` for errors (the default 250 ms timeout gives false failures; it runs forever).
- Shared code: `@rzymek/rally-the-troops-module` (/home/rzymek/devel/rtt/rally-the-troops-module). Use what it has
  (see its README) instead of writing your own. Generic code worth sharing goes there; you can freely contribute
  to it (tests and a README section with each addition); mention what you moved.
- Docs (spec, PLAN.md, NOTES.md) are local Markdown files in the repo.

## Step 0 — read and plan (no game code yet)

1. Extract the rules to `resources/rules.txt` (`pdftotext -layout`) and commit it, so later sessions can grep it.
   Generate the rules page: `pnpm exec rtt-rulebook resources/rules.pdf --title "<GAME NAME> - Rules"`.
2. Write `PLAN.md` (format below): the rule sections grouped into small implementation steps, in order (set-up +
   basic movement first, victory and scenarios last), each with a one-line "how to verify in the UI".
3. List the rules questions you already see (ambiguities, component counts that don't match, missing data) as
   multiple-choice questions, each with your recommendation.
4. Map data — decide how to get it and tell me:
   - Area / point-to-point map: **don't extract areas from the image.** Ask me for `resources/map-areas.svg`
     (one closed straight-line path per area, shared borders snapped; ids matching the printed names, labels as
     the names to show). `pnpm gen:map` generates the map data from it.
   - Hex map: measure the grid into `tools/map/hex/grid.ts`; ask me about borderline partial hexes at the map's
     edges (they are usually playable). Detect what terrain you can from the image, then let me correct it in the
     editor (below).
5. Stop and wait for my answers.

## Implementation loop

For each step in PLAN.md:

1. Implement the rules of that step only. Prefer data (tables in `src/rules/game/*-data.ts`, terrain layers) over
   code branches.
2. Add vitest specs for the rule logic (legal moves, edge cases, the questions I answered).
3. Run the checks and the fuzzer; fix everything they find.
4. Deploy, commit locally (one commit per step, message names the rule numbers).
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

## NOTES.md (in the repo, committed)

- Decisions: what I confirmed, with the date.
- Readings of the rules: every interpretation I confirmed or you assumed (`ASSUMED`), with the rule number.
- RTT deltas from the printed rules: where the module has to differ (e.g. soft-locks, simultaneous play turned into
  turns), and why.
- Map/component data: where it comes from, how to regenerate or correct it.
- Undo: when undo is cleared (dice, hidden information revealed, hand-off to the other player).
- Not implemented: and why.

Keep session-only state (current step, how to resume) in Claude memory too, so "continue" in a fresh session picks
up at the right step.

## Conventions (as in the template)

- States: `StateDefinition` objects in `src/rules/procedures/`, all registered in `src/rules/index.ts`.
  Sub-procedures with `call(name, env)` / `end(result)`, the caller's `_resume` reading `L.$`. What a state needs
  only while it runs lives in its `L` (typed with a `scope()` helper), not in `G`. The first state is entered with
  `call` (in on_setup), then `goto`.
- Top-level names must not clash with framework.js (`log`, `action`, `finish`, `resume`, …): `names.spec.ts` checks.
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
  What can be detected from the image is detected by a tool, but every kind of feature must be reviewable and
  correctable in the editor; never type terrain into the game's code by hand. Tell me when there's something for
  me to mark.

## Ask me for

- The areas SVG (area maps), or corrections to it.
- Terrain marking with the editor.
- Any rule reading that changes how the game plays.
