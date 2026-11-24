# <GAME NAME> — Rally the Troops module

<!--
How to use this template: copy it to <new-module>/spec.md, fill in every <…>, delete the
sections that don't apply (e.g. "Area map" for a hex game). Lines starting with "> " are
optional notes to keep or drop.
-->

## Game

- Name: <GAME NAME> (bgg: <id>)
- Type: <block game | hex & counter | area movement | point-to-point>
- Resources in @resources/: rules PDF, map image, counter images, etc
- Closest existing modules to learn from (in @../../official-modules/): <e.g. verdun (areas + blocks), rommel-in-the-desert, hammer-of-the-scots (Columbia blocks)>

## Starting point

This project is a copy of the Marengo module. Replace Marengo with game name: in the first commit,
remove all Marengo rules, data and references (keep only the generic scaffolding).

## Environment

- RTT server sources: /home/rzymek/devel/rtt/server, running at http://localhost:8080/.
- Deploy: `RTT_DIR=/home/rzymek/devel/rtt/server pnpm run build` — the server picks it up at once.
- Node (bash): `PATH=/home/rzymek/.local/share/nvm/v24.15.0/bin:$PATH`.
- Checks: `pnpm build:tsc`, `pnpm build:lint`, `CI=1 pnpm vitest run`.
- Fuzz: from the server dir, `timeout 180 env MAX_TIMEOUT=20000 bin/rtt-fuzz <module>`, then grep
  `fuzzer/log-<module>.txt` for errors (the default 250 ms timeout gives false failures; it runs forever).
- Generic code worth sharing goes to `@rzymek/rally-the-troops-module`
  (/home/rzymek/devel/rtt/rally-the-troops-module) — you can freely contribute there; mention what you moved.

## Step 0 — read and plan (no game code yet)

1. Extract the rules to `resources/rules.txt` (`pdftotext -layout`) and commit it, so later sessions can grep it.
2. Write `PLAN.md`: the rule sections grouped into small implementation steps, in order (set-up + basic movement
   first, victory and scenarios last), each with a one-line "how to verify in the UI".
3. List the rules questions you already see (ambiguities, component counts that don't match, missing data) as
   multiple-choice questions.
4. Map data — decide how to get it and tell me:
   - Area / point-to-point map: **don't extract areas from the image.** Ask me for `resources/map-areas.svg`
     (one closed straight-line path per area, shared borders snapped; rects for boxes/tracks; ids or labels
     matching the printed names). Generate map data from it with `pnpm gen:map`.
   - Hex map: detect the grid and terrain from the image, then let me correct it in the editor (below).
5. Stop and wait for my answers.

## Implementation loop

For each step in PLAN.md:

1. Implement the rules of that step only. Prefer data (tables in `src/rules/game/*-data.ts`) over code branches.
2. Add vitest specs for the rule logic (legal moves, edge cases, the questions I answered).
3. Run checks + fuzz; fix everything they find.
4. Deploy, commit locally (one commit per step, message names the rule numbers).
5. Update `PLAN.md` (done / next) and `NOTES.md` (see below).
6. **Stop** after steps that change how the game plays; batch the rest (data fixes, UI polish, refactors) and
   carry on. At each stop, ask me to verify with a short checklist covering everything since the last stop:
   what to click, what should happen, which questions are still open. Don't continue until I reply.

Repeat until all rules, scenarios and variants are done, then propose a polish pass.

When the rules are unclear mid-step: ask (with options and your recommendation) instead of guessing silently.
If it's minor, pick the most literal reading, mark it `ASSUMED` in NOTES.md, and list it at the stop.

## NOTES.md (in the repo, committed)

- Readings of the rules: every interpretation I confirmed or you assumed, with the rule number.
- Map/component data: where it comes from, how to regenerate or correct it.
- Undo: when undo is cleared (dice, hidden information revealed, hand-off to the other player).
- Not implemented: and why.

Keep session-only state (current step, how to resume) in Claude memory too, so "continue" in a fresh
session picks up at the right step.

## UI requirements (from the first step, not as a late polish)

- Undo: every action undoable until randomness or hidden information is revealed.
- Dice: never roll in the background. Before every roll, stop and give the rolling player a Roll button; the
  last log entry before it gives the context (what is being rolled for, modifiers, what result is needed).
  This way no roll comes as a surprise, and the player can still undo before the roll, which can't be undone.
- Selection: clicking a piece highlights its legal destinations/targets; clicking a piece on a legal destination
  moves there. Actions as buttons with the rule's name.
- Prompts explain *why* an expected option is unavailable (e.g. "cannot advance: …") — also in the log.
- Log: entries separated and color-coded by action type; piece and place names highlight on hover and pan to
  on click (including pieces revealed later).
- Menu: `add_main_menu_item("Terrain overlay", toggleTerrainOverlay)` showing what the rules know about the map
  (areas/hexes, adjacency, roads, terrain, objectives), to check against the printed map.
- Pieces: drawn to match <the look of the game image / counter sheets>; stacks and crowded areas stay readable.

## Tools

- TypeScript only (no Python) for tools: map import, data generation, editors.
- `pnpm gen:map` — regenerate map data from the source files.
- `pnpm edit:terrain` — local web editor (localhost) over the map image, to mark/fix terrain features
  (e.g. border/hexside types, penalties, roads) that the import can't know; it saves to a JSON file under
  `tools/map/` that `gen:map` validates. Tell me when there's something for me to mark.

## Ask me for

- The areas SVG (area maps), or corrections to it.
- Terrain marking with the editor.
- Any rule reading that changes how the game plays.
