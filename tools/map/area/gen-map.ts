// Area map: resources/map-areas.svg, drawn by hand over the map image, and the terrain of tools/map/area/terrain.json
// to the rules' map data and map.svg (see ../write-map.ts). Run with: pnpm gen:map:area
//
// map-areas.svg: in a layer (a <g>) with the id or Inkscape label "areas", one closed straight-line path per area,
// borders shared with the neighbours snapped onto each other (touching only at a corner doesn't make areas adjacent).
// Each path's id is the area's id, its label (Inkscape's, or a <title>) its name. Draw it at the size of the map
// image, so that its coordinates are the map's.
import {readFileSync} from "node:fs"
import {fileURLToPath} from "node:url"
import {DOMParser} from "@xmldom/xmldom"
import {importAreas} from "@rzymek/rally-the-troops-module/map"
import {writeMap, type MapSource} from "../write-map.ts"

const SOURCE = new URL("../../../resources/map-areas.svg", import.meta.url)
/** The map image in public/, e.g. "images/map.jpg"; without one, a plain background stands in. */
const IMAGE: string | undefined = undefined

export function areaMap(svgText = readFileSync(SOURCE, "utf8")): MapSource {
  const viewBox = /viewBox="([^"]+)"/.exec(svgText)?.[1].split(/[\s,]+/).map(Number)
  if (!viewBox) throw new Error("map-areas.svg has no viewBox")
  const {areas, borders} = importAreas(svgText, {parser: new DOMParser()})
  const n = (value: number) => Math.round(value * 10) / 10
  return {
    kind: "area",
    width: viewBox[2],
    height: viewBox[3],
    ...(IMAGE && {image: IMAGE}),
    spaces: areas.map(area => ({
      id: area.id,
      name: area.label ?? area.id,
      anchor: area.anchor,
      shape: `<polygon points="${area.polygon.map(([x, y]) => `${n(x)},${n(y)}`).join(" ")}"/>`,
    })),
    borders: borders.map(({a, b, middle, segments}) => ({a, b, at: middle, segments})),
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) writeMap(areaMap())
