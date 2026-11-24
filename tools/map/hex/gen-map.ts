// Hex map: the grid of tools/map/hex/grid.ts and the terrain of tools/map/hex/terrain.json to the rules' map data
// and map.svg (see ../write-map.ts). Run with: pnpm gen:map
import {fileURLToPath} from "node:url"
import {createOffsetHexGrid} from "@rzymek/rally-the-troops-module/rules"
import type {Point} from "@rzymek/rally-the-troops-module/map"
import {borderKey, writeMap, type MapSource} from "../write-map.ts"
import {GRID, LAYOUT} from "./grid.ts"

export function hexMap(): MapSource {
  const grid = createOffsetHexGrid(GRID)
  const {first, columnStep, rowStep, rowsUp, image} = LAYOUT
  const [firstColumn] = GRID.columns, [firstRow] = GRID.rows
  // grid.point() counts in half rows from row 0 of a column that isn't shifted.
  const center = (hex: string): Point => {
    const [x, y] = grid.point(hex)
    const [x0, y0] = grid.point(grid.id(firstColumn, firstRow))
    const dx = (x - x0) / (Math.sqrt(3) / 2) * columnStep
    const dy = (y - y0) * rowStep
    return [first.x + dx, first.y + (rowsUp ? -dy : dy)]
  }
  const side = columnStep * 2 / 3
  const outline = [[side, 0], [side / 2, rowStep / 2], [-side / 2, rowStep / 2], [-side, 0], [-side / 2, -rowStep / 2], [side / 2, -rowStep / 2]]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
  const centers = new Map(grid.hexes.map(hex => [hex, center(hex)]))
  const xs = [...centers.values()].map(([x]) => x), ys = [...centers.values()].map(([, y]) => y)
  const width = image?.width ?? Math.ceil(Math.max(...xs) + first.x)
  const height = image?.height ?? Math.ceil(Math.max(...ys) + first.y)
  const borders = grid.hexes.flatMap(a => grid.neighbors(a).filter(b => borderKey(a, b) === `${a}|${b}`).map(b => {
    const [ax, ay] = centers.get(a)!, [bx, by] = centers.get(b)!
    return {a, b, at: [(ax + bx) / 2, (ay + by) / 2] as Point}
  }))
  return {
    kind: "hex",
    width,
    height,
    ...(image && {image: image.href}),
    defs: `<polygon id="hexTemplate" points="${outline}"/>`,
    spaces: grid.hexes.map(hex => {
      const [x, y] = centers.get(hex)!
      return {id: hex, name: hex, anchor: [x, y], shape: `<use href="#hexTemplate" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"/>`}
    }),
    borders,
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) writeMap(hexMap())
