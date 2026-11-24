import {readFileSync} from "node:fs"
import {expect, it} from "vitest"
import {readMapSvg} from "@rzymek/rally-the-troops-module/map"
import {readTerrain} from "@rzymek/rally-the-troops-module/tools"
import {SPACES} from "../rules/game/map-data"
import {areaMap} from "../../tools/map/area/gen-map"
import {hexMap} from "../../tools/map/hex/gen-map"
import {LAYERS} from "../../tools/map/layers"
import {renderMap, terrainFile} from "../../tools/map/write-map"

const file = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
const svg = file("./map.svg")

it("is an svg element, as play.html inlines it", () => {
  expect(svg).toMatch(/^<svg id="map"/)
})

it("has exactly the spaces of the rules, each with an anchor", () => {
  expect([...readMapSvg(svg).anchors.keys()]).toEqual(SPACES)
})

it("is up to date with its sources: run pnpm gen:map (or gen:map:area) after changing them", () => {
  const {kind} = JSON.parse(file("../../tools/map/map.json")) as {kind: "hex" | "area"}
  const generated = renderMap(kind === "hex" ? hexMap() : areaMap(), readTerrain(terrainFile(kind), LAYERS))
  expect(generated.mapSvg).toBe(svg)
  expect(generated.mapData).toBe(file("../rules/game/map-data.ts"))
})
