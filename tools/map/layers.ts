// The terrain the rules know about, for both map pipelines and the terrain editor: each layer is a list of spaces
// (hexes or areas), or of borders between two adjacent spaces ("<id>|<id>", ids sorted). They are kept in
// tools/map/<hex|area>/terrain.json, marked with `pnpm edit:terrain`, and gen-map writes them into
// src/rules/game/map-data.ts (TERRAIN) and the terrain overlay of src/play/map.svg.
//
// Add a layer here for every feature the rules need, even ones a detector reads off the map image: the editor must be
// able to correct all of them. Never type terrain into the game's code by hand.
import type {TerrainLayer} from "@rzymek/rally-the-troops-module/tools"

export const LAYERS = {
  rough: {kind: "space", label: "Rough", color: "#8b5a2b", scale: 0.85},
  red_start: {kind: "space", label: "Red set-up", color: "#d22", scale: 0.45},
  blue_start: {kind: "space", label: "Blue set-up", color: "#22d", scale: 0.45},
  river: {kind: "border", label: "River", color: "#1e90ff"},
} satisfies Record<string, TerrainLayer>

export type LayerName = keyof typeof LAYERS
