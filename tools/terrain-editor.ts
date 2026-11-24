// Mark the terrain the rules need, over the map: pnpm edit:terrain [port], then open http://localhost:8765.
// Edits tools/map/<hex|area>/terrain.json for the map last generated, then regenerates the map data and map.svg.
import {readFileSync} from "node:fs"
import {serveTerrainEditor, type TerrainBorder} from "@rzymek/rally-the-troops-module/tools"
import {LAYERS} from "./map/layers.ts"

const root = new URL("../", import.meta.url).pathname
const map = (): {kind: "hex" | "area", borders: TerrainBorder[]} => JSON.parse(readFileSync(`${root}tools/map/map.json`, "utf8"))
const {kind} = map()

serveTerrainEditor({
  root,
  layers: LAYERS,
  terrainFile: `tools/map/${kind}/terrain.json`,
  borders: () => map().borders,
  regenerate: [`tools/map/${kind}/gen-map.ts`],
  port: Number(process.argv[2] ?? 8765),
})
