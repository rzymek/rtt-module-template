import {expect, it} from "vitest"
import {readTerrain} from "@rzymek/rally-the-troops-module/tools"
import {LAYERS} from "../layers"
import {checkTerrain, renderMap, terrainFile} from "../write-map"
import {areaMap} from "./gen-map"

// The template's map is a hex map: this keeps the area pipeline working on the sample resources/map-areas.svg.
it("imports the sample areas, adjacent where they share a border, not at a corner", () => {
  const map = areaMap()
  expect(map.spaces.map(it => `${it.id}: ${it.name}`)).toEqual(["hills: The Hills", "farm: Farm", "woods: Woods", "village: Village", "ford: The Ford", "mill: Mill"])
  const borders = map.borders.map(it => `${it.a}|${it.b}`)
  expect(borders).toContain("farm|ford")
  // They meet at a single point only.
  expect(borders).not.toContain("hills|ford")
})

it("renders the map with the area terrain", () => {
  const map = areaMap()
  const terrain = readTerrain(terrainFile("area"), LAYERS)
  expect(checkTerrain(map, terrain)).toEqual([])
  const {mapData, mapSvg} = renderMap(map, terrain)
  expect(mapData).toContain('"ford": ["farm","mill","village"]')
  expect(mapSvg).toContain('<polygon id="ford" data-anchor=')
})
